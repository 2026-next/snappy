import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { type EventResponse, getMyEvents } from '@/shared/api/event'
import { useAuthStore } from '@/shared/auth/use-auth-store'

import { EventPickerModal } from './event-picker-modal'

const HOME_COLLAGE = '/images/home-collage.png'

export function HomeView() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const sessionType = useAuthStore((s) => s.sessionType)
  const [events, setEvents] = useState<EventResponse[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  const navigateToAlbum = (eventId: string, eventName?: string) => {
    navigate(`/host/albums/${eventId}`, { state: { eventName } })
  }

  const handleCreateAlbum = () => {
    navigate('/albums/new')
  }

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
        navigateToAlbum(list[0].id, list[0].name)
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
    const eventName = events?.find((e) => e.id === eventId)?.name
    navigateToAlbum(eventId, eventName)
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
          {isAuthenticated && sessionType !== 'GUEST' && (
            <button
              type="button"
              onClick={() => navigate('/me/profile')}
              className="mt-2 self-center text-[12px] tracking-[-0.24px] text-[#a2a5ad] underline"
            >
              프로필 수정
            </button>
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
