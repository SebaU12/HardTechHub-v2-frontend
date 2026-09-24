import { inventoryApi } from '../api/axios'
import type {
  AdjustStockRequest,
  AdjustStockResponse,
  InventoryStock,
  LowStockResponse,
} from '../types/type'

export const getStock = (productId: number, signal?: AbortSignal) =>
  inventoryApi
    .get<InventoryStock>(`/api/inventory/${productId}`, { signal })
    .then((r) => r.data)

export const getLowStock = (signal?: AbortSignal) =>
  inventoryApi
    .get<LowStockResponse>('/api/inventory/low-stock', { signal })
    .then((r) => r.data)

export const adjustStock = (data: AdjustStockRequest) =>
  inventoryApi
    .post<AdjustStockResponse>('/api/inventory/adjustments', data)
    .then((r) => r.data)
