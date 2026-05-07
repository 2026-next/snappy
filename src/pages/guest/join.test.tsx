import { screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { renderRoute } from '@/test/render'

describe('GuestJoinPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('redirects to /guest/:eventId/onboarding after resolving access code', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.endsWith('/guest/join/abc123')) {
        return new Response(
          JSON.stringify({
            id: 'event-xyz',
            name: 'Wedding',
            eventDate: '2026-05-20T10:00:00.000Z',
            createdAt: '2026-05-04T00:00:00.000Z',
            updatedAt: '2026-05-04T00:00:00.000Z',
            ownerId: 'owner-1',
            accessCode: 'abc123',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)

    renderRoute('/guest/join/abc123')

    expect(
      await screen.findByRole('button', { name: /사진 업로드 시작/ }, {
        timeout: 3000,
      }),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/guest/join/abc123'),
      expect.any(Object),
    )
  })

  it('shows error UI when the access code cannot be resolved', async () => {
    const fetchMock = vi.fn(
      async () => new Response('{}', { status: 404 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderRoute('/guest/join/missing')

    expect(
      await screen.findByText(/초대 정보를 찾을 수 없어요/, undefined, {
        timeout: 3000,
      }),
    ).toBeInTheDocument()
  })
})
