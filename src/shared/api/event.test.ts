import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createEvent, getMyEvents } from '@/shared/api/event'
import { useAuthStore } from '@/shared/auth/use-auth-store'

const sampleEvent = {
  id: 'event-1',
  name: '민준 & 지수의 결혼식',
  eventDate: '2026-05-20T10:00:00.000Z',
  createdAt: '2026-05-04T00:00:00.000Z',
  updatedAt: '2026-05-04T00:00:00.000Z',
  ownerId: 'user-1',
  accessCode: 'access_event-1',
  qrLink: 'https://snappyku.site/guest/join/access_event-1',
}

describe('event api', () => {
  beforeEach(() => {
    useAuthStore.getState().setTokens(
      { accessToken: 'at-1', refreshToken: 'rt-1', tokenType: 'Bearer' },
      'google',
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    useAuthStore.getState().logout()
  })

  it('createEvent posts to /event/create with JSON body and Authorization header', async () => {
    let capturedUrl = ''
    let capturedInit: RequestInit | undefined
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        capturedUrl = typeof input === 'string' ? input : input.toString()
        capturedInit = init
        return new Response(JSON.stringify(sampleEvent), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await createEvent({
      name: sampleEvent.name,
      eventDate: sampleEvent.eventDate,
    })

    expect(result).toEqual(sampleEvent)
    expect(capturedUrl.endsWith('/event/create')).toBe(true)
    expect(capturedInit?.method).toBe('POST')
    expect(capturedInit?.body).toBe(
      JSON.stringify({
        name: sampleEvent.name,
        eventDate: sampleEvent.eventDate,
      }),
    )
    const headers = new Headers(capturedInit?.headers)
    expect(headers.get('Authorization')).toBe('Bearer at-1')
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('getMyEvents calls GET /event/my-events and returns the array', async () => {
    let capturedUrl = ''
    let capturedMethod: string | undefined
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        capturedUrl = typeof input === 'string' ? input : input.toString()
        capturedMethod = init?.method
        return new Response(JSON.stringify([sampleEvent]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await getMyEvents()

    expect(result).toEqual([sampleEvent])
    expect(capturedUrl.endsWith('/event/my-events')).toBe(true)
    expect(capturedMethod ?? 'GET').toBe('GET')
  })
})
