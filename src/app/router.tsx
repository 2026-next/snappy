import { createBrowserRouter, type RouteObject } from 'react-router-dom'

import { App } from '@/app/App'
import { AlbumCreatePage } from '@/pages/album-create'
import { AuthPage } from '@/pages/auth'
import { GuestLoginPage } from '@/pages/guest/login'
import { GuestOnboardingPage } from '@/pages/guest/onboarding'
import { GuestSignupPage } from '@/pages/guest/signup'
import { GuestUploadMessagePage } from '@/pages/guest/upload/message'
import { GuestUploadSelectPage } from '@/pages/guest/upload/select'
import { GuestUploadSuccessPage } from '@/pages/guest/upload/success'
import { GuestMyPhotosPage } from '@/pages/guest/my-photos'
import { GoogleCallbackPage } from '@/pages/auth/google-callback'
import { KakaoCallbackPage } from '@/pages/auth/kakao-callback'
import { HomePage } from '@/pages/home'
import { HostAlbumPhotosPage } from '@/pages/host/album-photos'
import { HostAlbumSharePage } from '@/pages/host/album-share'
import { HostPhotoDetailPage } from '@/pages/host/photo-detail'
import { HostPhotoSavePage } from '@/pages/host/photo-save'
import { NotFoundPage } from '@/pages/not-found'
import { ProfilePage } from '@/pages/profile'

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
          {
            path: 'upload',
            children: [
              { path: 'select', element: <GuestUploadSelectPage /> },
              { path: 'message', element: <GuestUploadMessagePage /> },
              { path: 'success', element: <GuestUploadSuccessPage /> },
            ],
          },
          { path: 'my-photos', element: <GuestMyPhotosPage /> },
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
            path: 'albums/:albumId/share',
            element: <HostAlbumSharePage />,
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
        path: 'me/profile',
        element: <ProfilePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]

export const router = createBrowserRouter(routeTree)
