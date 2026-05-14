import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/shared/auth/use-auth-store'

export function RequireHost() {
  const location = useLocation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const sessionType = useAuthStore((s) => s.sessionType)

  if (!isAuthenticated || sessionType === 'GUEST') {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/auth?next=${encodeURIComponent(next)}`} replace />
  }

  return <Outlet />
}
