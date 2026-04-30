import { createBrowserRouter, type RouteObject } from 'react-router-dom'

import { App } from '@/app/App'
import { AlbumCreatePage } from '@/pages/album-create'
import { AuthPage } from '@/pages/auth'
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
      {
        path: 'auth',
        element: <AuthPage />,
      },
      {
        path: 'albums/new',
        element: <AlbumCreatePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

export const router = createBrowserRouter(routeTree)
