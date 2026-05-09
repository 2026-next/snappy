import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { useAuthStore } from '@/shared/auth/use-auth-store'
import { useGuestEventStore } from '@/shared/guest/use-guest-event-store'
import { GuestUploadSuccessView } from '@/widgets/guest-upload-success/ui/guest-upload-success-view'

export function GuestUploadSuccessPage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const uploadCount: number = location.state?.uploadCount ?? 0
  const eventName = useGuestEventStore((s) => s.event?.name ?? '')
  const guest = useAuthStore((s) => s.guest)
  const uploaderName = typeof guest?.['name'] === 'string' ? guest['name'] : ''

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
