import { useMemo, useState, type FormEvent } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  CloudUpload,
  Cpu,
  Gauge,
  LoaderCircle,
  MemoryStick,
  RotateCcw,
} from 'lucide-react'
import { useAuth, useCompatibility, useProducts } from '../hooks'
import { getApiErrorMessage } from '../api/errors'
import { Breadcrumb } from '../components/common/Breadcrumb'
import { ErrorState, LoadingSpinner } from '../components/common/States'
import type {
  CompatibilityComponentRequest,
  CompatibilityResponse,
  ComponentType,
  Product,
} from '../types/type'

const COMPONENTS: Array<{
  type: ComponentType
  category: string
  label: string
  rule: string
  spec: string
}> = [
  { type: 'cpu', category: 'CPU', label: 'Procesador', rule: 'CPU_SOCKET', spec: 'socket' },
  { type: 'motherboard', category: 'Motherboard', label: 'Placa madre', rule: 'CPU_SOCKET / RAM_TYPE', spec: 'socket' },
  { type: 'ram', category: 'RAM', label: 'Memoria RAM', rule: 'RAM_TYPE', spec: 'memory_type' },
  { type: 'gpu', category: 'GPU', label: 'Tarjeta gráfica', rule: 'PSU_POWER', spec: 'recommended_psu_watts' },
  { type: 'psu', category: 'PSU', label: 'Fuente de poder', rule: 'PSU_POWER', spec: 'wattage' },
]

const DETAIL_LABELS: Record<string, string> = {
  cpu_socket: 'Socket del CPU',
  motherboard_socket: 'Socket de la placa',
  motherboard_memory_type: 'Memoria de la placa',
  ram_memory_type: 'Tipo de RAM',
  gpu_recommended_watts: 'Potencia recomendada por GPU',
  psu_wattage: 'Potencia de la fuente',
}

function candidates(products: Product[], category: string, spec: string): Product[] {
  return products
    .filter((product) => product.category.toLowerCase() === category.toLowerCase())
    .sort((left, right) => {
      const leftHasSpec = left.specs[spec] != null ? 1 : 0
      const rightHasSpec = right.specs[spec] != null ? 1 : 0
      return rightHasSpec - leftHasSpec || left.id - right.id
    })
    .slice(0, 100)
}

function detailValue(value: unknown): string {
  if (typeof value === 'number') return `${value} W`
  if (typeof value === 'string' && value) return value
  return 'No informado'
}

