import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ApiError } from '@/shared/api/client'
import {
  createEvent,
  uploadEventThumbnail,
  type EventResponse,
} from '@/shared/api/event'
import { useAuthStore } from '@/shared/auth/use-auth-store'
import {
  AlbumCreateForm,
  type AlbumCreatePayload,
} from '@/widgets/album-create/ui/album-create-form'
import { AlbumShareView } from '@/widgets/album-create/ui/album-share-view'

const CHEVRON_RIGHT = '/icons/chevron-right.svg'

function errorMessageFor(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return '로그인이 필요해요. 다시 시도해 주세요.'
    if (error.status === 400) return '입력값을 확인해 주세요.'
    return `앨범을 만들지 못했어요. (오류 ${error.status})`
  }
  return '네트워크 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'
}

type AlbumCreateLocationState = {
  coverFile?: File | null
}

export function AlbumCreatePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const initialCoverFile =
    (location.state as AlbumCreateLocationState | null)?.coverFile ?? null
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [createdEvent, setCreatedEvent] = useState<EventResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [localCoverUrl, setLocalCoverUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (localCoverUrl) URL.revokeObjectURL(localCoverUrl)
    }
  }, [localCoverUrl])

  const handleBack = () => {
    if (createdEvent) {
      setCreatedEvent(null)
      setLocalCoverUrl(null)
      return
    }
    navigate(-1)
  }

  const handleCreate = async (input: AlbumCreatePayload) => {
    const name = input.name.trim()
    if (!name) return
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    setErrorMessage(null)
    setIsSubmitting(true)
    try {
      const coverFile = input.coverFile
      const event = await createEvent({
        name,
        eventDate: input.eventDate,
        thumbnailMimeType: coverFile?.type || undefined,
      })
      if (coverFile && event.thumbnailUpload) {
        try {
          await uploadEventThumbnail(event.thumbnailUpload, coverFile)
          setLocalCoverUrl(URL.createObjectURL(coverFile))
        } catch (uploadError) {
          console.warn('Cover upload failed', uploadError)
        }
      }
      setCreatedEvent(event)
    } catch (error) {
      setErrorMessage(errorMessageFor(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-white">
      <header className="relative flex h-[60px] items-center justify-center px-5">
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로 가기"
          className="absolute left-5 flex h-10 w-10 items-center justify-center"
        >
          <img
            src={CHEVRON_RIGHT}
            alt=""
            className="h-[15.67px] w-[8.67px] -scale-x-100"
            aria-hidden="true"
          />
        </button>
        <h1 className="text-[20px] font-bold text-[#222226]">새 앨범 만들기</h1>
      </header>

      {createdEvent ? (
        <AlbumShareView
          albumName={createdEvent.name}
          shareUrl={createdEvent.qrLink}
          coverUrl={localCoverUrl ?? createdEvent.thumbnailUrl ?? null}
          onGoHome={handleGoHome}
        />
      ) : (
        <AlbumCreateForm
          onCreate={handleCreate}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
          initialCoverFile={initialCoverFile}
        />
      )}
    </main>
  )
}
