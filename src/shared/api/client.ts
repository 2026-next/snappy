import { API_BASE_URL } from '@/shared/config/api'
import { useAuthStore } from '@/shared/auth/use-auth-store'

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type RefreshResponse = {
  accessToken: string
  refreshToken: string
  tokenType: string
}

let refreshInFlight: Promise<string | null> | null = null

async function tryRefresh(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) return null
  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) return null
      const json = (await res.json()) as RefreshResponse
      const provider = useAuthStore.getState().provider
      useAuthStore.getState().setTokens(json, provider)
      return json.accessToken
    } catch {
      return null
    } finally {
      refreshInFlight = null
    }
  })()
  return refreshInFlight
}

function buildHeaders(init: RequestInit | undefined, token: string | null) {
  const headers = new Headers(init?.headers)
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  if (
    init?.body !== undefined &&
    !headers.has('Content-Type') &&
    !(init.body instanceof FormData)
  ) {
    headers.set('Content-Type', 'application/json')
  }
  return headers
}

export type ApiFetchOptions = RequestInit & { skipAuth?: boolean }

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuth, ...init } = options
  const url = `${API_BASE_URL}${path}`

  const accessToken = skipAuth ? null : useAuthStore.getState().accessToken
  let response = await fetch(url, {
    ...init,
    headers: buildHeaders(init, accessToken),
  })

  if (response.status === 401 && !skipAuth) {
    const newToken = await tryRefresh()
    if (newToken) {
      response = await fetch(url, {
        ...init,
        headers: buildHeaders(init, newToken),
      })
    } else {
      useAuthStore.getState().logout()
    }
  }

  if (!response.ok) {
    let body: unknown = null
    try {
      body = await response.json()
    } catch {
      body = null
    }
    throw new ApiError(response.status, body)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
