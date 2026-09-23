import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks'
import { PageSkeleton } from './States'
export function RequireAuth() {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) {
    return (
      <div className="container page">
        <PageSkeleton />
      </div>
    )
  }
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      replace
      state={{
        from: location.pathname,
        message:
          'Inicia sesión para consultar tu cuenta y continuar con tus pedidos.',
      }}
    />
  )
}
