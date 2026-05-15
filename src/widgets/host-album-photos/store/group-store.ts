import { create } from 'zustand'

import {
  type PhotoGroup,
  addPhotosToGroup,
  createPhotoGroup,
  getPhotoGroupPhotos,
  getPhotoGroups,
  removePhotoFromGroup as apiRemovePhotoFromGroup,
} from '@/shared/api/photo-group'
import { type PhotoSummary } from '@/shared/api/photo'
import { type PhotoItem } from '@/widgets/host-album-photos/ui/photo-grid'

export type Group = {
  id: string
  name: string
  totalCount: number
  coverSrc: string | null
}

type GroupStoreState = {
  groups: Group[]
  groupTotalCount: number
  isLoadingGroups: boolean
  groupsError: string | null
  loadedEventId: string | null

  groupPhotos: Record<string, PhotoItem[]>
  loadingGroupId: string | null
  groupPhotosError: string | null

  fetchGroups: (eventId: string) => Promise<void>
  fetchGroupPhotos: (groupId: string) => Promise<void>
  createGroup: (
    eventId: string,
    name: string,
    photoIds?: string[],
  ) => Promise<Group | null>
  addPhotosToGroup: (groupId: string, photoIds: string[]) => Promise<void>
  removePhotoFromGroup: (groupId: string, photoIds: string[]) => Promise<void>
  resetForEvent: (eventId: string) => void
}

function toPhotoItem(photo: PhotoSummary): PhotoItem {
  return {
    id: photo.id,
    src: photo.thumbnailUrl ?? photo.url,
    isFavorite: photo.isFavorite,
  }
}

function toGroup(remote: PhotoGroup): Group {
  return {
    id: remote.id,
    name: remote.name,
    totalCount: remote.photoCount,
    coverSrc: null,
  }
}

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback

