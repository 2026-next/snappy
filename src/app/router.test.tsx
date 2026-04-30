import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'

import { useAuthStore } from '@/shared/auth/use-auth-store'
import { renderRoute } from '@/test/render'

describe('app routing', () => {
  afterEach(() => {
    useAuthStore.getState().logout()
  })

  it('renders the welcome view on the home route by default', async () => {
    renderRoute('/')

    expect(
      await screen.findByRole('heading', { name: /snappy/i }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /kakao로 시작하기/i }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /google로 시작하기/i }),
    ).toBeInTheDocument()
  })

  it('switches to the album prompt view after logging in', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(
      await screen.findByRole('button', { name: /kakao로 시작하기/i }),
    )

    expect(
      await screen.findByRole('heading', { name: /수집해볼까요/i }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /새 앨범 만들기/i }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: /내 사진 관리하기/i }),
    ).toBeInTheDocument()
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().provider).toBe('kakao')
  })

  it('renders the not-found route for unknown paths', async () => {
    renderRoute('/missing')

    expect(
      await screen.findByRole('heading', { name: /page not found/i }),
    ).toBeInTheDocument()
  })
})
