import { apiFetch, ApiError } from '@/shared/api/client'

export type MessageResponse = {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  eventId?: string
  authorGuestId?: string
}

export const MESSAGE_MAX_LENGTH = 1000

export function createMessage(content: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/message/create', {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export async function getMyMessage(): Promise<MessageResponse | null> {
  try {
    return await apiFetch<MessageResponse>('/message/my')
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export function updateMessage(content: string): Promise<MessageResponse> {
  return apiFetch<MessageResponse>('/message/my', {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  })
}

export async function saveMessage(content: string): Promise<MessageResponse> {
  const existing = await getMyMessage()
  if (existing) return updateMessage(content)
  try {
    return await createMessage(content)
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return updateMessage(content)
    }
    throw error
  }
}
