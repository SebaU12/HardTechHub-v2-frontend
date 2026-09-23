import axios from 'axios'

export const DEFAULT_API_TIMEOUT_MS = 15_000
export const ANALYTICS_API_TIMEOUT_MS = 60_000

function normalizeBaseUrl(url: string | undefined): string | undefined {
  const normalized = url?.trim().replace(/\/+$/, '')
  return normalized || undefined
}

function resolveBaseUrl(serviceUrl: string | undefined): string {
  if (import.meta.env.DEV) return '/'
  return normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)
    ?? normalizeBaseUrl(serviceUrl)
    ?? '/'
}

function createApi(serviceUrl: string | undefined, timeout = DEFAULT_API_TIMEOUT_MS) {
  return axios.create({
    baseURL: resolveBaseUrl(serviceUrl),
    timeout,
    headers: { Accept: 'application/json' },
  })
}

export const identityApi = createApi(import.meta.env.VITE_IDENTITY_API_URL)
export const catalogApi = createApi(import.meta.env.VITE_CATALOG_API_URL)
export const orderApi = createApi(import.meta.env.VITE_ORDER_API_URL)
export const compatibilityApi = createApi(import.meta.env.VITE_COMPATIBILITY_API_URL)
export const analyticsApi = createApi(
  import.meta.env.VITE_ANALYTICS_API_URL,
  ANALYTICS_API_TIMEOUT_MS,
)


export function setAccessToken(token: string | null): void {
  for (const client of [
    identityApi,
    catalogApi,
    orderApi,
    compatibilityApi,
    analyticsApi,
  ]) {
    if (token) client.defaults.headers.common.Authorization = `Bearer ${token}`
    else delete client.defaults.headers.common.Authorization
  }
}
