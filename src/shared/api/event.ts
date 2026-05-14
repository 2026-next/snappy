import { apiFetch } from '@/shared/api/client'

export type CreateEventInput = {
  name: string
  eventDate: string
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
}

export function createEvent(input: CreateEventInput): Promise<EventResponse> {
  return apiFetch<EventResponse>('/event/create', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getMyEvents(): Promise<EventResponse[]> {
  return apiFetch<EventResponse[]>('/event/my-events')
}
