type GridSkeletonProps = {
  count?: number
  columns?: 2 | 3
}

export function GridSkeleton({ count = 9, columns = 3 }: GridSkeletonProps) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="shimmer h-4 w-32 rounded" />
        <div className="shimmer h-4 w-12 rounded" />
      </div>
      <ul
        className={`grid gap-1 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}
      >
        {Array.from({ length: count }).map((_, i) => (
          <li key={i}>
            <div className="shimmer relative aspect-square w-full overflow-hidden rounded-[4px]" />
          </li>
        ))}
      </ul>
    </section>
  )
}

type RowListSkeletonProps = {
  rows?: number
}

export function RowListSkeleton({ rows = 3 }: RowListSkeletonProps) {
  return (
    <ul className="flex flex-col gap-4">
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <div className="shimmer h-4 w-28 rounded" />
            <div className="shimmer h-4 w-12 rounded" />
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className="shimmer relative aspect-square min-w-0 flex-1 overflow-hidden rounded-[4px]"
              />
            ))}
          </div>
        </li>
      ))}
    </ul>
  )
}

type StackGridSkeletonProps = {
  count?: number
}

export function StackGridSkeleton({ count = 4 }: StackGridSkeletonProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-2 gap-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <div className="shimmer relative aspect-square w-full overflow-hidden rounded-[4px]" />
        </li>
      ))}
    </ul>
  )
}
