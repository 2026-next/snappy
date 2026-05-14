import { type ReactNode } from 'react'

import { CheckerBackground } from './checker-background'

const PLUS_CIRCLE = '/icons/plus-circle.svg'
const PREVIEW_COUNT = 3

export type RowBucketThumbnail = {
  id: string
  src: string | null
}

export type RowBucket = {
  id: string
  headerTitle: ReactNode
  totalCount: number
  photoCount: number
  ariaLabel: string
  thumbnails?: RowBucketThumbnail[]
}

type TimelineListProps = {
  buckets: RowBucket[]
  onOpenBucket: (bucketId: string) => void
  onOpenPhoto?: (photoId: string) => void
}

export function TimelineList({
  buckets,
  onOpenBucket,
  onOpenPhoto,
}: TimelineListProps) {
  return (
    <ul className="flex flex-col gap-4">
      {buckets.map((bucket) => {
        const showPlus = bucket.photoCount > PREVIEW_COUNT
        const previewCount = showPlus
          ? PREVIEW_COUNT
          : Math.min(bucket.photoCount, PREVIEW_COUNT + 1)
        const thumbnails = bucket.thumbnails ?? []
        return (
          <li key={bucket.id} className="flex flex-col gap-2">
            <div className="flex items-end justify-between text-[12px]">
              <div className="flex items-center gap-1 px-1 font-semibold text-[#222226]">
                {bucket.headerTitle}
              </div>
              <p className="text-right text-[#a2a5ad]">
                총 {bucket.totalCount.toLocaleString()}장
              </p>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: previewCount }).map((_, i) => {
                const thumb = thumbnails[i]
                const tileClass =
                  'relative aspect-square min-w-0 flex-1 overflow-hidden rounded-[4px] border border-[#d7dbe2] bg-[#f4f6fa]'
                const content = thumb?.src ? (
                  <img
                    src={thumb.src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    aria-hidden="true"
                  />
                ) : (
                  <CheckerBackground />
                )
                if (onOpenPhoto && thumb?.id) {
                  return (
                    <button
                      key={`${bucket.id}-preview-${i}`}
                      type="button"
                      onClick={() => onOpenPhoto(thumb.id)}
                      aria-label="사진 자세히 보기"
                      className={tileClass}
                    >
                      {content}
                    </button>
                  )
                }
                return (
                  <div key={`${bucket.id}-preview-${i}`} className={tileClass}>
                    {content}
                  </div>
                )
              })}
              {showPlus && (
                <button
                  type="button"
                  onClick={() => onOpenBucket(bucket.id)}
                  aria-label={bucket.ariaLabel}
                  className="relative flex aspect-square min-w-0 flex-1 items-center justify-center overflow-hidden rounded-[4px] border border-[#d7dbe2] bg-[#f4f6fa]"
                >
                  {thumbnails[PREVIEW_COUNT]?.src ? (
                    <img
                      src={thumbnails[PREVIEW_COUNT].src as string}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckerBackground />
                  )}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[rgba(0,0,0,0.35)]"
                  />
                  <img
                    src={PLUS_CIRCLE}
                    alt=""
                    className="relative h-6 w-6"
                    aria-hidden="true"
                  />
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
