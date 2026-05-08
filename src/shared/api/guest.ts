import { apiFetch } from '@/shared/api/client'

export type GuestEventInfo = {
  id: string
  name: string
  eventDate: string
  createdAt: string
  updatedAt: string
  ownerId: string
  accessCode: string
}

export function getGuestEvent(accessCode: string): Promise<GuestEventInfo> {
  return apiFetch<GuestEventInfo>(`/guest/join/${accessCode}`, { skipAuth: true })
}
