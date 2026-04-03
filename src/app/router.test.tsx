import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useTodoPreviewStore } from '@/features/todo-preview/model/todo-preview-store'
import { renderRoute } from '@/test/render'

describe('app routing', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useTodoPreviewStore.getState().reset()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          userId: 1,
          id: 1,
          title: 'delectus aut autem',
          completed: false,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      ),
    )
  })

  it('renders the home route', async () => {
    renderRoute('/')

    expect(
      await screen.findByRole('heading', {
        name: /snappy project architecture/i,
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/sample api todo/i)).toBeInTheDocument()
  })

  it('renders the not-found route for unknown paths', async () => {
    renderRoute('/missing')

    expect(
      await screen.findByRole('heading', { name: /page not found/i }),
    ).toBeInTheDocument()
  })
})
