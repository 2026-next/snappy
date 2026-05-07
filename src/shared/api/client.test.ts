import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, apiFetch } from '@/shared/api/client'
import { useAuthStore } from '@/shared/auth/use-auth-store'

describe('apiFetch', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    useAuthStore.getState().logout()
  })

  it('attaches Authorization header when access token is present', async () => {
    useAuthStore.getState().setTokens(
      { accessToken: 'at-1', refreshToken: 'rt-1', tokenType: 'Bearer' },
      'google',
    )

    let capturedHeaders: Headers | null = null
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        capturedHeaders = new Headers(init?.headers)
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await apiFetch<{ ok: boolean }>('/auth/me')
    expect(result).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(capturedHeaders).not.toBeNull()
    expect(capturedHeaders!.get('Authorization')).toBe('Bearer at-1')
  })

  it('on 401, refreshes the token once and retries the original request', async () => {
    useAuthStore.getState().setTokens(
      { accessToken: 'old', refreshToken: 'rt-1', tokenType: 'Bearer' },
      'google',
    )

    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.endsWith('/auth/refresh')) {
          return new Response(
            JSON.stringify({
              accessToken: 'new',
              refreshToken: 'rt-2',
              tokenType: 'Bearer',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }
        const headers = new Headers(init?.headers)
        if (headers.get('Authorization') === 'Bearer old') {
          return new Response(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
          })
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await apiFetch<{ ok: boolean }>('/auth/me')
    expect(result).toEqual({ ok: true })
    expect(useAuthStore.getState().accessToken).toBe('new')
    expect(useAuthStore.getState().refreshToken).toBe('rt-2')
  })

  it('on 403, refreshes the token once and retries the original request', async () => {
    useAuthStore.getState().setTokens(
      { accessToken: 'old', refreshToken: 'rt-1', tokenType: 'Bearer' },
      'google',
    )

    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.endsWith('/auth/refresh')) {
          return new Response(
            JSON.stringify({
              accessToken: 'new',
              refreshToken: 'rt-2',
              tokenType: 'Bearer',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          )
        }
        const headers = new Headers(init?.headers)
        if (headers.get('Authorization') === 'Bearer old') {
          return new Response(JSON.stringify({ message: 'Forbidden' }), {
            status: 403,
          })
        }
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await apiFetch<{ ok: boolean }>('/event/my-events')
    expect(result).toEqual({ ok: true })
    expect(useAuthStore.getState().accessToken).toBe('new')
  })

  it('on persistent 403 after refresh, throws ApiError exactly once without looping', async () => {
    useAuthStore.getState().setTokens(
      { accessToken: 'old', refreshToken: 'rt-1', tokenType: 'Bearer' },
      'google',
    )

    let protectedCalls = 0
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.endsWith('/auth/refresh')) {
        return new Response(
          JSON.stringify({
            accessToken: 'new',
            refreshToken: 'rt-2',
            tokenType: 'Bearer',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      protectedCalls += 1
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(apiFetch('/event/my-events')).rejects.toBeInstanceOf(ApiError)
    expect(protectedCalls).toBe(2)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('on 401 with no refresh token, throws ApiError and clears auth', async () => {
    useAuthStore.getState().setTokens(
      { accessToken: 'at-1', refreshToken: '', tokenType: 'Bearer' },
      'google',
    )

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 401 })),
    )

    await expect(apiFetch('/auth/me')).rejects.toBeInstanceOf(ApiError)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
