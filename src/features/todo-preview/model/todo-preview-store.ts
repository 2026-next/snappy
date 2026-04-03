import { create } from 'zustand'

import { getSampleTodo } from '@/features/todo-preview/api/get-sample-todo'
import type { Todo } from '@/shared/types/todo'

type TodoPreviewStatus = 'idle' | 'loading' | 'success' | 'error'

type TodoPreviewStore = {
  todo: Todo | null
  error: string | null
  status: TodoPreviewStatus
  fetchSampleTodo: () => Promise<void>
  reset: () => void
}

const initialState = {
  todo: null,
  error: null,
  status: 'idle' as const,
}

export const useTodoPreviewStore = create<TodoPreviewStore>((set) => ({
  ...initialState,
  async fetchSampleTodo() {
    set({
      status: 'loading',
      error: null,
    })

    try {
      const todo = await getSampleTodo()

      set({
        todo,
        error: null,
        status: 'success',
      })
    } catch (error) {
      set({
        todo: null,
        error:
          error instanceof Error
            ? error.message
            : 'Unexpected error while fetching todo',
        status: 'error',
      })
    }
  },
  reset() {
    set(initialState)
  },
}))
