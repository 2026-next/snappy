import { type PhotoSummary, type RelationCode } from '@/shared/api/photo'

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

const RELATIONSHIP_TO_CODE: Record<RelationshipKey, RelationCode> = {
  parent: 1,
  friend: 2,
  sibling: 3,
  relative: 4,
  colleague: 5,
  acquaintance: 6,
  other: 7,
}

export function isFilterEmpty(filter: FilterValue): boolean {
  return filter.relationships.length === 0 && filter.photoStatus.length === 0
}

export function photoMatchesFilter(
  photo: PhotoSummary,
  filter: FilterValue,
): boolean {
  if (filter.relationships.length > 0) {
    const allowed = new Set<RelationCode>(
      filter.relationships.map((key) => RELATIONSHIP_TO_CODE[key]),
    )
    if (photo.uploaderRelation == null || !allowed.has(photo.uploaderRelation)) {
      return false
    }
  }
  if (filter.photoStatus.length > 0) {
    const wantOriginal = filter.photoStatus.includes('original')
    const wantEdited = filter.photoStatus.includes('edited')
    if (wantOriginal && wantEdited) return true
    if (wantEdited && !photo.isRetouched) return false
    if (wantOriginal && photo.isRetouched) return false
  }
  return true
}
