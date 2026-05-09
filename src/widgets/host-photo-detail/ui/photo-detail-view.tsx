import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { getMyEvents } from '@/shared/api/event'
import {
  RELATION_LABELS,
  type PhotoDetail,
  deletePhoto,
  getPhotoDetail,
  toggleFavorite,
} from '@/shared/api/photo'

const CHEVRON_RIGHT = '/icons/chevron-right.svg'
const MORE_ICON = '/icons/more.svg'
const TRASH_ICON = '/icons/trash.svg'
const DOWNLOAD_ICON = '/icons/download.svg'
const HEART_OUTLINE = '/icons/heart-outline.svg'
const HEART_FILLED = '/icons/heart-filled.svg'
const AI_SPARKLE = '/icons/ai-sparkle.svg'

const FALLBACK_PHOTO = '/images/album-cover-sample.png'

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

function formatTime(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function PhotoDetailView() {
  const navigate = useNavigate()
  const location = useLocation()
  const { albumId, photoId } = useParams<{ albumId: string; photoId: string }>()

  const stateEventName = (location.state as { eventName?: string } | null)?.eventName
  const [albumTitle, setAlbumTitle] = useState(stateEventName ?? '')

  const [photo, setPhoto] = useState<PhotoDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isMutating, setIsMutating] = useState(false)

  useEffect(() => {
    if (albumTitle || !albumId) return
    getMyEvents()
      .then((events) => {
        const event = events.find((e) => e.id === albumId)
        if (event) setAlbumTitle(event.name)
      })
      .catch(() => {})
  }, [albumId, albumTitle])

  useEffect(() => {
    if (!photoId) return
    let cancelled = false
    setIsLoading(true)
    setError(null)
    getPhotoDetail(photoId)
      .then((detail) => {
        if (!cancelled) setPhoto(detail)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '사진을 불러오지 못했어요')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [photoId])

  const handleBack = () => navigate(-1)
  const handleMore = () => {}
  const handleOpenDelete = () => setIsDeleteModalOpen(true)
  const handleCloseDelete = () => setIsDeleteModalOpen(false)

  const handleConfirmDelete = async () => {
    if (!photoId || isMutating) return
    setIsMutating(true)
    try {
      await deletePhoto(photoId)
      setIsDeleteModalOpen(false)
      navigate(-1)
    } catch (err) {
      setError(err instanceof Error ? err.message : '사진 삭제에 실패했어요')
    } finally {
      setIsMutating(false)
    }
  }

  const handleDownload = () => {
    if (!albumId || !photoId) return
    navigate(`/host/albums/${albumId}/photos/${photoId}/save`)
  }

  const handleToggleFavorite = async () => {
    if (!photoId || !photo || isMutating) return
    const previous = photo.isFavorite
    setPhoto({ ...photo, isFavorite: !previous })
    setIsMutating(true)
    try {
      await toggleFavorite(photoId)
    } catch (err) {
      setPhoto((prev) => (prev ? { ...prev, isFavorite: previous } : prev))
      setError(err instanceof Error ? err.message : '즐겨찾기 변경에 실패했어요')
    } finally {
      setIsMutating(false)
    }
  }

  const handleEdit = () => {
    if (!albumId || !photoId) return
    navigate(`/host/albums/${albumId}/photos/${photoId}/edit`, {
      state: { photoUrl: photoSrc },
    })
  }

  const photoSrc = photo?.url ?? photo?.thumbnailUrl ?? FALLBACK_PHOTO
  const isFavorite = photo?.isFavorite ?? false
  const message = photo?.message ?? ''
  const uploaderName = photo?.uploaderName ?? ''
  const uploaderRelation =
    photo?.uploaderRelation != null ? RELATION_LABELS[photo.uploaderRelation] : ''
  const takenAt = photo?.takenAt ?? null
  const uploadedAt = photo?.uploadedAt ?? null
  const retouchedLabel = photo?.isRetouched ? '보정 완료' : '보정 전'

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
        <h1 className="text-[20px] font-bold tracking-[-0.4px] text-[#222226]">
          {albumTitle}
        </h1>
        <button
          type="button"
          onClick={handleMore}
          aria-label="더 보기"
          className="absolute right-5 flex h-10 w-10 items-center justify-center"
        >
          <img src={MORE_ICON} alt="" className="h-6 w-6" aria-hidden="true" />
        </button>
      </header>

      <div className="relative aspect-[402/302] w-full overflow-hidden bg-[#f4f6fa]">
        <img
          src={photoSrc}
          alt=""
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center justify-between px-5 pt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenDelete}
            aria-label="사진 삭제"
            disabled={isLoading || isMutating || !photo}
            className="flex h-[38px] items-center justify-center rounded-[10px] bg-[#f4f6fa] px-2 disabled:opacity-50"
          >
            <img src={TRASH_ICON} alt="" className="h-6 w-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleDownload}
            aria-label="사진 저장"
            disabled={isLoading || !photo}
            className="flex h-[38px] items-center justify-center rounded-[10px] bg-[#f4f6fa] px-2 text-[#222226] disabled:opacity-50"
          >
            <img src={DOWNLOAD_ICON} alt="" className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          aria-pressed={isFavorite}
          disabled={isLoading || isMutating || !photo}
          className="flex h-12 w-12 items-center justify-center disabled:opacity-50"
        >
          <img
            src={isFavorite ? HEART_FILLED : HEART_OUTLINE}
            alt=""
            className="h-6 w-6"
            aria-hidden="true"
          />
        </button>
      </div>

      {error && (
        <p className="px-5 pt-2 text-[12px] text-[#e23a3a]">{error}</p>
      )}
      {isLoading && !photo && (
        <p className="px-5 pt-2 text-[12px] text-[#a2a5ad]">사진 정보를 불러오는 중...</p>
      )}

      <div className="mt-4 flex flex-col gap-2 px-5">
        <div className="flex flex-col items-start rounded-2xl bg-[#f4f6fa] px-5 py-3">
          <div className="flex gap-3 text-[14px] leading-[1.4] tracking-[-0.28px]">
            <p className="w-[90px] shrink-0 text-[#616369]">축하 메세지</p>
            <p className="text-[#222226]">{message || '-'}</p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 rounded-2xl bg-[#f4f6fa] px-5 py-3">
          <div className="flex gap-3 text-[14px] leading-[1.4] tracking-[-0.28px]">
            <p className="w-[90px] shrink-0 text-[#616369]">업로드자</p>
            <div className="flex items-center gap-1 text-[#222226]">
              <span>{uploaderName || '-'}</span>
              {uploaderRelation && (
                <>
                  <span>·</span>
                  <span>{uploaderRelation}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-3 text-[14px] leading-[1.4] tracking-[-0.28px]">
            <p className="w-[90px] shrink-0 text-[#616369]">촬영 시간</p>
            <div className="flex items-center gap-1 text-[#222226]">
              <span>{formatDate(takenAt) || '-'}</span>
              <span>{formatTime(takenAt)}</span>
            </div>
          </div>
          <div className="flex gap-3 text-[14px] leading-[1.4] tracking-[-0.28px]">
            <p className="w-[90px] shrink-0 text-[#616369]">업로드 시간</p>
            <div className="flex items-center gap-1 text-[#222226]">
              <span>{formatDate(uploadedAt) || '-'}</span>
              <span>{formatTime(uploadedAt)}</span>
            </div>
          </div>
          <div className="flex gap-3 text-[14px] leading-[1.4] tracking-[-0.28px]">
            <p className="w-[90px] shrink-0 text-[#616369]">보정 여부</p>
            <p className="text-[#222226]">{retouchedLabel}</p>
          </div>
        </div>
      </div>

      <div className="mt-auto px-5 pb-5 pt-6">
        <button
          type="button"
          onClick={handleEdit}
          disabled={isLoading || !photo}
          className="flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-[#222226] text-[18px] font-medium text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
        >
          <img src={AI_SPARKLE} alt="" className="h-6 w-6" aria-hidden="true" />
          사진 보정하기
        </button>
      </div>

      {isDeleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-delete-title"
          className="fixed inset-0 z-30 mx-auto flex w-full max-w-[402px] items-center justify-center px-5"
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={handleCloseDelete}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative flex w-full flex-col items-center gap-5 rounded-[18px] bg-white px-4 py-5">
            <h2
              id="photo-delete-title"
              className="text-[20px] font-bold leading-normal text-[#222226]"
            >
              이 사진을 삭제할까요?
            </h2>
            <p className="text-center text-[14px] leading-[1.5] text-[#616369]">
              삭제한 사진은 앨범에서 사라지며 복구할 수 없어요.
              <br />
              삭제를 계속 진행하시겠어요?
            </p>
            <div className="flex w-full items-center gap-4">
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isMutating}
                className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#f4f6fa] text-[18px] font-medium text-[#222226] disabled:opacity-50"
              >
                {isMutating ? '삭제 중...' : '삭제하기'}
              </button>
              <button
                type="button"
                onClick={handleCloseDelete}
                disabled={isMutating}
                className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#222226] text-[18px] font-medium text-white disabled:opacity-50"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
