import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/shared/auth/use-auth-store'
import { AuthView } from '@/widgets/auth/ui/auth-view'

export function AuthPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <AuthView />
}
