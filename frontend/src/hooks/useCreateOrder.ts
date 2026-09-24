import { useCallback, useRef } from 'react'
import { createOrder } from '../services/ordersService'
import type { OrderItemRequest } from '../types/type'
import { useAuth } from './useAuth'
import { useMutation } from './useMutation'
export function useCreateOrder() {
  const { user } = useAuth()
  const pendingRequest = useRef<{ fingerprint: string; key: string } | null>(null)
  const submit = useCallback(async (items: OrderItemRequest[]) => {
    if (!user) throw new Error('Inicia sesión para crear un pedido')
    const payload = { user_id: user.user_id, items }
    const fingerprint = JSON.stringify(payload)
    if (pendingRequest.current?.fingerprint !== fingerprint) {
      pendingRequest.current = {
        fingerprint,
        key: `checkout-${crypto.randomUUID()}`,
      }
    }
    const result = await createOrder(payload, pendingRequest.current.key)
    pendingRequest.current = null
    return result
  }, [user])
  const { execute, ...state } = useMutation(submit)
  return { submitOrder: execute, ...state }
}
