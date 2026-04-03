import { JSON_PLACEHOLDER_BASE_URL } from '@/shared/config/app'
import type { Todo } from '@/shared/types/todo'

const SAMPLE_TODO_PATH = '/todos/1'

export async function getSampleTodo(signal?: AbortSignal): Promise<Todo> {
  const response = await fetch(
    `${JSON_PLACEHOLDER_BASE_URL}${SAMPLE_TODO_PATH}`,
    { signal },
  )

  if (!response.ok) {
    throw new Error('Failed to fetch sample todo')
  }

  return (await response.json()) as Todo
}
