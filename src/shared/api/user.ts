import { apiFetch } from '@/shared/api/client'

export type UpdateUserInput = {
  name?: string
}

export type UserResponse = {
  id?: string
  name?: string
  email?: string
}

export function updateMe(input: UpdateUserInput): Promise<UserResponse> {
  return apiFetch<UserResponse>('/user/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}
