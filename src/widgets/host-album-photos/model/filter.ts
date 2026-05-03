export type RelationshipKey =
  | 'parent'
  | 'friend'
  | 'sibling'
  | 'relative'
  | 'colleague'
  | 'acquaintance'
  | 'other'

export type PhotoStatusKey = 'original' | 'edited'

export type FilterValue = {
  relationships: RelationshipKey[]
  photoStatus: PhotoStatusKey[]
}

export const RELATIONSHIP_OPTIONS: { key: RelationshipKey; label: string }[] = [
  { key: 'parent', label: '부모' },
  { key: 'friend', label: '친구' },
  { key: 'sibling', label: '형제자매' },
  { key: 'relative', label: '친척' },
  { key: 'colleague', label: '회사동료' },
  { key: 'acquaintance', label: '지인' },
  { key: 'other', label: '기타' },
]

export const PHOTO_STATUS_OPTIONS: { key: PhotoStatusKey; label: string }[] = [
  { key: 'original', label: '원본' },
  { key: 'edited', label: '보정 완료' },
]

export const EMPTY_FILTER: FilterValue = {
  relationships: [],
  photoStatus: [],
}
