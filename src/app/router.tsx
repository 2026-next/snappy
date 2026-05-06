import { createBrowserRouter, type RouteObject } from 'react-router-dom'

import { App } from '@/app/App'
import { AlbumCreatePage } from '@/pages/album-create'
import { AuthPage } from '@/pages/auth'
import { GuestLoginPage } from '@/pages/guest/login'
import { GuestOnboardingPage } from '@/pages/guest/onboarding'
import { GuestSignupPage } from '@/pages/guest/signup'
import { GoogleCallbackPage } from '@/pages/auth/google-callback'
import { KakaoCallbackPage } from '@/pages/auth/kakao-callback'
import { HomePage } from '@/pages/home'
import { HostAlbumPhotosPage } from '@/pages/host/album-photos'
import { HostPhotoDetailPage } from '@/pages/host/photo-detail'
import { HostPhotoSavePage } from '@/pages/host/photo-save'
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
        path: 'guest/:albumId',
        children: [
          { path: 'onboarding', element: <GuestOnboardingPage /> },
          { path: 'login', element: <GuestLoginPage /> },
          { path: 'signup', element: <GuestSignupPage /> },
          { path: 'photo-select' },
        ],
      },

      // Host Routes
      {
        path: 'host',
        children: [
          {
            path: 'albums/:albumId',
            element: <HostAlbumPhotosPage />,
          },
          {
            path: 'albums/:albumId/photos/:photoId',
            element: <HostPhotoDetailPage />,
          },
          {
            path: 'albums/:albumId/photos/:photoId/save',
            element: <HostPhotoSavePage />,
          },
        ],
      },

      {
        path: 'auth',
        element: <AuthPage />,
      },
      {
        path: 'auth/oauth/google/callback',
        element: <GoogleCallbackPage />,
      },
      {
        path: 'auth/oauth/kakao/callback',
        element: <KakaoCallbackPage />,
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
