import { apiFetch } from '@/shared/api/client'
import {
  type PhotoSummary,
  type RawPhoto,
  normalizePhoto,
} from '@/shared/api/photo'

export type PhotoGroup = {
  id: string
  name: string
  eventId: string
  createdByUserId: string | null
  photoCount: number
}

type RawPhotoGroup = {
  id: string
  name: string
  eventId: string
  createdByUserId?: string | null
  _count?: { photos?: number | null } | null
  photoCount?: number | null
}

function normalizeGroup(raw: RawPhotoGroup): PhotoGroup {
  const fromCount = raw._count?.photos
  const photoCount =
    typeof raw.photoCount === 'number'
      ? raw.photoCount
      : typeof fromCount === 'number'
        ? fromCount
        : 0
  return {
    id: String(raw.id),
    name: raw.name ?? '',
    eventId: String(raw.eventId),
    createdByUserId: raw.createdByUserId ?? null,
    photoCount,
  }
}

export async function getPhotoGroups(eventId: string): Promise<PhotoGroup[]> {
  const qs = `?eventId=${encodeURIComponent(eventId)}`
  const raw = await apiFetch<RawPhotoGroup[] | { items?: RawPhotoGroup[] }>(
    `/photo/groups${qs}`,
  )
  const list = Array.isArray(raw) ? raw : (raw.items ?? [])
  return list.map(normalizeGroup)
}

export type CreatePhotoGroupInput = {
  eventId: string
  name: string
  photoIds?: string[]
}

export async function createPhotoGroup(
  input: CreatePhotoGroupInput,
): Promise<PhotoGroup> {
  const raw = await apiFetch<RawPhotoGroup>(`/photo/groups`, {
    method: 'POST',
    body: JSON.stringify({
      eventId: input.eventId,
      name: input.name,
      photoIds: input.photoIds ?? [],
    }),
  })
  return normalizeGroup(raw)
}

type RawGroupPhotosResponse =
  | RawPhoto[]
  | {
      photos?: RawPhoto[]
      items?: RawPhoto[]
      data?: RawPhoto[]
      pagination?: {
        total?: number
        offset?: number
        page?: number
        pageSize?: number
      } | null
      total?: number
    }

export type GroupPhotosPage = {
  items: PhotoSummary[]
  total: number
}

export type GroupPhotosQuery = {
  page?: number
  offset?: number
  order?: 'asc' | 'desc'
}

export async function getPhotoGroupPhotos(
  groupId: string,
  query: GroupPhotosQuery = {},
): Promise<GroupPhotosPage> {
  const usp = new URLSearchParams()
  if (query.page != null) usp.set('page', String(query.page))
  if (query.offset != null) usp.set('offset', String(query.offset))
  if (query.order) usp.set('order', query.order)
  const qs = usp.toString().length > 0 ? `?${usp.toString()}` : ''
  const raw = await apiFetch<RawGroupPhotosResponse>(
    `/photo/groups/${encodeURIComponent(groupId)}/photos${qs}`,
  )
  if (Array.isArray(raw)) {
    const items = raw.map(normalizePhoto)
    return { items, total: items.length }
  }
  const list = raw.photos ?? raw.items ?? raw.data ?? []
  const items = list.map(normalizePhoto)
  const total = raw.pagination?.total ?? raw.total ?? items.length
  return { items, total }
}

export async function addPhotosToGroup(
  groupId: string,
  photoIds: string[],
): Promise<number> {
  const raw = await apiFetch<{ count?: number | null } | null>(
    `/photo/groups/${encodeURIComponent(groupId)}/photos`,
    {
      method: 'POST',
      body: JSON.stringify({ photoIds }),
    },
  )
  return raw?.count ?? photoIds.length
}

export async function removePhotoFromGroup(
  groupId: string,
  photoId: string,
): Promise<boolean> {
  const raw = await apiFetch<{ removed?: boolean | null } | null>(
    `/photo/groups/${encodeURIComponent(groupId)}/photos/${encodeURIComponent(
      photoId,
    )}`,
    { method: 'DELETE' },
  )
  return raw?.removed ?? true
}
