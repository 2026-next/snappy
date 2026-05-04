import { useEffect, useRef, type PropsWithChildren } from 'react'

import { hydrateSession } from '@/shared/auth/hydrate-session'
import { useAuthStore } from '@/shared/auth/use-auth-store'

export function AuthBootstrapper({ children }: PropsWithChildren) {
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    const accessToken = useAuthStore.getState().accessToken
    if (!accessToken) return

    void hydrateSession()
  }, [])

  return children
}
