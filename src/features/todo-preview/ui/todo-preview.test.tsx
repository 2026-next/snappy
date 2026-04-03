import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useTodoPreviewStore } from '@/features/todo-preview/model/todo-preview-store'
import { TodoPreview } from '@/features/todo-preview/ui/todo-preview'
import type { Todo } from '@/shared/types/todo'

const sampleTodo: Todo = {
  userId: 1,
  id: 1,
  title: 'delectus aut autem',
  completed: false,
}

describe('TodoPreview', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useTodoPreviewStore.getState().reset()
  })

  it('renders the fetched todo', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(sampleTodo), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    )

    render(<TodoPreview />)

    expect(screen.getByText(/loading todo/i)).toBeInTheDocument()
    expect(await screen.findByText(/delectus aut autem/i)).toBeInTheDocument()
    expect(screen.getByText('false')).toBeInTheDocument()
  })

  it('renders an error state when the request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 500,
      }),
    )

    render(<TodoPreview />)

    expect(
      await screen.findByText(/failed to fetch sample todo/i),
    ).toBeInTheDocument()
  })
})
