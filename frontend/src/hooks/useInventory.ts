import { useCallback } from 'react'
import { getStock } from '../services/inventoryService'
import { useQuery } from './useQuery'

export function useInventory(productId: number | undefined) {
  const enabled = typeof productId === 'number' && productId > 0
  const load = useCallback(
    (signal: AbortSignal) => getStock(productId!, signal),
    [productId],
  )
  const { data, ...state } = useQuery(`inventory:${productId}`, load, enabled)
  return { stock: data ?? null, ...state }
}
