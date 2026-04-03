import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { routeTree } from '@/app/router'

export function renderRoute(
  initialEntry: string,
  options?: { initialIndex?: number },
) {
  const router = createMemoryRouter(routeTree, {
    initialEntries: [initialEntry],
    initialIndex: options?.initialIndex ?? 0,
  })

  return render(<RouterProvider router={router} />)
}

export function renderWithRouter(element: ReactElement, initialEntry = '/') {
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element,
      },
    ],
    {
      initialEntries: [initialEntry],
    },
  )

  return render(<RouterProvider router={router} />)
}