export const useGroupStore = create<GroupStoreState>((set, get) => ({
  groups: [],
  groupTotalCount: 0,
  isLoadingGroups: false,
  groupsError: null,
  loadedEventId: null,

  groupPhotos: {},
  loadingGroupId: null,
  groupPhotosError: null,

  fetchGroups: async (eventId) => {
    if (!eventId) return
    if (get().isLoadingGroups) return
    set({ isLoadingGroups: true, groupsError: null })
    try {
      const remote = await getPhotoGroups(eventId)
      const groups = remote.map(toGroup)
      set({
        groups,
        groupTotalCount: groups.length,
        isLoadingGroups: false,
        loadedEventId: eventId,
      })
      void Promise.allSettled(
        groups
          .filter((g) => g.totalCount > 0)
          .map(async (group) => {
            const page = await getPhotoGroupPhotos(group.id, { page: 1 })
            const first = page.items[0]
            const cover = first
              ? (first.thumbnailUrl ?? first.url ?? null)
              : null
            set((state) => {
              if (state.loadedEventId !== eventId) return state
              return {
                groups: state.groups.map((g) =>
                  g.id === group.id ? { ...g, coverSrc: cover } : g,
                ),
              }
            })
          }),
      )
    } catch (error) {
      set({
        isLoadingGroups: false,
        groupsError: errorMessage(error, '그룹을 불러오지 못했어요'),
        loadedEventId: eventId,
      })
    }
  },

  fetchGroupPhotos: async (groupId) => {
    if (!groupId) return
    if (get().loadingGroupId === groupId) return
    set({ loadingGroupId: groupId, groupPhotosError: null })
    try {
      const page = await getPhotoGroupPhotos(groupId)
      const photos = page.items.map(toPhotoItem)
      set((state) => ({
        groupPhotos: { ...state.groupPhotos, [groupId]: photos },
        loadingGroupId: null,
        groups: state.groups.map((group) =>
          group.id === groupId ? { ...group, totalCount: page.total } : group,
        ),
      }))
    } catch (error) {
      set({
        loadingGroupId: null,
        groupPhotosError: errorMessage(
          error,
          '그룹 사진을 불러오지 못했어요',
        ),
      })
    }
  },

  createGroup: async (eventId, name, photoIds) => {
    if (!eventId || !name) return null
    try {
      const remote = await createPhotoGroup({ eventId, name, photoIds })
      const group = toGroup(remote)
      set((state) => {
        const exists = state.groups.some((g) => g.id === group.id)
        const groups = exists
          ? state.groups.map((g) => (g.id === group.id ? group : g))
          : [...state.groups, group]
        return {
          groups,
          groupTotalCount: groups.length,
          loadedEventId: eventId,
        }
      })
      return group
    } catch (error) {
      set({ groupsError: errorMessage(error, '그룹을 만들지 못했어요') })
      return null
    }
  },

  addPhotosToGroup: async (groupId, photoIds) => {
    if (!groupId || photoIds.length === 0) return
    try {
      const added = await addPhotosToGroup(groupId, photoIds)
      set((state) => {
        const nextCache = { ...state.groupPhotos }
        delete nextCache[groupId]
        return {
          groupPhotos: nextCache,
          groups: state.groups.map((group) =>
            group.id === groupId
              ? { ...group, totalCount: group.totalCount + added }
              : group,
          ),
        }
      })
      await get().fetchGroupPhotos(groupId)
      // Refresh the group's cover thumbnail so the group list view reflects
      // the freshly added photo. Otherwise the cover stays at whatever the
      // previous fetchGroups pass cached (or null for previously empty groups).
      const fresh = get().groupPhotos[groupId]
      const cover = fresh && fresh.length > 0 ? fresh[0].src : null
      set((state) => ({
        groups: state.groups.map((g) =>
          g.id === groupId ? { ...g, coverSrc: cover } : g,
        ),
      }))
    } catch (error) {
      set({
        groupPhotosError: errorMessage(
          error,
          '그룹에 사진을 추가하지 못했어요',
        ),
      })
    }
  },

  removePhotoFromGroup: async (groupId, photoIds) => {
    if (!groupId || photoIds.length === 0) return
    const before = get().groupPhotos[groupId] ?? []
    const idSet = new Set(photoIds)
    set((state) => ({
      groupPhotos: {
        ...state.groupPhotos,
        [groupId]: before.filter((photo) => !idSet.has(photo.id)),
      },
      groups: state.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              totalCount: Math.max(0, group.totalCount - photoIds.length),
            }
          : group,
      ),
    }))
    const results = await Promise.allSettled(
      photoIds.map((id) => apiRemovePhotoFromGroup(groupId, id)),
    )
    const failedIds = results
      .map((result, index) => {
        if (result.status === 'rejected') return photoIds[index]
        if (result.value === false) return photoIds[index]
        return null
      })
      .filter((id): id is string => id !== null)
    if (failedIds.length === 0) return
    const successSet = new Set(
      photoIds.filter((id) => !failedIds.includes(id)),
    )
    const restoredList = before.filter((photo) => !successSet.has(photo.id))
    set((state) => ({
      groupPhotos: { ...state.groupPhotos, [groupId]: restoredList },
      groups: state.groups.map((group) =>
        group.id === groupId
          ? { ...group, totalCount: group.totalCount + failedIds.length }
          : group,
      ),
      groupPhotosError:
        failedIds.length === photoIds.length
          ? '그룹에서 사진을 제거하지 못했어요'
          : `${failedIds.length}장을 제거하지 못했어요`,
    }))
  },

  resetForEvent: (eventId) => {
    const current = get().loadedEventId
    if (current && current !== eventId) {
      set({
        groups: [],
        groupTotalCount: 0,
        isLoadingGroups: false,
        groupsError: null,
        loadedEventId: null,
        groupPhotos: {},
        loadingGroupId: null,
        groupPhotosError: null,
      })
    }
  },
}))
