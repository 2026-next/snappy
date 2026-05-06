import { useNavigate, useParams } from 'react-router-dom'

import { GuestOnboardingView } from '@/widgets/guest-onboarding/ui/guest-onboarding-view'

export function GuestOnboardingPage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const navigate = useNavigate()

  return (
    <GuestOnboardingView
      onUploadStart={() => navigate(`/guest/${albumId}/login`)}
      onViewMyPhotos={() => navigate(`/guest/${albumId}/login`)}
    />
  )
}
