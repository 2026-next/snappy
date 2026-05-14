import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { ApiError } from '@/shared/api/client'
import { guestLogin, joinByAccessCode } from '@/shared/api/guest'
import { hydrateSession } from '@/shared/auth/hydrate-session'
import { useAuthStore } from '@/shared/auth/use-auth-store'
import { useGuestEventStore } from '@/shared/guest/use-guest-event-store'
import { GuestLoginView } from '@/widgets/guest-login/ui/guest-login-view'

export function GuestLoginPage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const event = useGuestEventStore((s) => s.event)
  const setEvent = useGuestEventStore((s) => s.setEvent)

  useEffect(() => {
    if (!albumId || event) return
    joinByAccessCode(albumId).then(setEvent).catch(() => {})
  }, [albumId, event, setEvent])

  const handleSubmit = async (
    name: string,
    password: string,
  ): Promise<boolean> => {
    if (!albumId || !name.trim() || !password) {
      return false
    }

    try {
      const eventId = event?.id ?? albumId
      const tokens = await guestLogin({
        eventId,
        name: name.trim(),
        password,
      })
      useAuthStore.getState().setTokens(tokens, null)
      useAuthStore.getState().setGuestName(name.trim())
      useAuthStore.getState().setGuestEventId(eventId)
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
      onBack={() => navigate(`/guest/${albumId}/onboarding`)}
      onSubmit={handleSubmit}
      onCreateAccount={() =>
        navigate(`/guest/${albumId}/signup?${searchParams.toString()}`)
      }
    />
  )
}
