export type CategoryKey =
  | 'all'
  | 'timeline'
  | 'similar'
  | 'uploader'
  | 'favorite'
  | 'group'

export type CategoryOption = {
  key: CategoryKey
  label: string
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { key: 'all', label: '전체' },
  { key: 'timeline', label: '타임라인' },
  { key: 'similar', label: '비슷한 구도' },
  { key: 'uploader', label: '업로더별' },
  { key: 'favorite', label: '즐겨찾기' },
  { key: 'group', label: '그룹별' },
]
