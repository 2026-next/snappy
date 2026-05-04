import { getMe } from '@/shared/api/auth'
import { ApiError } from '@/shared/api/client'
import { useAuthStore } from '@/shared/auth/use-auth-store'

export async function hydrateSession(): Promise<boolean> {
  try {
    const me = await getMe()
    useAuthStore.getState().setSession(me)
    return true
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      useAuthStore.getState().logout()
    }
    return false
  }
}
