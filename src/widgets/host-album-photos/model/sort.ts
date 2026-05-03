export type SortKey = 'newest' | 'oldest' | 'taken'

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: '최신 업로드순' },
  { key: 'oldest', label: '오래된 업로드순' },
  { key: 'taken', label: '촬영 시간순' },
]

export const DEFAULT_SORT: SortKey = 'newest'
