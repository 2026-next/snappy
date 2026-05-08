import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { ApiError } from '@/shared/api/client'
import { guestLogin } from '@/shared/api/guest'
import { hydrateSession } from '@/shared/auth/hydrate-session'
import { useAuthStore } from '@/shared/auth/use-auth-store'
import { GuestLoginView } from '@/widgets/guest-login/ui/guest-login-view'

export function GuestLoginPage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const handleSubmit = async (
    name: string,
    password: string,
  ): Promise<boolean> => {
    if (!albumId || !name.trim() || !password) {
      return false
    }

    try {
      const tokens = await guestLogin({
        eventId: albumId,
        name: name.trim(),
        password,
      })
      useAuthStore.getState().setTokens(tokens, null)
      await hydrateSession()

      const from = searchParams.get('from') ?? 'upload'
      const dest =
        from === 'my-photos'
          ? `/guest/${albumId}/my-photos`
          : `/guest/${albumId}/upload/select`
      navigate(dest, { replace: true })
      return true
    } catch (error) {
      if (error instanceof ApiError) {
        return false
      }
      return false
    }
  }

  return (
    <GuestLoginView
      onBack={() => navigate(`/guest/join/${albumId}`)}
      onSubmit={handleSubmit}
      onCreateAccount={() =>
        navigate(`/guest/${albumId}/signup?${searchParams.toString()}`)
      }
    />
  )
}
