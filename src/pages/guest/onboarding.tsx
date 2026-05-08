import { useNavigate, useParams } from 'react-router-dom'

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
  const event = useGuestEventStore((s) => s.event)

  return (
    <GuestOnboardingView
      eventName={event?.name}
      eventDate={event ? formatDate(event.eventDate) : undefined}
      onUploadStart={() => navigate(`/guest/${albumId}/login?from=upload`)}
      onViewMyPhotos={() => navigate(`/guest/${albumId}/login?from=my-photos`)}
    />
  )
}
