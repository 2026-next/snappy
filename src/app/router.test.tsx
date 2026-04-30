import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/shared/auth/use-auth-store'
import { renderRoute } from '@/test/render'

describe('app routing', () => {
  afterEach(() => {
    useAuthStore.getState().logout()
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

  it('navigates to / and shows the home view after logging in from /auth', async () => {
    const user = userEvent.setup()
    renderRoute('/auth')

    await user.click(
      await screen.findByRole('button', { name: /kakao로 시작하기/i }),
    )

    expect(
      await screen.findByRole('heading', { name: /수집해볼까요/i }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /새 앨범 만들기/i }),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().provider).toBe('kakao')
  })

  it('redirects authenticated users from /auth back to /', async () => {
    useAuthStore.getState().loginWith('google')
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
  })

  it('renders the not-found route for unknown paths', async () => {
    renderRoute('/missing')

    expect(
      await screen.findByRole('heading', { name: /page not found/i }),
    ).toBeInTheDocument()
  })
})
