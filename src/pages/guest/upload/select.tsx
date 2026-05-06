import { useNavigate, useParams } from 'react-router-dom'

import { GuestUploadSelectView } from '@/widgets/guest-upload-select/ui/guest-upload-select-view'

export function GuestUploadSelectPage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const navigate = useNavigate()

  const handleNext = (files: File[]) => {
    navigate(`/guest/${albumId}/upload/message`, { state: { files } })
  }

  return (
    <GuestUploadSelectView
      onBack={() => navigate(`/guest/${albumId}/login?from=upload`)}
      onNext={handleNext}
    />
  )
}
