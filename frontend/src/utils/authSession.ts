export const ACCESS_TOKEN_STORAGE_KEY = 'hardtech.access_token'

type SessionStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function resolveStorage(storage?: SessionStorage): SessionStorage | null {
  if (storage) return storage
  if (typeof window === 'undefined') return null
  return window.sessionStorage
}

export function readAccessToken(storage?: SessionStorage): string | null {
  try {
    return resolveStorage(storage)?.getItem(ACCESS_TOKEN_STORAGE_KEY) || null
  } catch {
    return null
  }
}

export function storeAccessToken(token: string, storage?: SessionStorage): void {
  try {
    resolveStorage(storage)?.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
  } catch {
    // La sesión en memoria continúa aunque el navegador bloquee sessionStorage.
  }
}

export function clearStoredAccessToken(storage?: SessionStorage): void {
  try {
    resolveStorage(storage)?.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  } catch {
    // El logout en memoria no debe fallar por una restricción del navegador.
  }
}
