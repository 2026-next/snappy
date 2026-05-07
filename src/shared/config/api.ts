export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'https://api.snappyku.site'

export type OAuthProvider = 'google' | 'kakao'

export function authStartUrl(provider: OAuthProvider): string {
  return `${API_BASE_URL}/auth/oauth/${provider}`
}
