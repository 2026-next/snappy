import { create } from 'zustand'

import {
  type AlbumPage,
  type PhotoSearchField,
  type PhotoSearchResult,
  type PhotoSummary,
  type SimilarBucket,
  type SortOrder,
  type TimelineBucket,
  type UploaderBucket,
  deletePhotoAsHost,
  getAlbum,
  getSimilarComposition,
  getTimeline,
  getUploaderGrouping,
  searchPhotos,
  searchUploader,
  toggleFavorite,
} from '@/shared/api/photo'

type AsyncSlice<T> = {
  data: T
  isLoading: boolean
  error: string | null
  loadedEventId: string | null
}

type SearchState = {
  data: { items: PhotoSearchResult[]; total: number; query: string }
  isLoading: boolean
  error: string | null
  loadedEventId: string | null
}

type AlbumPhotosState = {
  album: AsyncSlice<{ items: PhotoSummary[]; total: number }>
  timeline: AsyncSlice<TimelineBucket[]>
  uploader: AsyncSlice<UploaderBucket[]>
  similar: AsyncSlice<SimilarBucket[]>
  search: SearchState
  uploaderSearchTerm: string

  fetchAlbum: (eventId: string, order?: SortOrder) => Promise<void>
  fetchTimeline: (eventId: string) => Promise<void>
  fetchUploaderGrouping: (eventId: string) => Promise<void>
  fetchSimilarComposition: (eventId: string) => Promise<void>

  fetchSearch: (
    eventId: string,
    query: string,
    options?: { fields?: PhotoSearchField[]; order?: SortOrder },
  ) => Promise<void>
  clearSearch: () => void

  setUploaderSearchTerm: (term: string) => void
  runUploaderSearch: (eventId: string, name: string) => Promise<void>

  toggleFavorite: (photoId: string) => Promise<void>
  deletePhotos: (photoIds: string[]) => Promise<void>

  resetForEvent: (eventId: string) => void
  invalidate: () => void
}

const emptySlice = <T>(initial: T): AsyncSlice<T> => ({
  data: initial,
  isLoading: false,
  error: null,
  loadedEventId: null,
})

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback

function flipFavoriteIn<T extends { id: string; isFavorite: boolean }>(
  items: T[],
  photoId: string,
): T[] {
  return items.map((item) =>
    item.id === photoId ? { ...item, isFavorite: !item.isFavorite } : item,
  )
}

function removeFrom<T extends { id: string }>(items: T[], ids: Set<string>): T[] {
  return items.filter((item) => !ids.has(item.id))
}

function flipFavoriteInBuckets<
  B extends { totalCount: number; photos: { id: string; isFavorite: boolean }[] },
>(buckets: B[], photoId: string): B[] {
  return buckets.map((bucket) => ({
    ...bucket,
    photos: flipFavoriteIn(bucket.photos, photoId),
  }))
}

function removeFromBuckets<
  B extends { totalCount: number; photos: { id: string }[] },
>(buckets: B[], ids: Set<string>): B[] {
  return buckets.map((bucket) => {
    const before = bucket.photos.length
    const photos = removeFrom(bucket.photos, ids)
    const removed = before - photos.length
    return {
      ...bucket,
      photos,
      totalCount: Math.max(0, bucket.totalCount - removed),
    }
  })
}

let uploaderSearchToken = 0

