import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { GuestLoginView } from '@/widgets/guest-login/ui/guest-login-view'

export function GuestLoginPage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const from = searchParams.get('from') ?? 'upload'

  const handleSubmit = async (
    _name: string,
    _password: string,
  ): Promise<boolean> => {
    // TODO: API 연동 후 실제 인증 처리
    // 로그인 성공 시:
    // const dest = from === 'my-photos'
    //   ? `/guest/${albumId}/my-photos`
    //   : `/guest/${albumId}/upload/select`
    // navigate(dest)
    // return true
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
