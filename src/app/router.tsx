import { createBrowserRouter, type RouteObject } from 'react-router-dom'

import { App } from '@/app/App'
import { HomePage } from '@/pages/home'
import { NotFoundPage } from '@/pages/not-found'

export const routeTree: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },

      // Guest Routes
      {
        path: 'g/:eventId',
        children: [
          // TODO: Guest Routes
        ],
      },

      // Host Routes
      {
        path: 'host',
        children: [
          // TODO: Host Routes
        ],
      },

      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

export const router = createBrowserRouter(routeTree)
