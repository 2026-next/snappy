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

describe('app routing', () => {
  let assignSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    assignSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...window.location,
        assign: assignSpy,
      },
    })
    // Default fetch stub so AuthBootstrapper's /auth/me call (and any other
    // unrelated request from a previous test) never hits the real network.
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('{}', {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      ),
    )
  })

  afterEach(() => {
    useAuthStore.getState().logout()
    vi.unstubAllGlobals()
  })

  it('redirects unauthenticated users from / to /auth', async () => {
    renderRoute('/')

    expect(
      await screen.findByRole('heading', { name: /snappy/i }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /kakao로 시작하기/i }),
    ).toBeInTheDocument()
  })

  it('renders the auth view directly on /auth', async () => {
    renderRoute('/auth')

    expect(
      await screen.findByRole('heading', { name: /snappy/i }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /google로 시작하기/i }),
    ).toBeInTheDocument()
  })

  it('clicking kakao redirects to backend OAuth start endpoint', async () => {
    const user = userEvent.setup()
    renderRoute('/auth')

    await user.click(
      await screen.findByRole('button', { name: /kakao로 시작하기/i }),
    )

    expect(assignSpy).toHaveBeenCalledTimes(1)
    expect(assignSpy.mock.calls[0]?.[0]).toMatch(/\/auth\/oauth\/kakao$/)
  })

  it('clicking google redirects to backend OAuth start endpoint', async () => {
    const user = userEvent.setup()
    renderRoute('/auth')

    await user.click(
      await screen.findByRole('button', { name: /google로 시작하기/i }),
    )

    expect(assignSpy).toHaveBeenCalledTimes(1)
    expect(assignSpy.mock.calls[0]?.[0]).toMatch(/\/auth\/oauth\/google$/)
  })

  it('redirects authenticated users from /auth back to /', async () => {
    useAuthStore.getState().setTokens(TOKENS, 'google')
    renderRoute('/auth')

    expect(
      await screen.findByRole('heading', { name: /수집해볼까요/i }),
    ).toBeInTheDocument()
  })

  it('renders the album-create form on /albums/new', async () => {
    renderRoute('/albums/new')

    expect(
      await screen.findByRole('heading', { name: /새 앨범 만들기/i }),
    ).toBeInTheDocument()
    expect(
      await screen.findByPlaceholderText(/우리의 소중한 결혼식/i),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /공유 링크 생성/i }),
    ).toBeInTheDocument()
  })

  it('shows the share view after creating an album', async () => {
    useAuthStore.getState().setTokens(TOKENS, 'google')
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString()
      if (url.endsWith('/event/create')) {
        return new Response(
          JSON.stringify({
            id: 'event-1',
            name: '지나와 민수의 결혼식',
            eventDate: '2026-05-04T00:00:00.000Z',
            createdAt: '2026-05-04T00:00:00.000Z',
            updatedAt: '2026-05-04T00:00:00.000Z',
            ownerId: 'user-1',
            accessCode: 'access_event-1',
            qrLink: 'https://snappyku.site/guest/join/access_event-1',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        )
      }
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)

    const user = userEvent.setup()
    renderRoute('/albums/new')

    const nameInput = await screen.findByPlaceholderText(
      /우리의 소중한 결혼식/i,
    )
    await user.type(nameInput, '지나와 민수의 결혼식')

    await user.click(
      await screen.findByRole('button', { name: /공유 링크 생성/i }),
    )

    expect(
      await screen.findByRole('heading', { name: /지나와 민수의 결혼식/i }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /링크 복사/i }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /홈으로 돌아가기/i }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('link', {
        name: /snappyku\.site\/guest\/join\/access_event-1/i,
      }),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalled()
  })

  it('renders the not-found route for unknown paths', async () => {
    renderRoute('/missing')

    expect(
      await screen.findByRole('heading', { name: /page not found/i }),
    ).toBeInTheDocument()
  })
})
