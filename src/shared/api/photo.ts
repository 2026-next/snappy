import { apiFetch } from '@/shared/api/client'

export type SortOrder = 'asc' | 'desc'

export type RelationCode = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const RELATION_LABELS: Record<RelationCode, string> = {
  1: '부모',
  2: '친구',
  3: '형제자매',
  4: '친척',
  5: '직장동료',
  6: '지인',
  7: '기타',
}

export type RawPhoto = {
  id: string
  fileKey?: string | null
  url?: string | null
  thumbnailUrl?: string | null
  signedUrl?: string | null
  originalPhotoUrl?: string | null
  width?: number | null
  height?: number | null
  isFavorite?: boolean | null
  favorite?: boolean | null
  exifTakenAt?: string | null
  takenAt?: string | null
  createdAt?: string | null
  uploadedAt?: string | null
  updatedAt?: string | null
  uploaderId?: string | null
  uploaderName?: string | null
  uploaderRelation?: number | string | null
  uploader?: {
    id?: string | null
    name?: string | null
    relation?: number | string | null
  } | null
  message?: string | null
  retouched?: boolean | null
  isRetouched?: boolean | null
  isAi?: boolean | null
}

export type PhotoSummary = {
  id: string
  url: string | null
  thumbnailUrl: string | null
  width: number | null
  height: number | null
  isFavorite: boolean
  takenAt: string | null
  uploadedAt: string | null
  uploaderId: string | null
  uploaderName: string | null
  uploaderRelation: RelationCode | null
  isRetouched: boolean
  isAi: boolean
}

export type PhotoDetail = PhotoSummary & {
  originalUrl: string | null
  message: string | null
}

export type AlbumQuery = {
  eventId: string
  page?: number
  offset?: number
  order?: SortOrder
}

export type AlbumPage = {
  items: PhotoSummary[]
  total: number
  page: number | null
  hasNext: boolean
}

export type TimelineBucket = {
  id: string
  date: string
  time: string
  totalCount: number
  photos: PhotoSummary[]
}

export type UploaderBucket = {
  id: string
  name: string
  relation: string
  relationCode: RelationCode | null
  totalCount: number
  photos: PhotoSummary[]
}

export type SimilarBucket = {
  id: string
  totalCount: number
  photos: PhotoSummary[]
}

export type UploaderSearchResult = {
  id: string
  name: string
  relation: string
  relationCode: RelationCode | null
}

export type CreateUploadUrlsInput = {
  fileCount: number
  mimeType: string
}

export type UploadUrlEntry = {
  fileKey: string
  uploadUrl: string
}

export type CreatePhotoInput = {
  fileKey: string
  embedding: string[]
  mimeType?: string
  fileSizeBytes?: number
  width?: number
  height?: number
  exifTakenAt?: string
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const usp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    usp.set(key, String(value))
  }
  const qs = usp.toString()
  return qs.length > 0 ? `?${qs}` : ''
}

function toRelationCode(value: unknown): RelationCode | null {
  if (typeof value === 'number' && value >= 1 && value <= 7) {
    return value as RelationCode
  }
  if (typeof value === 'string') {
    const n = Number(value)
    if (Number.isInteger(n) && n >= 1 && n <= 7) return n as RelationCode
  }
  return null
}

function relationLabel(code: RelationCode | null, fallback?: string | null): string {
  if (code != null) return RELATION_LABELS[code]
  if (typeof fallback === 'string' && fallback.length > 0) return fallback
  return ''
}

export function normalizePhoto(raw: RawPhoto): PhotoSummary {
  const uploader = raw.uploader ?? null
  const uploaderId = raw.uploaderId ?? uploader?.id ?? null
  const uploaderName = raw.uploaderName ?? uploader?.name ?? null
  const uploaderRelation = toRelationCode(
    raw.uploaderRelation ?? uploader?.relation ?? null,
  )
  return {
    id: String(raw.id),
    url: raw.url ?? raw.signedUrl ?? raw.originalPhotoUrl ?? null,
    thumbnailUrl: raw.thumbnailUrl ?? raw.url ?? raw.signedUrl ?? raw.originalPhotoUrl ?? null,
    width: raw.width ?? null,
    height: raw.height ?? null,
    isFavorite: Boolean(raw.isFavorite ?? raw.favorite ?? false),
    takenAt: raw.exifTakenAt ?? raw.takenAt ?? null,
    uploadedAt: raw.uploadedAt ?? raw.createdAt ?? raw.updatedAt ?? null,
    uploaderId,
    uploaderName,
    uploaderRelation,
    isRetouched: Boolean(raw.isRetouched ?? raw.retouched ?? false),
    isAi: Boolean(raw.isAi ?? false),
  }
}

