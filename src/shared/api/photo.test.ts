import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  RELATION_LABELS,
  createUploadUrls,
  deletePhoto,
  getAlbum,
  getMyPhotos,
  getPhotoDetail,
  getSimilarComposition,
  getTimeline,
  getUploaderGrouping,
  normalizePhoto,
  searchUploader,
  toggleFavorite,
} from '@/shared/api/photo'
import { useAuthStore } from '@/shared/auth/use-auth-store'

type FetchCall = { url: string; init?: RequestInit }

function stubFetch(handler: (call: FetchCall) => Response | Promise<Response>) {
  const calls: FetchCall[] = []
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString()
    calls.push({ url, init })
    return handler({ url, init })
  })
  vi.stubGlobal('fetch', fetchMock)
  return calls
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('photo api', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setTokens(
        { accessToken: 'at-1', refreshToken: 'rt-1', tokenType: 'Bearer' },
        'google',
      )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    useAuthStore.getState().logout()
  })

  it('normalizePhoto coerces variant fields into PhotoSummary', () => {
    const summary = normalizePhoto({
      id: 'p-1',
      url: 'https://cdn/p-1.jpg',
      width: 1024,
      height: 768,
      favorite: true,
      exifTakenAt: '2026-05-04T12:00:00Z',
      createdAt: '2026-05-04T12:30:00Z',
      uploader: { id: 'u-1', name: '김민준', relation: 2 },
      isAi: true,
      retouched: true,
    })
    expect(summary).toMatchObject({
      id: 'p-1',
      url: 'https://cdn/p-1.jpg',
      thumbnailUrl: 'https://cdn/p-1.jpg',
      width: 1024,
      height: 768,
      isFavorite: true,
      takenAt: '2026-05-04T12:00:00Z',
      uploadedAt: '2026-05-04T12:30:00Z',
      uploaderId: 'u-1',
      uploaderName: '김민준',
      uploaderRelation: 2,
      isAi: true,
      isRetouched: true,
    })
    expect(RELATION_LABELS[2]).toBe('친구')
  })

  it('getAlbum builds /photo/views query and normalizes paginated payloads', async () => {
    const calls = stubFetch(() =>
      jsonResponse({
        items: [{ id: 'p-1', url: 'https://cdn/1.jpg', favorite: true }],
        total: 42,
        page: 1,
        hasNext: true,
      }),
    )

    const result = await getAlbum({ eventId: 'evt-1', page: 1, order: 'desc' })

    expect(calls[0].url).toContain('/photo/views?')
    expect(calls[0].url).toContain('eventId=evt-1')
    expect(calls[0].url).toContain('page=1')
    expect(calls[0].url).toContain('order=desc')
    expect(result.total).toBe(42)
    expect(result.hasNext).toBe(true)
    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({
      id: 'p-1',
      isFavorite: true,
    })
  })

  it('getAlbum handles array-only payloads', async () => {
    stubFetch(() => jsonResponse([{ id: 'p-1' }, { id: 'p-2' }]))
    const result = await getAlbum({ eventId: 'evt-1' })
    expect(result.items.map((p) => p.id)).toEqual(['p-1', 'p-2'])
    expect(result.total).toBe(2)
    expect(result.hasNext).toBe(false)
  })

  it('getTimeline derives date/time from startedAt when fields are missing', async () => {
    stubFetch(() =>
      jsonResponse([
        {
          startedAt: '2026-05-04T12:00:00Z',
          totalCount: 7,
          photos: [{ id: 'p-1' }],
        },
      ]),
    )
    const buckets = await getTimeline('evt-1')
    expect(buckets).toHaveLength(1)
    expect(buckets[0].totalCount).toBe(7)
    expect(buckets[0].photos).toHaveLength(1)
    expect(buckets[0].date.length).toBeGreaterThan(0)
    expect(buckets[0].time).toMatch(/^\d{2}:00$/)
  })

  it('getUploaderGrouping maps relation codes to Korean labels', async () => {
    stubFetch(() =>
      jsonResponse([
        {
          uploaderId: 'u-1',
          name: '김민준',
          relation: 2,
          totalCount: 3,
          photos: [{ id: 'p-1' }],
        },
      ]),
    )
    const buckets = await getUploaderGrouping('evt-1')
    expect(buckets[0]).toMatchObject({
      id: 'u-1',
      name: '김민준',
      relation: '친구',
      relationCode: 2,
      totalCount: 3,
    })
  })

  it('getSimilarComposition assigns synthetic ids when missing', async () => {
    stubFetch(() => jsonResponse([{ totalCount: 4, photos: [{ id: 'p-1' }] }]))
    const buckets = await getSimilarComposition('evt-1')
    expect(buckets[0].id).toBe('similar-0')
    expect(buckets[0].totalCount).toBe(4)
  })

  it('searchUploader posts JSON body with eventId/name', async () => {
    const calls = stubFetch(() => jsonResponse([]))
    await searchUploader('evt-1', '김')
    expect(calls[0].init?.method).toBe('POST')
    expect(calls[0].init?.body).toBe(JSON.stringify({ eventId: 'evt-1', name: '김' }))
  })

  it('getPhotoDetail returns originalUrl and message', async () => {
    stubFetch(() =>
      jsonResponse({
        id: 'p-1',
        url: 'https://cdn/p-1.jpg',
        message: '축하해!',
        favorite: false,
      }),
    )
    const detail = await getPhotoDetail('p-1')
    expect(detail.originalUrl).toBe('https://cdn/p-1.jpg')
    expect(detail.message).toBe('축하해!')
  })

  it('toggleFavorite issues PATCH /photo/:id/favorite', async () => {
    const calls = stubFetch(() => new Response(null, { status: 204 }))
    await toggleFavorite('p-1')
    expect(calls[0].init?.method).toBe('PATCH')
    expect(calls[0].url).toContain('/photo/p-1/favorite')
  })

  it('deletePhoto issues DELETE /photo/:id', async () => {
    const calls = stubFetch(() => new Response(null, { status: 204 }))
    await deletePhoto('p-1')
    expect(calls[0].init?.method).toBe('DELETE')
    expect(calls[0].url).toContain('/photo/p-1')
  })

  it('createUploadUrls posts to /photo/upload-url', async () => {
    const calls = stubFetch(() =>
      jsonResponse([{ fileKey: 'k-1', uploadUrl: 'https://upload/1' }]),
    )
    const result = await createUploadUrls({ fileCount: 1, mimeType: 'image/jpeg' })
    expect(calls[0].url).toContain('/photo/upload-url')
    expect(result).toEqual([{ fileKey: 'k-1', uploadUrl: 'https://upload/1' }])
  })

  it('getMyPhotos accepts both array and wrapped payloads', async () => {
    stubFetch(() => jsonResponse({ items: [{ id: 'p-1' }] }))
    const list = await getMyPhotos()
    expect(list[0].id).toBe('p-1')
  })
})
