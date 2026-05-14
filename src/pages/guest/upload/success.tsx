import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { joinByAccessCode } from '@/shared/api/guest'
import { useAuthStore } from '@/shared/auth/use-auth-store'
import { useGuestEventStore } from '@/shared/guest/use-guest-event-store'
import { GuestUploadSuccessView } from '@/widgets/guest-upload-success/ui/guest-upload-success-view'

export function GuestUploadSuccessPage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const uploadCount: number = location.state?.uploadCount ?? 0
  const event = useGuestEventStore((s) => s.event)
  const setEvent = useGuestEventStore((s) => s.setEvent)
  const eventName = event?.name ?? ''
  const uploaderName = useAuthStore((s) => s.guestName ?? '')

  useEffect(() => {
    if (!albumId || event) return
    joinByAccessCode(albumId).then(setEvent).catch(() => {})
  }, [albumId, event, setEvent])

  return (
    <GuestUploadSuccessView
      albumTitle={eventName}
      uploadCount={uploadCount}
      uploaderName={uploaderName}
      onViewMyPhotos={() => navigate(`/guest/${albumId}/login?from=my-photos`)}
      onUploadMore={() => navigate(`/guest/${albumId}/upload/select`)}
    />
  )
}
