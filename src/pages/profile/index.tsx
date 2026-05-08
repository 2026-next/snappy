import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { updateMe } from '@/shared/api/user'
import { useAuthStore } from '@/shared/auth/use-auth-store'
import { ProfileEditView } from '@/widgets/profile/ui/profile-edit-view'

function readUserName(user: Record<string, unknown> | null): string {
  if (!user) return ''
  const name = user['name']
  return typeof name === 'string' ? name : ''
}

export function ProfilePage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const sessionType = useAuthStore((s) => s.sessionType)
  const user = useAuthStore((s) => s.user)

  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }
  if (sessionType === 'GUEST') {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (name: string) => {
    if (isSaving) return
    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      const updated = await updateMe({ name })
      const merged: Record<string, unknown> = { ...(user ?? {}) }
      if (typeof updated.name === 'string') merged.name = updated.name
      if (typeof updated.email === 'string') merged.email = updated.email
      if (typeof updated.id === 'string') merged.id = updated.id
      useAuthStore.setState({ user: merged })
      setSuccessMessage('프로필이 저장되었습니다.')
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '프로필 저장에 실패했어요',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ProfileEditView
      initialName={readUserName(user)}
      isSaving={isSaving}
      errorMessage={errorMessage}
      successMessage={successMessage}
      onBack={() => navigate(-1)}
      onSubmit={handleSubmit}
    />
  )
}