export const useAlbumPhotosStore = create<AlbumPhotosState>((set, get) => ({
  album: emptySlice<{ items: PhotoSummary[]; total: number }>({ items: [], total: 0 }),
  timeline: emptySlice<TimelineBucket[]>([]),
  uploader: emptySlice<UploaderBucket[]>([]),
  similar: emptySlice<SimilarBucket[]>([]),
  search: {
    data: { items: [], total: 0, query: '' },
    isLoading: false,
    error: null,
    loadedEventId: null,
  },
  uploaderSearchTerm: '',

  fetchAlbum: async (eventId, order = 'desc') => {
    if (get().album.isLoading) return
    set((state) => ({ album: { ...state.album, isLoading: true, error: null } }))
    try {
      const page: AlbumPage = await getAlbum({ eventId, order })
      set({
        album: {
          data: { items: page.items, total: page.total },
          isLoading: false,
          error: null,
          loadedEventId: eventId,
        },
      })
    } catch (error) {
      set((state) => ({
        album: {
          ...state.album,
          isLoading: false,
          error: errorMessage(error, '사진을 불러오지 못했어요'),
          loadedEventId: eventId,
        },
      }))
    }
  },

  fetchTimeline: async (eventId) => {
    if (get().timeline.isLoading) return
    set((state) => ({ timeline: { ...state.timeline, isLoading: true, error: null } }))
    try {
      const buckets = await getTimeline(eventId)
      set({
        timeline: {
          data: buckets,
          isLoading: false,
          error: null,
          loadedEventId: eventId,
        },
      })
    } catch (error) {
      set((state) => ({
        timeline: {
          ...state.timeline,
          isLoading: false,
          error: errorMessage(error, '타임라인을 불러오지 못했어요'),
          loadedEventId: eventId,
        },
      }))
    }
  },

  fetchUploaderGrouping: async (eventId) => {
    if (get().uploader.isLoading) return
    set((state) => ({ uploader: { ...state.uploader, isLoading: true, error: null } }))
    try {
      const buckets = await getUploaderGrouping(eventId)
      set({
        uploader: {
          data: buckets,
          isLoading: false,
          error: null,
          loadedEventId: eventId,
        },
      })
    } catch (error) {
      set((state) => ({
        uploader: {
          ...state.uploader,
          isLoading: false,
          error: errorMessage(error, '업로더별 사진을 불러오지 못했어요'),
          loadedEventId: eventId,
        },
      }))
    }
  },

  fetchSimilarComposition: async (eventId) => {
    if (get().similar.isLoading) return
    set((state) => ({ similar: { ...state.similar, isLoading: true, error: null } }))
    try {
      const buckets = await getSimilarComposition(eventId)
      set({
        similar: {
          data: buckets,
          isLoading: false,
          error: null,
          loadedEventId: eventId,
        },
      })
    } catch (error) {
      set((state) => ({
        similar: {
          ...state.similar,
          isLoading: false,
          error: errorMessage(error, '비슷한 구도를 불러오지 못했어요'),
          loadedEventId: eventId,
        },
      }))
    }
  },

  fetchSearch: async (eventId, query, options) => {
    const trimmed = query.trim()
    if (!eventId || !trimmed) {
      get().clearSearch()
      return
    }
    set((state) => ({
      search: {
        ...state.search,
        isLoading: true,
        error: null,
        data: { ...state.search.data, query: trimmed },
      },
    }))
    try {
      const page = await searchPhotos({
        eventId,
        q: trimmed,
        fields: options?.fields,
        order: options?.order,
      })
      set({
        search: {
          data: { items: page.items, total: page.total, query: trimmed },
          isLoading: false,
          error: null,
          loadedEventId: eventId,
        },
      })
    } catch (error) {
      set((state) => ({
        search: {
          ...state.search,
          isLoading: false,
          error: errorMessage(error, '검색에 실패했어요'),
        },
      }))
    }
  },

  clearSearch: () =>
    set({
      search: {
        data: { items: [], total: 0, query: '' },
        isLoading: false,
        error: null,
        loadedEventId: null,
      },
    }),

  setUploaderSearchTerm: (term) => set({ uploaderSearchTerm: term }),

  runUploaderSearch: async (eventId, name) => {
    if (!name) {
      uploaderSearchToken += 1
      await get().fetchUploaderGrouping(eventId)
      return
    }
    uploaderSearchToken += 1
    const token = uploaderSearchToken
    set((state) => ({ uploader: { ...state.uploader, isLoading: true, error: null } }))
    try {
      const matches = await searchUploader(eventId, name)
      if (token !== uploaderSearchToken) return
      const allowedIds = new Set(matches.map((m) => m.id))
      const allBuckets = await getUploaderGrouping(eventId)
      if (token !== uploaderSearchToken) return
      const filtered =
        allowedIds.size === 0
          ? []
          : allBuckets.filter((bucket) => allowedIds.has(bucket.id))
      set({
        uploader: {
          data: filtered,
          isLoading: false,
          error: null,
          loadedEventId: eventId,
        },
      })
    } catch (error) {
      if (token !== uploaderSearchToken) return
      set((state) => ({
        uploader: {
          ...state.uploader,
          isLoading: false,
          error: errorMessage(error, '업로더 검색에 실패했어요'),
        },
      }))
    }
  },

  toggleFavorite: async (photoId) => {
    const flip = (state: AlbumPhotosState): Partial<AlbumPhotosState> => ({
      album: {
        ...state.album,
        data: {
          items: flipFavoriteIn(state.album.data.items, photoId),
          total: state.album.data.total,
        },
      },
      timeline: {
        ...state.timeline,
        data: flipFavoriteInBuckets(state.timeline.data, photoId),
      },
      uploader: {
        ...state.uploader,
        data: flipFavoriteInBuckets(state.uploader.data, photoId),
      },
      similar: {
        ...state.similar,
        data: flipFavoriteInBuckets(state.similar.data, photoId),
      },
    })
    set(flip)
    try {
      await toggleFavorite(photoId)
    } catch (error) {
      set(flip)
      throw new Error(errorMessage(error, '즐겨찾기 변경에 실패했어요'))
    }
  },

  deletePhotos: async (photoIds) => {
    if (photoIds.length === 0) return
    const idSet = new Set(photoIds)
    const beforeAlbum = get().album.data
    const beforeItems = new Map(
      beforeAlbum.items.filter((p) => idSet.has(p.id)).map((p) => [p.id, p]),
    )
    const removedCount = beforeItems.size
    set((state) => ({
      album: {
        ...state.album,
        data: {
          items: removeFrom(state.album.data.items, idSet),
          total: Math.max(0, state.album.data.total - removedCount),
        },
      },
      timeline: {
        ...state.timeline,
        data: removeFromBuckets(state.timeline.data, idSet),
      },
      uploader: {
        ...state.uploader,
        data: removeFromBuckets(state.uploader.data, idSet),
      },
      similar: {
        ...state.similar,
        data: removeFromBuckets(state.similar.data, idSet),
      },
    }))
    const results = await Promise.allSettled(
      photoIds.map(async (id) => {
        await deletePhotoAsHost(id)
        return id
      }),
    )
    const failedIds = results
      .map((result, index) =>
        result.status === 'rejected' ? photoIds[index] : null,
      )
      .filter((id): id is string => id !== null)
    if (failedIds.length === 0) return
    const restoredItems = failedIds
      .map((id) => beforeItems.get(id))
      .filter((p): p is PhotoSummary => p != null)
    set((state) => ({
      album: {
        ...state.album,
        data: {
          items: [...state.album.data.items, ...restoredItems],
          total: state.album.data.total + restoredItems.length,
        },
      },
    }))
    if (failedIds.length === photoIds.length) {
      throw new Error('사진 삭제에 실패했어요')
    }
    throw new Error(`${failedIds.length}장의 사진을 삭제하지 못했어요`)
  },

  // Soft-stale every slice: keep the cached data (so the album view renders
  // immediately on remount) but null out loadedEventId so the existing fetch
  // effect re-fires once the view mounts again. Used after mutations that
  // happen outside this store (photo-detail delete, host edit save).
  invalidate: () =>
    set((state) => ({
      album: { ...state.album, loadedEventId: null },
      timeline: { ...state.timeline, loadedEventId: null },
      uploader: { ...state.uploader, loadedEventId: null },
      similar: { ...state.similar, loadedEventId: null },
    })),

  resetForEvent: (eventId) => {
    const state = get()
    const previouslyLoaded = [
      state.album.loadedEventId,
      state.timeline.loadedEventId,
      state.uploader.loadedEventId,
      state.similar.loadedEventId,
    ].filter((id): id is string => id != null)
    const hasMismatch = previouslyLoaded.some((id) => id !== eventId)
    if (hasMismatch) {
      uploaderSearchToken += 1
      set({
        album: emptySlice<{ items: PhotoSummary[]; total: number }>({
          items: [],
          total: 0,
        }),
        timeline: emptySlice<TimelineBucket[]>([]),
        uploader: emptySlice<UploaderBucket[]>([]),
        similar: emptySlice<SimilarBucket[]>([]),
        search: {
          data: { items: [], total: 0, query: '' },
          isLoading: false,
          error: null,
          loadedEventId: null,
        },
        uploaderSearchTerm: '',
      })
    }
  },
}))
