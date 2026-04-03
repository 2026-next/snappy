import { useEffect } from 'react'

import { useTodoPreviewStore } from '@/features/todo-preview/model/todo-preview-store'

export function TodoPreview() {
  const todo = useTodoPreviewStore((state) => state.todo)
  const error = useTodoPreviewStore((state) => state.error)
  const status = useTodoPreviewStore((state) => state.status)
  const fetchSampleTodo = useTodoPreviewStore((state) => state.fetchSampleTodo)

  useEffect(() => {
    void fetchSampleTodo()
  }, [fetchSampleTodo])

  return (
    <section
      aria-labelledby="todo-preview-title"
      className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="todo-preview-title"
            className="text-lg font-semibold text-slate-50"
          >
            Sample API todo
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Loaded from JSONPlaceholder at <code>/todos/1</code>
          </p>
        </div>
        <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
          Fetch
        </span>
      </div>

      {status === 'loading' ? (
        <p className="mt-6 text-sm text-slate-300">Loading todo...</p>
      ) : null}

      {error ? (
        <p className="mt-6 rounded-2xl border border-rose-900/80 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      {todo ? (
        <dl className="mt-6 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
            <dt className="text-slate-500">ID</dt>
            <dd className="mt-1 font-medium text-slate-100">{todo.id}</dd>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
            <dt className="text-slate-500">User ID</dt>
            <dd className="mt-1 font-medium text-slate-100">{todo.userId}</dd>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 sm:col-span-2">
            <dt className="text-slate-500">Title</dt>
            <dd className="mt-1 font-medium text-slate-100">{todo.title}</dd>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 sm:col-span-2">
            <dt className="text-slate-500">Completed</dt>
            <dd className="mt-1 font-medium text-slate-100">
              {todo.completed ? 'true' : 'false'}
            </dd>
          </div>
        </dl>
      ) : null}
    </section>
  )
}
