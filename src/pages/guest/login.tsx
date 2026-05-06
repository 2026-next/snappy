import { useNavigate, useParams } from 'react-router-dom'

import { GuestLoginView } from '@/widgets/guest-login/ui/guest-login-view'

export function GuestLoginPage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const navigate = useNavigate()

  const handleSubmit = async (
    _name: string,
    _password: string,
  ): Promise<boolean> => {
    // TODO: API 연동 후 실제 인증 처리
    return false
  }

  return (
    <GuestLoginView
      onBack={() => navigate(`/guest/${albumId}/onboarding`)}
      onSubmit={handleSubmit}
      onCreateAccount={() => navigate(`/guest/${albumId}/signup`)}
    />
  )
}
