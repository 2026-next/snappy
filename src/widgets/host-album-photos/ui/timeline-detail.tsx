import { type ReactNode } from 'react'

import { type TimelinePhoto } from '@/widgets/host-album-photos/model/timeline'

import { CheckerBackground } from './checker-background'

const HEART_PHOTO_INACTIVE = '/icons/heart.svg'
const HEART_PHOTO_ACTIVE = '/icons/heart-filled.svg'
const AI_SPARKLE = '/icons/ai-sparkle.svg'
const CHECK_FILLED = '/icons/check-circle-filled.svg'
const CHECK_EMPTY = '/icons/check-circle-empty.svg'

type TimelineDetailProps = {
  headerTitle?: ReactNode
  totalCount: number
  photos: TimelinePhoto[]
  isSelectionMode: boolean
  selectedIds: Set<string>
  onToggleFavorite: (id: string) => void
  onToggleSelect: (id: string) => void
  onEnterSelection: () => void
  onExitSelection: () => void
  onOpenPhoto?: (id: string) => void
}

export function TimelineDetail({
  headerTitle,
  totalCount,
  photos,
  isSelectionMode,
  selectedIds,
  onToggleFavorite,
  onToggleSelect,
  onEnterSelection,
  onExitSelection,
  onOpenPhoto,
}: TimelineDetailProps) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 px-1 text-[12px]">
          {headerTitle ? (
            <>
              {headerTitle}
              <span className="ml-1 leading-[1.4] tracking-[-0.24px] text-[#a2a5ad]">
                총 {totalCount.toLocaleString()}장
              </span>
            </>
          ) : (
            <span className="leading-[1.4] tracking-[-0.24px] text-[#a2a5ad]">
              총 {totalCount.toLocaleString()}장
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={isSelectionMode ? onExitSelection : onEnterSelection}
          aria-pressed={isSelectionMode}
          className="text-[12px] leading-[1.4] tracking-[-0.24px] text-[#a2a5ad] underline"
        >
          {isSelectionMode ? '선택 취소' : '사진 선택'}
        </button>
      </div>

      <ul className="grid grid-cols-3 gap-1">
        {photos.map((photo) => {
          const isSelected = selectedIds.has(photo.id)
          return (
            <li key={photo.id}>
              <div className="relative aspect-square w-full overflow-hidden rounded-[4px] border border-[#d7dbe2] bg-[#f4f6fa]">
                {!isSelectionMode && onOpenPhoto ? (
                  <button
                    type="button"
                    onClick={() => onOpenPhoto(photo.id)}
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
                ) : photo.src ? (
                  <img
                    src={photo.src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <CheckerBackground />
                )}

                {photo.isAi && !isSelectionMode && (
                  <img
                    src={AI_SPARKLE}
                    alt=""
                    aria-hidden="true"
                    className="absolute left-[5px] top-[4px] h-[19px] w-[19px]"
                  />
                )}

                {isSelectionMode ? (
                  <button
                    type="button"
                    onClick={() => onToggleSelect(photo.id)}
                    aria-label={isSelected ? '선택 해제' : '선택'}
                    aria-pressed={isSelected}
                    className="absolute inset-0 flex items-start justify-end p-1"
                  >
                    <img
                      src={isSelected ? CHECK_FILLED : CHECK_EMPTY}
                      alt=""
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
                  </button>
                ) : (
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
                        photo.isFavorite
                          ? HEART_PHOTO_ACTIVE
                          : HEART_PHOTO_INACTIVE
                      }
                      alt=""
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
