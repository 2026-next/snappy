import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { type EventResponse, getMyEvents } from '@/shared/api/event'

import { EventPickerModal } from './event-picker-modal'

const HOME_COLLAGE = '/images/home-collage.png'

export function HomeView() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [events, setEvents] = useState<EventResponse[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const navigateToAlbum = (eventId: string) => {
    navigate(`/host/albums/${eventId}`)
  }

  const handleCreateAlbum = () => {
    fileInputRef.current?.click()
  }

  const handleCoverPicked = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    event.target.value = ''
    if (file) {
      navigate('/albums/new', { state: { coverFile: file } })
    } else {
      navigate('/albums/new')
    }
  }

  useEffect(() => {
    const input = fileInputRef.current
    if (!input) return
    const handleCancel = () => {
      navigate('/albums/new')
    }
    input.addEventListener('cancel', handleCancel)
    return () => {
      input.removeEventListener('cancel', handleCancel)
    }
  }, [navigate])

  const handleManagePhotos = async () => {
    if (isLoading) return
    setError(null)
    setIsLoading(true)
    try {
      const list = await getMyEvents()
      setEvents(list)
      if (list.length === 0) {
        setError('아직 만든 앨범이 없어요. 새 앨범을 만들어 시작해보세요.')
        return
      }
      if (list.length === 1) {
        navigateToAlbum(list[0].id)
        return
      }
      setIsPickerOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '앨범 목록을 불러오지 못했어요')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectEvent = (eventId: string) => {
    setIsPickerOpen(false)
    navigateToAlbum(eventId)
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[584px] overflow-hidden"
      >
        <img
          src={HOME_COLLAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/10 via-[31%] to-white to-[94%]" />
      </div>

      <div className="relative flex flex-1 flex-col px-5 pb-10">
        <h1 className="mt-[440px] text-[30px] leading-[1.4] text-[#222226]">
          그날의
          <br />
          추억을
          <br />
          수집해볼까요?
        </h1>

        <div className="mt-[60px] flex w-full flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverPicked}
            data-testid="album-cover-picker"
          />
          <button
            type="button"
            onClick={handleCreateAlbum}
            className="flex h-[60px] w-full items-center justify-center rounded-2xl bg-[#222226] text-[18px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
          >
            새 앨범 만들기
          </button>
          <button
            type="button"
            onClick={handleManagePhotos}
            disabled={isLoading}
            className="flex h-[60px] w-full items-center justify-center rounded-2xl bg-[#f4f6fa] text-[18px] font-semibold text-[#222226] transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
          >
            {isLoading ? '앨범 목록 불러오는 중...' : '내 사진 관리하기'}
          </button>
          {error && (
            <p
              role="alert"
              className="text-center text-[12px] tracking-[-0.24px] text-[#e23a3a]"
            >
              {error}
            </p>
          )}
        </div>
      </div>

      {isPickerOpen && events && events.length > 1 && (
        <EventPickerModal
          events={events}
          onSelect={handleSelectEvent}
          onClose={() => setIsPickerOpen(false)}
        />
      )}
    </main>
  )
}
