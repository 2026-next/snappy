import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/shared/auth/use-auth-store'
import { renderRoute } from '@/test/render'

const TOKENS = {
  accessToken: 'test-access',
  refreshToken: 'test-refresh',
  tokenType: 'Bearer',
}

function eventFixture(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'event-1',
    name: '민수 & 지연 Wedding',
    eventDate: '2026-05-20T10:00:00.000Z',
    createdAt: '2026-05-04T00:00:00.000Z',
    updatedAt: '2026-05-04T00:00:00.000Z',
    ownerId: 'user-1',
    accessCode: 'access_event-1',
    qrLink: 'https://snappyku.site/guest/join/access_event-1',
    ...overrides,
  }
}

function stubFetchEvents(events: ReturnType<typeof eventFixture>[]) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.endsWith('/event/my-events')) {
      return new Response(JSON.stringify(events), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (url.includes('/photo')) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('home view: 내 사진 관리하기 flow', () => {
  beforeEach(() => {
    useAuthStore.getState().setTokens(TOKENS, 'google')
  })

  afterEach(() => {
    useAuthStore.getState().logout()
    vi.unstubAllGlobals()
  })

  it('navigates straight to album-photos when the host has exactly one event', async () => {
    stubFetchEvents([eventFixture({ id: 'evt-only' })])
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(
      await screen.findByRole('button', { name: /내 사진 관리하기/i }),
    )

    // album-photos page renders the album title
    expect(
      await screen.findByRole('heading', { name: /민수 & 지연 Wedding/i }),
    ).toBeInTheDocument()
  })

  it('opens the picker dialog when there are multiple events and routes on selection', async () => {
    stubFetchEvents([
      eventFixture({ id: 'evt-a', name: '민수 & 지연 Wedding' }),
      eventFixture({
        id: 'evt-b',
        name: '서윤 돌잔치',
        eventDate: '2026-08-12T10:00:00.000Z',
      }),
    ])
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(
      await screen.findByRole('button', { name: /내 사진 관리하기/i }),
    )

    const dialog = await screen.findByRole('dialog', {
      name: /관리할 앨범을 선택하세요/i,
    })
    expect(dialog).toBeInTheDocument()

    await user.click(
      await screen.findByRole('button', { name: /서윤 돌잔치/i }),
    )

    expect(
      await screen.findByRole('heading', { name: /민수 & 지연 Wedding/i }),
    ).toBeInTheDocument()
  })

  it('shows an inline error when the host has no events', async () => {
    stubFetchEvents([])
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(
      await screen.findByRole('button', { name: /내 사진 관리하기/i }),
    )

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/아직 만든 앨범이 없어요/)
  })
})
