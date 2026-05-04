import { screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/shared/auth/use-auth-store'
import { renderRoute } from '@/test/render'

const ME_RESPONSE = { sessionType: 'USER', user: { id: 'u-1' } }

describe('OAuth callback page', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input.toString()
        if (url.endsWith('/auth/me')) {
          return new Response(JSON.stringify(ME_RESPONSE), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        return new Response('not found', { status: 404 })
      }),
    )
  })

  afterEach(() => {
    useAuthStore.getState().logout()
    vi.unstubAllGlobals()
  })

  it('persists tokens, fetches /auth/me, and lands on home', async () => {
    renderRoute(
      '/auth/oauth/google/callback?accessToken=at-1&refreshToken=rt-1&tokenType=Bearer',
    )

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe('at-1')
    })
    expect(useAuthStore.getState().refreshToken).toBe('rt-1')
    expect(useAuthStore.getState().provider).toBe('google')

    expect(
      await screen.findByRole('heading', { name: /수집해볼까요/i }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(useAuthStore.getState().sessionType).toBe('USER')
    })
  })

  it('redirects to /auth with an error when tokens are missing', async () => {
    renderRoute('/auth/oauth/google/callback')

    expect(
      await screen.findByRole('button', { name: /google로 시작하기/i }),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it('handles the kakao callback identically', async () => {
    renderRoute(
      '/auth/oauth/kakao/callback?accessToken=at-2&refreshToken=rt-2&tokenType=Bearer',
    )

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBe('at-2')
    })
    expect(useAuthStore.getState().provider).toBe('kakao')
  })
})
