import { createContext } from 'react'
import type { Product } from '../types/type'

export interface ProductsContextValue {
  products: Product[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export const ProductsContext = createContext<ProductsContextValue | undefined>(undefined)
