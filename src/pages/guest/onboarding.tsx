import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { joinByAccessCode } from '@/shared/api/guest'
import { getMyPhotos } from '@/shared/api/photo'
import { hydrateSession } from '@/shared/auth/hydrate-session'
import { useAuthStore } from '@/shared/auth/use-auth-store'
import { useGuestEventStore } from '@/shared/guest/use-guest-event-store'
import { GuestOnboardingView } from '@/widgets/guest-onboarding/ui/guest-onboarding-view'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export function GuestOnboardingPage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const navigate = useNavigate()
  const setEvent = useGuestEventStore((s) => s.setEvent)
  const isGuestSession = useAuthStore((s) => s.isAuthenticated && s.sessionType === 'GUEST')
  const guestEventId = useAuthStore((s) => s.guestEventId)

  const [isLoading, setIsLoading] = useState(true)
  const [eventName, setEventName] = useState<string | undefined>()
  const [eventDate, setEventDate] = useState<string | undefined>()
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [resolvedEventId, setResolvedEventId] = useState<string | null>(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  useEffect(() => {
    if (!albumId) return
    joinByAccessCode(albumId)
      .then((data) => {
        setEvent(data)
        setEventName(data.name)
        setEventDate(formatDate(data.eventDate))
        setThumbnailUrl(data.thumbnailUrl ?? null)
        setResolvedEventId(data.id)
      })
      .finally(() => setIsLoading(false))
  }, [albumId, setEvent])

  // Album-context guard: invalidate a guest session whose stored eventId
  // doesn't match the current album. For legacy sessions without a stored
  // eventId, refresh via /auth/me — the backend may surface it on guest.
  useEffect(() => {
    if (!resolvedEventId || !isGuestSession) return
    if (guestEventId == null) {
      void hydrateSession()
      return
    }
    if (guestEventId !== resolvedEventId) {
      useAuthStore.getState().logout()
    }
  }, [resolvedEventId, isGuestSession, guestEventId])

  const handleUploadStart = async () => {
    if (isGuestSession && resolvedEventId) {
      try {
        const photos = await getMyPhotos()
        // Legacy fallback: when guestEventId is missing, infer the session's
        // album from the first photo. Mismatch → force re-login on this album.
        if (photos.length > 0) {
          const sessionEventId = photos[0]?.eventId ?? guestEventId
          if (sessionEventId && sessionEventId !== resolvedEventId) {
            useAuthStore.getState().logout()
            navigate(`/guest/${albumId}/login?from=upload`)
            return
          }
          // Backfill so subsequent visits skip the photo round-trip.
          if (!guestEventId && sessionEventId) {
            useAuthStore.getState().setGuestEventId(sessionEventId)
          }
          setIsHistoryModalOpen(true)
          return
        }
      } catch {
        // session expired or failed — fall through to login
      }
    }
    navigate(`/guest/${albumId}/login?from=upload`)
  }

  return (
    <GuestOnboardingView
      eventName={eventName}
      eventDate={eventDate}
      thumbnailUrl={thumbnailUrl}
      isLoading={isLoading}
      onUploadStart={() => { void handleUploadStart() }}
      onViewMyPhotos={() => navigate(`/guest/${albumId}/login?from=my-photos`)}
      isHistoryModalOpen={isHistoryModalOpen}
      onHistoryModalConfirm={() => navigate(`/guest/${albumId}/my-photos`)}
    />
  )
}
