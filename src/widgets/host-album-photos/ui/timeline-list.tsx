import { type ReactNode } from 'react'

import { CheckerBackground } from './checker-background'

const PLUS_CIRCLE = '/icons/plus-circle.svg'
const PREVIEW_COUNT = 3

export type RowBucket = {
  id: string
  headerTitle: ReactNode
  totalCount: number
  photoCount: number
  ariaLabel: string
}

type TimelineListProps = {
  buckets: RowBucket[]
  onOpenBucket: (bucketId: string) => void
}

export function TimelineList({ buckets, onOpenBucket }: TimelineListProps) {
  return (
    <ul className="flex flex-col gap-4">
      {buckets.map((bucket) => {
        const showPlus = bucket.photoCount > PREVIEW_COUNT
        const previewCount = showPlus
          ? PREVIEW_COUNT
          : Math.min(bucket.photoCount, PREVIEW_COUNT + 1)
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
              {Array.from({ length: previewCount }).map((_, i) => (
                <div
                  key={`${bucket.id}-preview-${i}`}
                  className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-[4px] border border-[#d7dbe2] bg-[#f4f6fa]"
                >
                  <CheckerBackground />
                </div>
              ))}
              {showPlus && (
                <button
                  type="button"
                  onClick={() => onOpenBucket(bucket.id)}
                  aria-label={bucket.ariaLabel}
                  className="relative flex aspect-square min-w-0 flex-1 items-center justify-center overflow-hidden rounded-[4px] border border-[#d7dbe2] bg-[#f4f6fa]"
                >
                  <CheckerBackground />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[rgba(0,0,0,0.2)]"
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
