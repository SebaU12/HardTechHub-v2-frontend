import { useCallback } from 'react'
import { adjustStock } from '../services/inventoryService'
import type { AdjustStockRequest } from '../types/type'
import { useMutation } from './useMutation'

export function useInventoryAdjustment() {
  const action = useCallback((data: AdjustStockRequest) => adjustStock(data), [])
  const { execute, ...state } = useMutation(action)
  return { adjust: execute, ...state }
}
