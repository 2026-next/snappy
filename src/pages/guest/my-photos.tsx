import { useNavigate, useParams } from 'react-router-dom'

import { GuestMyPhotosView } from '@/widgets/guest-my-photos/ui/guest-my-photos-view'

export function GuestMyPhotosPage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const navigate = useNavigate()

  const handleMessageSave = (_message: string) => {
    // TODO: API 연동 - 메세지 수정
  }

  const handlePhotosDelete = (_photoIds: number[]) => {
    // TODO: API 연동 - 사진 삭제
  }

  return (
    <GuestMyPhotosView
      albumTitle="민수 & 지연 Wedding"
      uploadCount={0}
      uploaderName="김민준"
      photos={[]}
      initialMessage=""
      onBack={() => navigate(-1)}
      onAddMore={() => navigate(`/guest/${albumId}/upload/select`)}
      onMessageSave={handleMessageSave}
      onPhotosDelete={handlePhotosDelete}
    />
  )
}
