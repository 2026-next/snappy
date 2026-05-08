import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { joinByAccessCode } from '@/shared/api/guest'
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

  const [isLoading, setIsLoading] = useState(true)
  const [eventName, setEventName] = useState<string | undefined>()
  const [eventDate, setEventDate] = useState<string | undefined>()

  useEffect(() => {
    if (!albumId) return
    joinByAccessCode(albumId)
      .then((data) => {
        setEvent(data)
        setEventName(data.name)
        setEventDate(formatDate(data.eventDate))
      })
      .finally(() => setIsLoading(false))
  }, [albumId, setEvent])

  return (
    <GuestOnboardingView
      eventName={eventName}
      eventDate={eventDate}
      isLoading={isLoading}
      onUploadStart={() => navigate(`/guest/${albumId}/login?from=upload`)}
      onViewMyPhotos={() => navigate(`/guest/${albumId}/login?from=my-photos`)}
    />
  )
}
