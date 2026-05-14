import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  type EventResponse,
  getMyEvents,
} from '@/shared/api/event'
import { AlbumShareView } from '@/widgets/album-create/ui/album-share-view'

const CHEVRON_RIGHT = '/icons/chevron-right.svg'

export function HostAlbumSharePage() {
  const navigate = useNavigate()
  const { albumId = '' } = useParams<{ albumId: string }>()
  const [event, setEvent] = useState<EventResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!albumId) {
      setErrorMessage('앨범 정보를 찾을 수 없어요.')
      return
    }
    let cancelled = false
    setIsLoading(true)
    setErrorMessage(null)
    getMyEvents()
      .then((events) => {
        if (cancelled) return
        const match = events.find((item) => item.id === albumId)
        if (!match) {
          setErrorMessage('앨범 정보를 찾을 수 없어요.')
          return
        }
        setEvent(match)
      })
      .catch((error) => {
        if (cancelled) return
        const message =
          error instanceof Error
            ? error.message
            : '앨범 정보를 불러오지 못했어요.'
        setErrorMessage(message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [albumId])

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-white">
      <header className="relative flex h-[60px] items-center justify-center px-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
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
        <h1 className="text-[20px] font-bold text-[#222226]">앨범 공유 링크</h1>
      </header>

      {isLoading && (
        <p className="px-5 py-8 text-center text-[14px] text-[#a2a5ad]">
          앨범 정보를 불러오는 중...
        </p>
      )}
      {!isLoading && errorMessage && (
        <p
          role="alert"
          className="px-5 py-8 text-center text-[14px] text-[#e23a3a]"
        >
          {errorMessage}
        </p>
      )}
      {!isLoading && event && (
        <AlbumShareView
          albumName={event.name}
          shareUrl={event.qrLink}
          coverUrl={event.thumbnailUrl ?? null}
          onGoHome={() => navigate('/')}
        />
      )}
    </main>
  )
}