export function CompatibilityPage() {
  const { products, loading: productsLoading, error: productsError, refetch } = useProducts()
  const { user } = useAuth()
  const { check, loading, error, sessionId } = useCompatibility()
  const [selected, setSelected] = useState<Partial<Record<ComponentType, string>>>({})
  const [result, setResult] = useState<CompatibilityResponse | null>(null)
  const [localError, setLocalError] = useState('')
  const productsByType = useMemo(
    () => Object.fromEntries(
      COMPONENTS.map((component) => [
        component.type,
        candidates(products, component.category, component.spec),
      ]),
    ) as Record<ComponentType, Product[]>,
    [products],
  )

  function loadExample() {
    const example: Partial<Record<ComponentType, string>> = {}
    for (const component of COMPONENTS) {
      const product = productsByType[component.type][0]
      if (product) example[component.type] = String(product.id)
    }
    setSelected(example)
    setResult(null)
    setLocalError('')
  }

  function clearSelection() {
    setSelected({})
    setResult(null)
    setLocalError('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    const components = COMPONENTS.flatMap<CompatibilityComponentRequest>((component) => {
      const productId = Number(selected[component.type])
      return Number.isSafeInteger(productId) && productId > 0
        ? [{ type: component.type, product_id: productId }]
        : []
    })
    const selectedTypes = new Set(components.map((component) => component.type))
    const hasRule =
      (selectedTypes.has('cpu') && selectedTypes.has('motherboard')) ||
      (selectedTypes.has('ram') && selectedTypes.has('motherboard')) ||
      (selectedTypes.has('gpu') && selectedTypes.has('psu'))
    if (!hasRule) {
      setLocalError('Selecciona al menos un par: CPU + placa, RAM + placa o GPU + fuente.')
      return
    }
    setLocalError('')
    setResult(null)
    try {
      setResult(await check(components))
    } catch (failure) {
      setLocalError(getApiErrorMessage(failure))
    }
  }

  return (
    <div className="container page compatibility-page">
      <Breadcrumb current="Compatibilidad" />
      <div className="page-heading">
        <span className="eyebrow">CONSTRUYE CON CONFIANZA</span>
        <h1>Comprueba tu configuración<span className="accent">.</span></h1>
        <p>Compara socket, tipo de memoria y potencia antes de registrar tu pedido.</p>
      </div>

      {productsError ? (
        <ErrorState message={productsError} retry={refetch} />
      ) : (
        <form className="compatibility-builder" onSubmit={submit} aria-busy={loading}>
          <div className="compatibility-intro">
            <Gauge size={24} />
            <div>
              <strong>Tres reglas, una respuesta clara</strong>
              <p>CPU_SOCKET · RAM_TYPE · PSU_POWER</p>
            </div>
            <span>{user ? `Usuario: ${user.user_id}` : 'Sesión de invitado'}</span>
          </div>

          <div className="component-selection-grid">
            {COMPONENTS.map((component) => (
              <label className="component-field" key={component.type}>
                <span>
                  {component.type === 'ram' ? <MemoryStick size={18} /> : <Cpu size={18} />}
                  <strong>{component.label}</strong>
                </span>
                <small>{component.rule}</small>
                <select
                  value={selected[component.type] || ''}
                  disabled={productsLoading || loading}
                  onChange={(event) => {
                    setSelected((current) => ({
                      ...current,
                      [component.type]: event.target.value,
                    }))
                    setResult(null)
                    setLocalError('')
                  }}
                >
                  <option value="">No seleccionado</option>
                  {productsByType[component.type].map((product) => (
                    <option value={product.id} key={product.id}>
                      {product.name} · {product.sku}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="compatibility-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={loadExample}
              disabled={productsLoading || loading || !products.length}
            >
              <CheckCircle2 size={17} /> Cargar ejemplo completo
            </button>
            <button type="button" className="text-button" onClick={clearSelection} disabled={loading}>
              <RotateCcw size={15} /> Limpiar
            </button>
            <button className="button" type="submit" disabled={productsLoading || loading}>
              {loading ? <LoadingSpinner /> : <Gauge size={18} />}
              {loading ? 'Comprobando…' : 'Comprobar compatibilidad'}
            </button>
          </div>

          {(localError || error) && (
            <p className="form-error compatibility-error" role="alert">
              {localError || error}
            </p>
          )}
        </form>
      )}

      {result && (
        <section className={`compatibility-result ${result.compatible ? 'is-compatible' : 'is-incompatible'}`} aria-live="polite">
          <div className="compatibility-verdict">
            {result.compatible ? <CheckCircle2 size={34} /> : <AlertTriangle size={34} />}
            <div>
              <span className="eyebrow">RESULTADO</span>
              <h2>{result.compatible ? 'Configuración compatible' : 'Revisa esta configuración'}</h2>
              <p>{result.checks.length} reglas evaluadas en esta combinación.</p>
            </div>
          </div>
          <div className="compatibility-checks">
            {result.checks.map((item) => (
              <article className={`compatibility-check check-${item.status.toLowerCase()}`} key={item.rule}>
                <header>
                  {item.status === 'PASS' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  <strong>{item.rule}</strong>
                  <span>{item.status}</span>
                </header>
                <dl>
                  {Object.entries(item.details).map(([key, value]) => (
                    <div key={key}>
                      <dt>{DETAIL_LABELS[key] || key}</dt>
                      <dd>{detailValue(value)}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
          <div className={`compatibility-publication ${result.event_published ? 'published' : 'not-published'}`}>
            {result.event_published ? <CloudUpload size={18} /> : <AlertTriangle size={18} />}
            <div>
              <strong>{result.event_published ? 'Evento publicado' : 'Evento no publicado'}</strong>
              <p>
                {result.event_published
                  ? 'COMPATIBILITY_CHECKED ya está disponible en el data lake.'
                  : 'El resultado es válido, pero no pudo enviarse a S3.'}
              </p>
            </div>
          </div>
          <small className="compatibility-session">Sesión: {sessionId}</small>
        </section>
      )}

      {productsLoading && (
        <div className="compatibility-loading" role="status">
          <LoaderCircle className="spin" /> Preparando componentes del catálogo…
        </div>
      )}
    </div>
  )
}
