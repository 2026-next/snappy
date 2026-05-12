import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { joinByAccessCode } from '@/shared/api/guest'
import { getMyPhotos } from '@/shared/api/photo'
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

  const [isLoading, setIsLoading] = useState(true)
  const [eventName, setEventName] = useState<string | undefined>()
  const [eventDate, setEventDate] = useState<string | undefined>()
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  useEffect(() => {
    if (!albumId) return
    joinByAccessCode(albumId)
      .then((data) => {
        setEvent(data)
        setEventName(data.name)
        setEventDate(formatDate(data.eventDate))
        setThumbnailUrl(data.thumbnailUrl ?? null)
      })
      .finally(() => setIsLoading(false))
  }, [albumId, setEvent])

  const handleUploadStart = async () => {
    if (isGuestSession) {
      try {
        const photos = await getMyPhotos()
        if (photos.length > 0) {
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
