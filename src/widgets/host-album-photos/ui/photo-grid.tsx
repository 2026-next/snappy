const PHOTO_ICON = '/icons/photo.svg'
const HEART_ICON = '/icons/heart.svg'

export type PhotoItem = {
  id: string
  src: string | null
  isFavorite: boolean
}

type PhotoGridProps = {
  photos: PhotoItem[]
  totalCount: number
  onDelete: () => void
  onToggleFavorite: (id: string) => void
}

export function PhotoGrid({
  photos,
  totalCount,
  onDelete,
  onToggleFavorite,
}: PhotoGridProps) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-[2px]">
            <img
              src={PHOTO_ICON}
              alt=""
              className="h-[17px] w-[17px]"
              aria-hidden="true"
            />
            <p className="text-[12px] font-semibold leading-[1.4] tracking-[-0.24px] text-[#222226]">
              업로드된 사진
            </p>
          </div>
          <p className="text-[12px] leading-[1.4] tracking-[-0.24px] text-[#a2a5ad]">
            총 {totalCount.toLocaleString()}장
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="text-[12px] leading-[1.4] tracking-[-0.24px] text-[#a2a5ad] underline"
        >
          사진 삭제
        </button>
      </div>

      <ul className="grid grid-cols-3 gap-1">
        {photos.map((photo) => (
          <li key={photo.id}>
            <div className="relative aspect-square w-full overflow-hidden rounded-[4px] border border-[#d7dbe2] bg-[#f4f6fa]">
              {photo.src ? (
                <img
                  src={photo.src}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #e6eaf0 25%, transparent 25%), linear-gradient(-45deg, #e6eaf0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e6eaf0 75%), linear-gradient(-45deg, transparent 75%, #e6eaf0 75%)',
                    backgroundSize: '14px 14px',
                    backgroundPosition: '0 0, 0 7px, 7px -7px, -7px 0',
                  }}
                />
              )}
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
                  src={HEART_ICON}
                  alt=""
                  className={`h-5 w-5 transition-opacity ${
                    photo.isFavorite ? 'opacity-100' : 'opacity-90'
                  }`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