export function normalizePhotoDetail(raw: RawPhoto): PhotoDetail {
  const base = normalizePhoto(raw)
  return {
    ...base,
    originalUrl: raw.url ?? raw.signedUrl ?? null,
    message: raw.message ?? null,
  }
}

type AlbumRawResponse =
  | RawPhoto[]
  | {
      items?: RawPhoto[]
      data?: RawPhoto[]
      photos?: RawPhoto[]
      total?: number
      totalCount?: number
      count?: number
      page?: number
      hasNext?: boolean
      nextPage?: number | null
    }

function normalizeAlbumResponse(raw: AlbumRawResponse): AlbumPage {
  if (Array.isArray(raw)) {
    const items = raw.map(normalizePhoto)
    return { items, total: items.length, page: null, hasNext: false }
  }
  const list = raw.items ?? raw.data ?? raw.photos ?? []
  const items = list.map(normalizePhoto)
  return {
    items,
    total: raw.total ?? raw.totalCount ?? raw.count ?? items.length,
    page: raw.page ?? null,
    hasNext: raw.hasNext ?? raw.nextPage != null,
  }
}

export async function getAlbum(query: AlbumQuery): Promise<AlbumPage> {
  const qs = buildQuery({
    eventId: query.eventId,
    page: query.page,
    offset: query.offset,
    order: query.order,
  })
  const raw = await apiFetch<AlbumRawResponse>(`/photo/views${qs}`)
  return normalizeAlbumResponse(raw)
}

