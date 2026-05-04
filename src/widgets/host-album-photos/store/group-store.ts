import { create } from 'zustand'

import { makeBasicPhotos } from '@/widgets/host-album-photos/model/mock-photos'
import { type PhotoItem } from '@/widgets/host-album-photos/ui/photo-grid'

export type Group = {
  id: string
  name: string
  totalCount: number
  thumbnails: PhotoItem[]
}

type GroupStoreState = {
  groups: Group[]
  groupTotalCount: number
  isLoadingGroups: boolean
  groupsError: string | null

  groupPhotos: Record<string, PhotoItem[]>
  loadingGroupId: string | null
  groupPhotosError: string | null

  fetchGroups: () => Promise<void>
  fetchGroupPhotos: (groupId: string) => Promise<void>
  removePhotoFromGroup: (groupId: string, photoIds: string[]) => Promise<void>
}

const FAKE_LATENCY_MS = 350

const FIXTURE_GROUPS: Group[] = [
  {
    id: 'g-family',
    name: '가족 사진',
    totalCount: 22,
    thumbnails: makeBasicPhotos('g-family-thumb', 3),
  },
  {
    id: 'g-highschool',
    name: '고등학교 동창',
    totalCount: 40,
    thumbnails: makeBasicPhotos('g-highschool-thumb', 3),
  },
  {
    id: 'g-college',
    name: '대학교 동기',
    totalCount: 11,
    thumbnails: makeBasicPhotos('g-college-thumb', 3),
  },
  {
    id: 'g-work',
    name: '직장 동료들과',
    totalCount: 13,
    thumbnails: makeBasicPhotos('g-work-thumb', 3),
  },
  {
    id: 'g-neighbors',
    name: '동네 친구들',
    totalCount: 11,
    thumbnails: makeBasicPhotos('g-neighbors-thumb', 3),
  },
  {
    id: 'g-bride',
    name: '신부 독사진',
    totalCount: 13,
    thumbnails: makeBasicPhotos('g-bride-thumb', 3),
  },
  {
    id: 'g-groom',
    name: '신랑 독사진',
    totalCount: 11,
    thumbnails: makeBasicPhotos('g-groom-thumb', 3),
  },
  {
    id: 'g-bestcut',
    name: '베스트컷',
    totalCount: 11,
    thumbnails: makeBasicPhotos('g-bestcut-thumb', 3),
  },
]

const FIXTURE_GROUP_TOTAL = 12

const FIXTURE_GROUP_PHOTOS: Record<string, PhotoItem[]> = Object.fromEntries(
  FIXTURE_GROUPS.map((group) => [
    group.id,
    makeBasicPhotos(`${group.id}-photo`, Math.min(group.totalCount, 18)),
  ]),
)

function delay<T>(value: T, ms = FAKE_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const useGroupStore = create<GroupStoreState>((set, get) => ({
  groups: [],
  groupTotalCount: 0,
  isLoadingGroups: false,
  groupsError: null,

  groupPhotos: {},
  loadingGroupId: null,
  groupPhotosError: null,

  fetchGroups: async () => {
    if (get().isLoadingGroups) return
    set({ isLoadingGroups: true, groupsError: null })
    try {
      const groups = await delay(FIXTURE_GROUPS)
      set({
        groups,
        groupTotalCount: FIXTURE_GROUP_TOTAL,
        isLoadingGroups: false,
      })
    } catch (error) {
      set({
        isLoadingGroups: false,
        groupsError:
          error instanceof Error ? error.message : '그룹을 불러오지 못했어요',
      })
    }
  },

  fetchGroupPhotos: async (groupId) => {
    if (get().loadingGroupId === groupId) return
    if (get().groupPhotos[groupId]) return
    set({ loadingGroupId: groupId, groupPhotosError: null })
    try {
      const photos = await delay(FIXTURE_GROUP_PHOTOS[groupId] ?? [])
      set((state) => ({
        groupPhotos: { ...state.groupPhotos, [groupId]: photos },
        loadingGroupId: null,
      }))
    } catch (error) {
      set({
        loadingGroupId: null,
        groupPhotosError:
          error instanceof Error
            ? error.message
            : '그룹 사진을 불러오지 못했어요',
      })
    }
  },

  removePhotoFromGroup: async (groupId, photoIds) => {
    const before = get().groupPhotos[groupId] ?? []
    const after = before.filter((photo) => !photoIds.includes(photo.id))
    set((state) => ({
      groupPhotos: { ...state.groupPhotos, [groupId]: after },
      groups: state.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              totalCount: Math.max(0, group.totalCount - photoIds.length),
            }
          : group,
      ),
    }))
    await delay(undefined, 150)
  },
}))
