import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { ApiError } from '@/shared/api/client'
import {
  GUEST_RELATION_CODE,
  GUEST_RELATION_LABELS,
  guestRegister,
  joinByAccessCode,
} from '@/shared/api/guest'
import { hydrateSession } from '@/shared/auth/hydrate-session'
import { useAuthStore } from '@/shared/auth/use-auth-store'
import { useGuestEventStore } from '@/shared/guest/use-guest-event-store'
import { GuestSignupView } from '@/widgets/guest-signup/ui/guest-signup-view'

type SignupResult = { ok: true } | { ok: false; message: string }

export function GuestSignupPage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const event = useGuestEventStore((s) => s.event)
  const setEvent = useGuestEventStore((s) => s.setEvent)

  useEffect(() => {
    if (!albumId || event) return
    joinByAccessCode(albumId).then(setEvent).catch(() => {})
  }, [albumId, event, setEvent])

  const handleComplete = async (
    name: string,
    relationLabel: string,
    password: string,
  ): Promise<SignupResult> => {
    if (!albumId) {
      return { ok: false, message: '유효하지 않은 초대 정보예요.' }
    }

    const relationKey = GUEST_RELATION_LABELS[relationLabel] ?? 'OTHER'
    const relation = GUEST_RELATION_CODE[relationKey]

    try {
      const tokens = await guestRegister({
        eventId: event?.id ?? albumId,
        name: name.trim(),
        password,
        relation,
      })
      useAuthStore.getState().setTokens(tokens, null)
      useAuthStore.getState().setGuestName(name.trim())
      await hydrateSession()

      const from = searchParams.get('from') ?? 'upload'
      const dest =
        from === 'my-photos'
          ? `/guest/${albumId}/my-photos`
          : `/guest/${albumId}/upload/select`
      navigate(dest, { replace: true })
      return { ok: true }
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        return {
          ok: false,
          message:
            '이미 사용 중인 이름이거나 입력 정보를 다시 확인해주세요.',
        }
      }
      return {
        ok: false,
        message:
          '잠시 후 다시 시도해주세요. 문제가 계속되면 주최자에게 문의해주세요.',
      }
    }
  }

  return (
    <GuestSignupView
      onBack={() =>
        navigate(`/guest/${albumId}/login?${searchParams.toString()}`)
      }
      onComplete={handleComplete}
    />
  )
}
