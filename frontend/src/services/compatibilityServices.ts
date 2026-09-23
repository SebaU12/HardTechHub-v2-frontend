import { compatibilityApi } from '../api/axios'
import type {
  CompatibilityRequest,
  CompatibilityResponse,
} from '../types/type'

export async function checkCompatibility(
  payload: CompatibilityRequest,
): Promise<CompatibilityResponse> {
  if (
    !payload.components.length ||
    payload.components.some(
      (component) =>
        !Number.isSafeInteger(component.product_id) || component.product_id <= 0,
    )
  ) {
    throw new Error('Selecciona al menos un par válido de componentes')
  }

  const { data } = await compatibilityApi.post<CompatibilityResponse>(
    '/api/compatibility/check',
    payload,
  )
  return data
}
