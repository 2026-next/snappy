import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthStore } from '@/shared/auth/use-auth-store'
import { renderRoute } from '@/test/render'

const TOKENS = {
  accessToken: 'test-access',
  refreshToken: 'test-refresh',
  tokenType: 'Bearer',
}

const PHOTO_DETAIL = {
  id: 'photo-1',
  fileKey: 'photos/abc.jpg',
  url: 'https://cdn/abc.jpg',
  width: 1024,
  height: 768,
  isFavorite: false,
  exifTakenAt: '2026-05-13T10:00:00Z',
  uploadedAt: '2026-05-13T10:05:00Z',
  uploader: { id: 'g-1', name: '게스트', relation: 2 },
  message: '축하해요',
}

const ANALYSIS_RESULT = {
  hasPerson: true,
  personCount: 2,
  composition: { score: 7.5 },
  sharpness: { score: 8.2 },
  suggestedEnhancements: [
    {
      type: '꽃 추가',
      iconUrl: 'https://cdn/flower.svg',
      suggestedPrompt: '배경에 화사한 꽃들을 자연스럽게 추가해줘',
    },
    {
      type: '아웃포커스',
      iconUrl: 'https://cdn/blur.svg',
      suggestedPrompt: '인물 뒤 배경을 부드럽게 흐려줘',
    },
  ],
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function stubFetchForDetail(analysisStatus: 'SUCCEEDED' | 'FAILED' = 'SUCCEEDED') {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString()
    if (url.endsWith('/photo/detail/photo-1')) {
      return jsonResponse(PHOTO_DETAIL)
    }
    if (url.endsWith('/photo/photo-1/analysis')) {
      return jsonResponse({
        analysisJobId: 'job-1',
        status: analysisStatus,
        result: analysisStatus === 'SUCCEEDED' ? ANALYSIS_RESULT : null,
        error:
          analysisStatus === 'FAILED'
            ? { code: 'AI_ANALYSIS_FAILED', message: 'mock failure' }
            : null,
        createdAt: '2026-05-13T10:05:01Z',
        updatedAt: '2026-05-13T10:05:02Z',
      })
    }
    if (url.endsWith('/event/my-events')) {
      return jsonResponse([])
    }
    return jsonResponse({})
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('PhotoDetailView AI suggestions', () => {
  beforeEach(() => {
    useAuthStore.getState().setTokens(TOKENS, 'google')
  })

  afterEach(() => {
    useAuthStore.getState().logout()
    vi.unstubAllGlobals()
  })

  it('renders suggestion chips when analysis succeeds', async () => {
    stubFetchForDetail('SUCCEEDED')
    renderRoute('/host/albums/album-1/photos/photo-1')

    expect(
      await screen.findByRole('button', { name: /꽃 추가/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /아웃포커스/ }),
    ).toBeInTheDocument()

    // scores rendered
    expect(screen.getByText(/구도 점수/)).toBeInTheDocument()
    expect(screen.getByText('7.5')).toBeInTheDocument()
    expect(screen.getByText('8.2')).toBeInTheDocument()
    expect(screen.getByText('2명')).toBeInTheDocument()
  })

  it('renders error label when analysis fails', async () => {
    stubFetchForDetail('FAILED')
    renderRoute('/host/albums/album-1/photos/photo-1')

    expect(await screen.findByText('분석 실패')).toBeInTheDocument()
  })

  it('clicking a suggestion navigates to /edit with prompt prefilled', async () => {
    stubFetchForDetail('SUCCEEDED')
    const user = userEvent.setup()
    renderRoute('/host/albums/album-1/photos/photo-1')

    const chip = await screen.findByRole('button', { name: /꽃 추가/ })
    await user.click(chip)

    // The edit view's element-tab input should be prefilled with the suggested prompt
    const input = await screen.findByPlaceholderText('요소를 직접 입력해보세요')
    expect((input as HTMLInputElement).value).toBe(
      '배경에 화사한 꽃들을 자연스럽게 추가해줘',
    )
  })
})
