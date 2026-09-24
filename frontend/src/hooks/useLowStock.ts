import { useCallback } from 'react'
import { getLowStock } from '../services/inventoryService'
import { useQuery } from './useQuery'

export function useLowStock() {
  const load = useCallback((signal: AbortSignal) => getLowStock(signal), [])
  const { data, ...state } = useQuery('inventory:low-stock', load)
  return { items: data?.items ?? [], ...state }
}
