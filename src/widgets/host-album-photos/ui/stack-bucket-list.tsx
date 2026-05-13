import { CheckerBackground } from './checker-background'

export type StackBucket = {
  id: string
  totalCount: number
  label?: string
  countSuffix?: '장' | '개'
  coverSrc?: string | null
}

type StackBucketListProps = {
  buckets: StackBucket[]
  onOpenBucket: (bucketId: string) => void
  ariaLabelFor: (bucket: StackBucket) => string
  flat?: boolean
}

export function StackBucketList({
  buckets,
  onOpenBucket,
  ariaLabelFor,
  flat = false,
}: StackBucketListProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-2 gap-y-3">
      {buckets.map((bucket) => (
        <li key={bucket.id}>
          <button
            type="button"
            onClick={() => onOpenBucket(bucket.id)}
            aria-label={ariaLabelFor(bucket)}
            className="relative block aspect-square w-full"
          >
            {!flat && (
              <>
                <StackTile className="absolute left-[7.65px] top-0 h-[calc(100%-7.65px)] w-[calc(100%-7.65px)]" />
                <StackTile className="absolute left-[3.83px] top-[3.83px] h-[calc(100%-7.65px)] w-[calc(100%-7.65px)]" />
              </>
            )}
            <div
              className={
                flat
                  ? 'absolute inset-0 overflow-hidden rounded-[4px] border border-[#d7dbe2] bg-[#f4f6fa]'
                  : 'absolute left-0 top-[7.65px] h-[calc(100%-7.65px)] w-[calc(100%-7.65px)] overflow-hidden rounded-[4px] border border-[#d7dbe2] bg-[#f4f6fa]'
              }
            >
              {bucket.coverSrc ? (
                <img
                  src={bucket.coverSrc}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  aria-hidden="true"
                />
              ) : (
                <CheckerBackground />
              )}
              {bucket.label ? (
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[40px] bg-gradient-to-b from-black/40 to-transparent" />
              ) : null}
              {bucket.label ? (
                <p className="absolute left-[10px] top-[9px] text-[12px] font-semibold leading-normal text-white">
                  {bucket.label}
                </p>
              ) : null}
              <p
                className={`absolute bottom-[8px] right-[8px] text-[12px] leading-normal ${
                  bucket.coverSrc ? 'text-white' : 'text-[#878787]'
                }`}
              >
                총 {bucket.totalCount.toLocaleString()}
                {bucket.countSuffix ?? '장'}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  )
}

function StackTile({ className }: { className: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[4px] border border-[#d7dbe2] bg-[#f4f6fa] ${className}`}
    >
      <CheckerBackground />
    </div>
  )
}
