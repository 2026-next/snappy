import { useEffect, useRef, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'

import { hydrateSession } from '@/shared/auth/hydrate-session'
import {
  useAuthStore,
  type AuthProvider,
} from '@/shared/auth/use-auth-store'

type Status = 'pending' | 'success' | 'error'

type OAuthCallbackPageProps = {
  provider: AuthProvider
}

export function OAuthCallbackPage({ provider }: OAuthCallbackPageProps) {
  const [searchParams] = useSearchParams()
  const accessToken = searchParams.get('accessToken')
  const refreshToken = searchParams.get('refreshToken')
  const tokenType = searchParams.get('tokenType') ?? 'Bearer'
  const tokensPresent = Boolean(accessToken && refreshToken)

  const [status, setStatus] = useState<Status>(
    tokensPresent ? 'pending' : 'error',
  )
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    if (!tokensPresent || !accessToken || !refreshToken) return
    ranRef.current = true

    useAuthStore
      .getState()
      .setTokens({ accessToken, refreshToken, tokenType }, provider)

    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState(
        {},
        '',
        `/auth/oauth/${provider}/callback`,
      )
    }

    let cancelled = false
    void (async () => {
      const ok = await hydrateSession()
      if (cancelled) return
      setStatus(ok ? 'success' : 'error')
    })()

    return () => {
      cancelled = true
    }
  }, [provider, tokensPresent, accessToken, refreshToken, tokenType])

  if (status === 'success') {
    return <Navigate to="/" replace />
  }
  if (status === 'error') {
    return <Navigate to={`/auth?error=oauth_${provider}_failed`} replace />
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-white">
      <p className="text-sm text-[#6b7280]">로그인 처리 중...</p>
    </main>
  )
}
