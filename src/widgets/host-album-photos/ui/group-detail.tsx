import { type PhotoItem } from '@/widgets/host-album-photos/ui/photo-grid'

import { CheckerBackground } from './checker-background'

const CHECK_FILLED = '/icons/check-circle-filled.svg'
const CHECK_EMPTY = '/icons/check-circle-empty.svg'

type GroupDetailProps = {
  groupName: string
  totalCount: number
  photos: PhotoItem[]
  isSelectionMode: boolean
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onEnterSelection: () => void
  onExitSelection: () => void
}

export function GroupDetail({
  groupName,
  totalCount,
  photos,
  isSelectionMode,
  selectedIds,
  onToggleSelect,
  onEnterSelection,
  onExitSelection,
}: GroupDetailProps) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 px-1 text-[12px]">
          <span className="font-semibold text-[#222226]">{groupName}</span>
          <span className="ml-1 leading-[1.4] tracking-[-0.24px] text-[#a2a5ad]">
            총 {totalCount.toLocaleString()}장
          </span>
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
                {photo.src ? (
                  <img
                    src={photo.src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <CheckerBackground />
                )}
                {isSelectionMode && (
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
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
