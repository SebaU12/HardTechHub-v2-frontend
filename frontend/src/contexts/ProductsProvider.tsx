import { useMemo, type ReactNode } from 'react'
import { getProducts } from '../services/catalogService'
import { useQuery } from '../hooks/useQuery'
import { ProductsContext } from './ProductsContext'

export function ProductsProvider({ children }: { children: ReactNode }) {
  const { data, loading, error, refetch } = useQuery('products', getProducts)
  const value = useMemo(
    () => ({ products: data ?? [], loading, error, refetch }),
    [data, loading, error, refetch],
  )

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  )
}
