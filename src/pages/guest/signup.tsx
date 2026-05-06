import { useNavigate, useParams } from 'react-router-dom'

import { GuestSignupView } from '@/widgets/guest-signup/ui/guest-signup-view'

export function GuestSignupPage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const navigate = useNavigate()

  const handleComplete = (
    _name: string,
    _relation: string,
    _password: string,
  ) => {
    // TODO: API 연동 후 실제 처리
    navigate(`/guest/${albumId}/photo-select`)
  }

  return (
    <GuestSignupView
      onBack={() => navigate(`/guest/${albumId}/login`)}
      onComplete={handleComplete}
    />
  )
}
