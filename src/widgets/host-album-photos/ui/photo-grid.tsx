import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { type CategoryKey } from '@/widgets/host-album-photos/model/category'

import { CheckerBackground } from './checker-background'

const PHOTO_ICON = '/icons/photo.svg'
const HEART_PHOTO_INACTIVE = '/icons/heart.svg'
const HEART_PHOTO_ACTIVE = '/icons/heart-filled.svg'
const HEART_HEADER = '/icons/heart-outline.svg'
const CHECK_FILLED = '/icons/check-circle-filled.svg'
const CHECK_EMPTY = '/icons/check-circle-empty.svg'

export type PhotoItem = {
  id: string
  src: string | null
  isFavorite: boolean
}

type PhotoGridProps = {
  category: CategoryKey
  photos: PhotoItem[]
  totalCount: number
  onToggleFavorite: (id: string) => void
  isSelectionMode?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
  onEnterSelection?: () => void
  onExitSelection?: () => void
}

export function PhotoGrid({
  category,
  photos,
  totalCount,
  onToggleFavorite,
  isSelectionMode = false,
  selectedIds,
  onToggleSelect,
  onEnterSelection,
  onExitSelection,
}: PhotoGridProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { albumId } = useParams()
  const eventName = (location.state as { eventName?: string } | null)?.eventName
  const isFavoriteView = category === 'favorite'
  const headerIcon = isFavoriteView ? HEART_HEADER : PHOTO_ICON
  const headerLabel = isFavoriteView ? '즐겨찾기한 사진' : '업로드된 사진'
  const canToggleSelection = !!onEnterSelection && !!onExitSelection

  const handleOpenPhoto = (photoId: string) => {
    if (!albumId) return
    navigate(`/host/albums/${albumId}/photos/${photoId}`, { state: { eventName } })
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-[2px]">
            <img
              src={headerIcon}
              alt=""
              className="h-[17px] w-[17px]"
              aria-hidden="true"
            />
            <p className="text-[12px] font-semibold leading-[1.4] tracking-[-0.24px] text-[#222226]">
              {headerLabel}
            </p>
          </div>
          <p className="text-[12px] leading-[1.4] tracking-[-0.24px] text-[#a2a5ad]">
            총 {totalCount.toLocaleString()}장
          </p>
        </div>
        {canToggleSelection && (
          <button
            type="button"
            onClick={isSelectionMode ? onExitSelection : onEnterSelection}
            aria-pressed={isSelectionMode}
            className="text-[12px] leading-[1.4] tracking-[-0.24px] text-[#a2a5ad] underline"
          >
            {isSelectionMode ? '선택 취소' : '사진 선택'}
          </button>
        )}
      </div>

      <ul className="grid grid-cols-3 gap-1">
        {photos.map((photo) => {
          const isSelected = selectedIds?.has(photo.id) ?? false
          return (
            <li key={photo.id}>
              <div className="relative aspect-square w-full overflow-hidden rounded-[4px] border border-[#d7dbe2] bg-[#f4f6fa]">
                {isSelectionMode && onToggleSelect ? (
                  <button
                    type="button"
                    onClick={() => onToggleSelect(photo.id)}
                    aria-label={isSelected ? '선택 해제' : '선택'}
                    aria-pressed={isSelected}
                    className="absolute inset-0 h-full w-full"
                  >
                    {photo.src ? (
                      <img
                        src={photo.src}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <CheckerBackground />
                    )}
                    <span className="absolute inset-0 flex items-start justify-end p-1">
                      <img
                        src={isSelected ? CHECK_FILLED : CHECK_EMPTY}
                        alt=""
                        className="h-6 w-6"
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenPhoto(photo.id)}
                      aria-label="사진 자세히 보기"
                      className="absolute inset-0 h-full w-full"
                    >
                      {photo.src ? (
                        <img
                          src={photo.src}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <CheckerBackground />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(photo.id)}
                      aria-label={
                        photo.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'
                      }
                      aria-pressed={photo.isFavorite}
                      className="absolute bottom-[2px] right-[2px] flex h-6 w-6 items-center justify-center"
                    >
                      <img
                        src={
                          photo.isFavorite ? HEART_PHOTO_ACTIVE : HEART_PHOTO_INACTIVE
                        }
                        alt=""
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </button>
                  </>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