type TimelineRaw = {
  id?: string
  bucketId?: string
  key?: string
  date?: string
  hour?: number | string
  time?: string
  startedAt?: string
  totalCount?: number
  total?: number
  count?: number
  photos?: RawPhoto[]
  items?: RawPhoto[]
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function deriveDateTime(raw: TimelineRaw): { date: string; time: string; id: string } {
  const id = raw.id ?? raw.bucketId ?? raw.key ?? raw.startedAt ?? ''
  if (raw.date && raw.time) {
    return { id: id || `${raw.date}T${raw.time}`, date: raw.date, time: raw.time }
  }
  if (raw.date && raw.hour != null) {
    const h = typeof raw.hour === 'number' ? raw.hour : Number(raw.hour)
    const time = `${pad2(h)}:00`
    return { id: id || `${raw.date}T${time}`, date: raw.date, time }
  }
  if (raw.startedAt) {
    const d = new Date(raw.startedAt)
    if (!Number.isNaN(d.getTime())) {
      const date = `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`
      const time = `${pad2(d.getHours())}:00`
      return { id: id || raw.startedAt, date, time }
    }
  }
  return { id: String(id || ''), date: raw.date ?? '', time: raw.time ?? '' }
}

export async function getTimeline(eventId: string): Promise<TimelineBucket[]> {
  const raw = await apiFetch<TimelineRaw[]>(
    `/photo/views/timeline${buildQuery({ eventId })}`,
  )
  return (raw ?? []).map((bucket) => {
    const photos = (bucket.photos ?? bucket.items ?? []).map(normalizePhoto)
    const { id, date, time } = deriveDateTime(bucket)
    const totalCount = bucket.totalCount ?? bucket.total ?? bucket.count ?? photos.length
    return { id, date, time, totalCount, photos }
  })
}

type UploaderRaw = {
  id?: string
  uploaderId?: string
  name?: string
  uploaderName?: string
  relation?: number | string
  uploaderRelation?: number | string
  totalCount?: number
  total?: number
  count?: number
  photos?: RawPhoto[]
  items?: RawPhoto[]
}

export async function getUploaderGrouping(
  eventId: string,
): Promise<UploaderBucket[]> {
  const raw = await apiFetch<UploaderRaw[]>(
    `/photo/views/uploader-grouping${buildQuery({ eventId })}`,
  )
  return (raw ?? []).map((bucket) => {
    const photos = (bucket.photos ?? bucket.items ?? []).map(normalizePhoto)
    const relationCode = toRelationCode(
      bucket.uploaderRelation ?? bucket.relation ?? null,
    )
    return {
      id: String(bucket.uploaderId ?? bucket.id ?? bucket.name ?? ''),
      name: bucket.uploaderName ?? bucket.name ?? '',
      relation: relationLabel(relationCode),
      relationCode,
      totalCount: bucket.totalCount ?? bucket.total ?? bucket.count ?? photos.length,
      photos,
    }
  })
}

type SimilarRaw = {
  id?: string
  groupId?: string
  totalCount?: number
  total?: number
  count?: number
  photos?: RawPhoto[]
  items?: RawPhoto[]
}

export async function getSimilarComposition(
  eventId: string,
): Promise<SimilarBucket[]> {
  const raw = await apiFetch<SimilarRaw[]>(
    `/photo/views/similar-composition${buildQuery({ eventId })}`,
  )
  return (raw ?? []).map((bucket, index) => {
    const photos = (bucket.photos ?? bucket.items ?? []).map(normalizePhoto)
    return {
      id: String(bucket.groupId ?? bucket.id ?? `similar-${index}`),
      totalCount: bucket.totalCount ?? bucket.total ?? bucket.count ?? photos.length,
      photos,
    }
  })
}

type UploaderSearchRaw = {
  id?: string
  uploaderId?: string
  name?: string
  uploaderName?: string
  relation?: number | string
  uploaderRelation?: number | string
}

export async function searchUploader(
  eventId: string,
  name: string,
): Promise<UploaderSearchResult[]> {
  const raw = await apiFetch<UploaderSearchRaw[]>(`/photo/views/uploader-search`, {
    method: 'POST',
    body: JSON.stringify({ eventId, name }),
  })
  return (raw ?? []).map((entry) => {
    const relationCode = toRelationCode(
      entry.uploaderRelation ?? entry.relation ?? null,
    )
    return {
      id: String(entry.uploaderId ?? entry.id ?? entry.name ?? ''),
      name: entry.uploaderName ?? entry.name ?? '',
      relation: relationLabel(relationCode),
      relationCode,
    }
  })
}

export async function getPhotoDetail(photoId: string): Promise<PhotoDetail> {
  const raw = await apiFetch<RawPhoto>(`/photo/detail/${encodeURIComponent(photoId)}`)
  return normalizePhotoDetail(raw)
}

export async function getMyPhotos(): Promise<PhotoSummary[]> {
  const raw = await apiFetch<RawPhoto[] | { items?: RawPhoto[] }>(`/photo/my`)
  const list = Array.isArray(raw) ? raw : (raw.items ?? [])
  return list.map(normalizePhoto)
}

export async function toggleFavorite(photoId: string): Promise<void> {
  await apiFetch<unknown>(`/photo/${encodeURIComponent(photoId)}/favorite`, {
    method: 'PATCH',
  })
}

export async function deletePhoto(photoId: string): Promise<void> {
  await apiFetch<unknown>(`/photo/${encodeURIComponent(photoId)}`, {
    method: 'DELETE',
  })
}

export async function createUploadUrls(
  input: CreateUploadUrlsInput,
): Promise<UploadUrlEntry[]> {
  const raw = await apiFetch<UploadUrlEntry[] | { uploadUrls?: UploadUrlEntry[]; items?: UploadUrlEntry[] }>(
    `/photo/upload-url`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
  return Array.isArray(raw) ? raw : (raw.uploadUrls ?? raw.items ?? [])
}

export async function createPhoto(
  input: CreatePhotoInput,
): Promise<PhotoSummary | null> {
  const raw = await apiFetch<RawPhoto | null>(`/photo`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return raw ? normalizePhoto(raw) : null
}
