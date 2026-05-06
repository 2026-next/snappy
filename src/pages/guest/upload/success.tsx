import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { GuestUploadSuccessView } from '@/widgets/guest-upload-success/ui/guest-upload-success-view'

export function GuestUploadSuccessPage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const uploadCount: number = location.state?.uploadCount ?? 0

  return (
    <GuestUploadSuccessView
      albumTitle="민수 & 지연 Wedding"
      uploadCount={uploadCount}
      uploaderName="김민준"
      onViewMyPhotos={() => navigate(`/guest/${albumId}/login?from=my-photos`)}
      onUploadMore={() => navigate(`/guest/${albumId}/upload/select`)}
    />
  )
}
