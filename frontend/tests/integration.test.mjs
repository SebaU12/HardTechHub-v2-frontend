import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('typescript')
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const temporary = await mkdtemp(join(tmpdir(), 'hardtech-api-test-'))
after(() => rm(temporary, { recursive: true, force: true }))
const modules = [
  'api/axios', 'api/errors', 'services/authService', 'services/catalogService',
  'services/ordersService', 'services/analyticsServices',
  'services/compatibilityServices', 'services/inventoryService', 'utils/catalog',
  'utils/authSession', 'utils/orderTotals',
]
for (const name of modules) {
  const source = await readFile(join(root, 'src', `${name}.ts`), 'utf8')
  let code = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
  code = code.replaceAll('import.meta.env', '({ DEV: true })')
    .replace(/from ['"]axios['"]/g, `from '${pathToFileURL(require.resolve('axios')).href}'`)
    .replace(/from (['"])(\.\.?\/[^'"]+)\1/g, 'from $1$2.mjs$1')
  const target = join(temporary, `${name}.mjs`)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, code)
}
const load = name => import(pathToFileURL(join(temporary, `${name}.mjs`)).href)
const api = await load('api/axios')
const auth = await load('services/authService')
const catalog = await load('services/catalogService')
const orders = await load('services/ordersService')
const analytics = await load('services/analyticsServices')
const compatibility = await load('services/compatibilityServices')
const inventory = await load('services/inventoryService')
const errors = await load('api/errors')
const catalogUtils = await load('utils/catalog')
const authSession = await load('utils/authSession')
const orderTotals = await load('utils/orderTotals')

function mock(client, data) {
  const calls = []
  client.defaults.adapter = async config => {
    calls.push(config)
    return { data, status: 200, statusText: 'OK', headers: {}, config }
  }
  return calls
}

test('API clients use local proxy, shared headers and service-specific timeouts', () => {
  api.setAccessToken('example')
  for (const client of [
    api.identityApi,
    api.catalogApi,
    api.orderApi,
    api.compatibilityApi,
    api.analyticsApi,
    api.inventoryApi,
  ]) {
    assert.equal(client.defaults.headers.common.Authorization, 'Bearer example')
    assert.equal(client.defaults.baseURL, '/')
    assert.equal(client.defaults.headers.Accept, 'application/json')
  }
  assert.equal(api.identityApi.defaults.timeout, api.DEFAULT_API_TIMEOUT_MS)
  assert.equal(api.compatibilityApi.defaults.timeout, api.DEFAULT_API_TIMEOUT_MS)
  assert.equal(api.analyticsApi.defaults.timeout, api.ANALYTICS_API_TIMEOUT_MS)
  api.setAccessToken(null)
  assert.equal(api.identityApi.defaults.headers.common.Authorization, undefined)
  assert.equal(api.compatibilityApi.defaults.headers.common.Authorization, undefined)
})

test('login contract and explicit profile request', async () => {
  const calls = mock(api.identityApi, { access_token: 'token', token_type: 'bearer' })
  assert.equal((await auth.login({ email: 'test@example.com', password: 'password' })).access_token, 'token')
  assert.equal(calls[0].url, '/api/auth/login')
  assert.equal(JSON.parse(calls[0].data).email, 'test@example.com')
  await auth.getProfile()
  assert.equal(calls[1].url, '/api/auth/me')
})

test('session token can be stored, restored and cleared safely', () => {
  const values = new Map()
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  }
  assert.equal(authSession.readAccessToken(storage), null)
  authSession.storeAccessToken('token-123', storage)
  assert.equal(authSession.readAccessToken(storage), 'token-123')
  authSession.clearStoredAccessToken(storage)
  assert.equal(authSession.readAccessToken(storage), null)

  const blockedStorage = {
    getItem: () => { throw new Error('blocked') },
    setItem: () => { throw new Error('blocked') },
    removeItem: () => { throw new Error('blocked') },
  }
  assert.doesNotThrow(() => authSession.storeAccessToken('token', blockedStorage))
  assert.equal(authSession.readAccessToken(blockedStorage), null)
  assert.doesNotThrow(() => authSession.clearStoredAccessToken(blockedStorage))
})

test('orders reject empty or nonpositive quantities before HTTP', async () => {
  const response = {
    order_id: 1,
    status: 'PENDING',
    total_amount: '143.00',
    event_published: true,
    event_key: 'raw/events/orders/example.json',
    inventory_reservation_id: '7c5144b3-2f05-41a5-b939-b959c4b09ca3',
    inventory_status: 'CONFIRMED',
  }
  const calls = mock(api.orderApi, response)
  for (const items of [[], [{ product_id: 1, quantity: 0 }], [{ product_id: 1, quantity: -1 }], [{ product_id: 1, quantity: 1.5 }]]) {
    await assert.rejects(orders.createOrder({ user_id: 'user', items }, 'checkout-test-000001'))
  }
  assert.equal(calls.length, 0)
  const payload = { user_id: 'user', items: [{ product_id: 1, quantity: 2 }] }
  assert.deepEqual(await orders.createOrder(payload, 'checkout-test-000001'), response)
  assert.deepEqual(JSON.parse(calls[0].data), payload)
  assert.equal(calls[0].headers['Idempotency-Key'], 'checkout-test-000001')
  await orders.getMyOrders('user/name')
  assert.equal(calls[1].url, '/api/orders/user/user%2Fname')
})

test('inventory uses deployed stock, low-stock and adjustment contracts', async () => {
  const response = {
    product_id: 1,
    available_quantity: 20,
    reserved_quantity: 2,
    sellable_quantity: 18,
    minimum_quantity: 5,
    low_stock: false,
    updated_at: '2026-09-23T20:00:00Z',
  }
  const calls = mock(api.inventoryApi, response)
  await inventory.getStock(1)
  await inventory.getLowStock()
  const adjustment = { product_id: 1, quantity_delta: 5, reason: 'Recepción' }
  await inventory.adjustStock(adjustment)
  assert.deepEqual(calls.map(call => [call.method, call.url]), [
    ['get', '/api/inventory/1'],
    ['get', '/api/inventory/low-stock'],
    ['post', '/api/inventory/adjustments'],
  ])
  assert.deepEqual(JSON.parse(calls[2].data), adjustment)
})

test('checkout estimate matches the backend tax and shipping rules', () => {
  assert.deepEqual(orderTotals.calculateOrderEstimate(1499.90), {
    subtotal: 1499.90,
    tax: 269.98,
    shipping: 25,
    total: 1794.88,
  })
  assert.deepEqual(orderTotals.calculateOrderEstimate(0), {
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  })
})

test('compatibility validates components and uses the deployed endpoint', async () => {
  const response = {
    compatible: true,
    checks: [{ rule: 'CPU_SOCKET', status: 'PASS', details: { cpu_socket: 'AM5' } }],
    event_published: true,
    event_key: 'raw/events/compatibility/example.json',
  }
  const calls = mock(api.compatibilityApi, response)
  await assert.rejects(compatibility.checkCompatibility({ components: [] }))
  assert.equal(calls.length, 0)
  const payload = {
    user_id: 'user-1',
    session_id: 'session-1',
    components: [
      { type: 'cpu', product_id: 1 },
      { type: 'motherboard', product_id: 2 },
    ],
  }
  assert.deepEqual(await compatibility.checkCompatibility(payload), response)
  assert.equal(calls[0].url, '/api/compatibility/check')
  assert.deepEqual(JSON.parse(calls[0].data), payload)
})

test('catalog uses correct verbs and propagates query cancellation', async () => {
  const calls = mock(api.catalogApi, [])
  const controller = new AbortController()
  await catalog.getProducts(controller.signal)
  assert.equal(calls[0].signal, controller.signal)
  await catalog.updateProduct(2, { name: 'CPU', description: '', price: 10, specs: {}, image_url: '', is_active: true })
  assert.equal(calls[1].method, 'put')
  assert.equal(calls[1].url, '/api/products/2')
  await catalog.deleteProduct(2)
  assert.equal(calls[2].method, 'delete')
})

test('catalog filters before pagination and limits search suggestions', () => {
  const products = Array.from({ length: 30 }, (_, index) => ({
    id: index + 1,
    sku: `SKU-${index + 1}`,
    name: index < 28 ? `CPU ${index + 1}` : `GPU ${index + 1}`,
    brand: index % 2 ? 'AMD' : 'Intel',
    category: index < 28 ? 'CPU' : 'GPU',
    price: String(index + 1),
  }))
  const params = new URLSearchParams('category=CPU&brand=AMD&sort=price-desc')
  const filtered = catalogUtils.filterProducts(products, params)
  assert.equal(filtered.length, 14)
  assert.equal(filtered[0].price, '28')
  assert.deepEqual(
    catalogUtils.paginateProducts(filtered, 2, 5).map(product => product.id),
    [18, 16, 14, 12, 10],
  )
  assert.equal(catalogUtils.getSearchSuggestions(products, 'CPU', 5).length, 5)
  assert.deepEqual(catalogUtils.getSearchSuggestions(products, '', 5), [])
})

test('analytics endpoints and FastAPI validation errors', async () => {
  const calls = mock(api.analyticsApi, {})
  await analytics.getEventCount()
  await analytics.getTopProducts()
  await analytics.getSalesSummary()
  await analytics.getSalesByCategory()
  await analytics.getProductConversion()
  await analytics.getCompatibilityFailureRules()
  await analytics.getCompatibilitySummary()
  await analytics.getUserRegistrations()
  await analytics.getFunnel()
  assert.deepEqual(calls.map(call => call.url), [
    '/api/analytics/events/count',
    '/api/analytics/top-products',
    '/api/analytics/sales/summary',
    '/api/analytics/sales/by-category',
    '/api/analytics/products/conversion',
    '/api/analytics/compatibility/failure-rules',
    '/api/analytics/compatibility/summary',
    '/api/analytics/users/registrations',
    '/api/analytics/funnel',
  ])
  assert.equal(errors.getApiErrorMessage({ isAxiosError: true, response: { data: { detail: [{ msg: 'Email inválido' }] } } }), 'Email inválido')
  assert.equal(errors.getApiErrorMessage({ isAxiosError: true, response: { status: 401, data: { detail: 'Invalid credentials' } } }), 'Correo o contraseña incorrectos.')
  assert.equal(errors.getApiErrorMessage({ isAxiosError: true, response: { status: 400, data: { detail: 'User already exists' } } }), 'Ya existe una cuenta con ese correo o identificador.')
  assert.equal(errors.getApiErrorMessage({ isAxiosError: true }), 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.')
})
