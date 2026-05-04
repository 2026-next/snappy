import { apiFetch } from '@/shared/api/client'
import type { MeResponse } from '@/shared/auth/use-auth-store'

export function getMe(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/auth/me')
}
