import { apiFetch } from '@/shared/api/client'
import { putToSignedUrl } from '@/shared/api/upload'

export type CreateEventInput = {
  name: string
  eventDate: string
  thumbnailMimeType?: string
}

export type EventThumbnailUpload = {
  uploadUrl: string
  fileKey: string
}

export type EventResponse = {
  id: string
  name: string
  eventDate: string
  createdAt: string
  updatedAt: string
  ownerId: string
  accessCode: string
  qrLink: string
  thumbnailUrl?: string | null
  thumbnailObjectKey?: string | null
  thumbnailUpload?: EventThumbnailUpload | null
}

export function createEvent(input: CreateEventInput): Promise<EventResponse> {
  return apiFetch<EventResponse>('/event/create', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function uploadEventThumbnail(
  upload: EventThumbnailUpload,
  file: File,
): Promise<void> {
  const mime = file.type || 'image/jpeg'
  await putToSignedUrl(upload.uploadUrl, file, mime)
}

export function getMyEvents(): Promise<EventResponse[]> {
  return apiFetch<EventResponse[]>('/event/my-events')
}
