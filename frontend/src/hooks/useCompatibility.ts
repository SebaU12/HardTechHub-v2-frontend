import { useCallback, useState } from 'react'
import { checkCompatibility } from '../services/compatibilityServices'
import type { CompatibilityComponentRequest } from '../types/type'
import { useAuth } from './useAuth'
import { useMutation } from './useMutation'

function createSessionId(): string {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `sess_frontend_${suffix}`
}

export function useCompatibility() {
  const { user } = useAuth()
  const [sessionId] = useState(createSessionId)
  const submit = useCallback(
    (components: CompatibilityComponentRequest[]) =>
      checkCompatibility({
        components,
        user_id: user?.user_id ?? null,
        session_id: sessionId,
      }),
    [sessionId, user?.user_id],
  )
  const { execute, ...state } = useMutation(submit)
  return { check: execute, sessionId, ...state }
}
