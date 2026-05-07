import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { GuestUploadMessageView } from '@/widgets/guest-upload-message/ui/guest-upload-message-view'

export function GuestUploadMessagePage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const files: File[] = location.state?.files ?? []

  const handleComplete = (_message: string) => {
    // TODO: API 연동 - 파일 및 메시지 업로드
    navigate(`/guest/${albumId}/upload/success`, {
      state: { uploadCount: files.length },
    })
  }

  return (
    <GuestUploadMessageView
      files={files}
      onBack={() => navigate(`/guest/${albumId}/upload/select`)}
      onComplete={handleComplete}
    />
  )
}
