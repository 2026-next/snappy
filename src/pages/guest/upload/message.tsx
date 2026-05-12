import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ApiError } from '@/shared/api/client'
import { getMyMessage, MESSAGE_MAX_LENGTH, saveMessage } from '@/shared/api/message'
import { uploadFiles, type UploadProgress } from '@/shared/api/upload'
import { GuestUploadMessageView } from '@/widgets/guest-upload-message/ui/guest-upload-message-view'

export function GuestUploadMessagePage() {
  const { albumId = '' } = useParams<{ albumId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const files: File[] = location.state?.files ?? []

  const [initialMessage, setInitialMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState<UploadProgress | null>(null)

  useEffect(() => {
    getMyMessage()
      .then((msg) => setInitialMessage(msg?.content ?? ''))
      .catch(() => setInitialMessage(''))
  }, [])

  const handleComplete = async (message: string) => {
    if (isSubmitting) return
    if (files.length === 0) {
      navigate(`/guest/${albumId}/upload/select`)
      return
    }
    const trimmed = message.trim()
    if (trimmed.length > MESSAGE_MAX_LENGTH) {
      setErrorMessage(`메세지는 ${MESSAGE_MAX_LENGTH}자 이하로 작성해주세요.`)
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setProgress({ total: files.length, completed: 0 })

    try {
      const result = await uploadFiles(files, {
        onProgress: (p) => setProgress({ ...p }),
      })

      let messageWarning: string | null = null
      if (trimmed.length > 0) {
        try {
          await saveMessage(trimmed)
        } catch (msgError) {
          const status =
            msgError instanceof ApiError ? msgError.status : 'unknown'
          console.error('saveMessage failed', status)
          messageWarning = '사진은 업로드되었지만 메세지 저장에 실패했어요.'
        }
      }

      const uploadedCount = result.uploaded.length
      if (uploadedCount === 0) {
        setErrorMessage('사진 업로드에 실패했어요. 다시 시도해 주세요.')
        setProgress(null)
        setIsSubmitting(false)
        return
      }

      navigate(`/guest/${albumId}/upload/success`, {
        state: {
          uploadCount: uploadedCount,
          failedCount: result.failures.length,
          messageWarning,
        },
      })
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '업로드 중 문제가 발생했어요. 다시 시도해 주세요.',
      )
      setProgress(null)
      setIsSubmitting(false)
    }
  }

  if (initialMessage === null) return null

  return (
    <GuestUploadMessageView
      files={files}
      initialMessage={initialMessage}
      onBack={() => navigate(`/guest/${albumId}/upload/select`, { state: { files } })}
      onComplete={handleComplete}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
      progress={progress}
    />
  )
}
