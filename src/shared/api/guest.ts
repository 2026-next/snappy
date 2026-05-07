import { apiFetch } from '@/shared/api/client'
import type { TokenPair } from '@/shared/auth/use-auth-store'

export type GuestEventInfo = {
  id: string
  name: string
  eventDate: string
  createdAt: string
  updatedAt: string
  ownerId: string
  accessCode: string
}

export type GuestRelation =
  | 'PARENT'
  | 'FRIEND'
  | 'SIBLING'
  | 'RELATIVE'
  | 'COWORKER'
  | 'ACQUAINTANCE'
  | 'OTHER'

export const GUEST_RELATION_CODE: Record<GuestRelation, number> = {
  PARENT: 1,
  FRIEND: 2,
  SIBLING: 3,
  RELATIVE: 4,
  COWORKER: 5,
  ACQUAINTANCE: 6,
  OTHER: 7,
}

export const GUEST_RELATION_LABELS: Record<string, GuestRelation> = {
  부모: 'PARENT',
  친구: 'FRIEND',
  형제자매: 'SIBLING',
  친척: 'RELATIVE',
  직장동료: 'COWORKER',
  지인: 'ACQUAINTANCE',
  기타: 'OTHER',
}

export function joinByAccessCode(accessCode: string): Promise<GuestEventInfo> {
  const encoded = encodeURIComponent(accessCode)
  return apiFetch<GuestEventInfo>(`/guest/join/${encoded}`, {
    skipAuth: true,
  })
}

export type GuestLoginInput = {
  eventId: string
  name: string
  password: string
}

export function guestLogin(input: GuestLoginInput): Promise<TokenPair> {
  return apiFetch<TokenPair>('/auth/guest/login', {
    method: 'POST',
    body: JSON.stringify(input),
    skipAuth: true,
  })
}

export type GuestRegisterInput = {
  eventId: string
  name: string
  password: string
  relation: number
}

export function guestRegister(input: GuestRegisterInput): Promise<TokenPair> {
  return apiFetch<TokenPair>('/auth/guest/register', {
    method: 'POST',
    body: JSON.stringify(input),
    skipAuth: true,
  })
}

export type CheckGuestNameInput = {
  eventId: string
  name: string
}

export function checkGuestName(
  input: CheckGuestNameInput,
): Promise<{ available: boolean }> {
  return apiFetch<{ available: boolean }>('/guest/check-name', {
    method: 'POST',
    body: JSON.stringify(input),
    skipAuth: true,
  })
}
