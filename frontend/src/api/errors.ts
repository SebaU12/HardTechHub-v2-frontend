import axios from 'axios'

const FRIENDLY_DETAILS: Record<string, string> = {
  'Invalid credentials': 'Correo o contraseña incorrectos.',
  'User already exists': 'Ya existe una cuenta con ese correo o identificador.',
  'Token expired': 'Tu sesión venció. Inicia sesión nuevamente.',
  'Invalid token': 'Tu sesión no es válida. Inicia sesión nuevamente.',
  'Invalid token payload': 'Tu sesión no es válida. Inicia sesión nuevamente.',
  'MongoDB error': 'El servicio de identidad no está disponible en este momento.',
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail: unknown = error.response?.data?.detail
    if (typeof detail === 'string') return FRIENDLY_DETAILS[detail] || detail
    if (Array.isArray(detail)) {
      return detail.map((item: unknown) =>
        typeof item === 'object' && item !== null && 'msg' in item
          ? String(item.msg) : 'Datos inválidos',
      ).join(', ')
    }
    if (typeof error.response?.data?.message === 'string') return error.response.data.message
    return error.response
      ? `El servidor no pudo completar la solicitud (HTTP ${error.response.status}).`
      : 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.'
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado'
}
