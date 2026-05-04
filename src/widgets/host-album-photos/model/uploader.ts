import { makeTimelinePhotos } from '@/widgets/host-album-photos/model/mock-photos'
import { type TimelinePhoto } from '@/widgets/host-album-photos/model/timeline'

export type UploaderBucket = {
  id: string
  name: string
  relation: string
  totalCount: number
  photos: TimelinePhoto[]
}

export const MOCK_UPLOADER_BUCKETS: UploaderBucket[] = [
  {
    id: 'u-kim-minjae',
    name: '김민재',
    relation: '친구',
    totalCount: 13,
    photos: makeTimelinePhotos('u-kim-minjae', 18, {
      favIndices: [0, 4, 9],
      aiIndices: [1, 11],
    }),
  },
  {
    id: 'u-lee-suyeon',
    name: '이수연',
    relation: '직장동료',
    totalCount: 4,
    photos: makeTimelinePhotos('u-lee-suyeon', 4, {
      favIndices: [1],
      aiIndices: [3],
    }),
  },
  {
    id: 'u-park-sujin',
    name: '박수진',
    relation: '친구',
    totalCount: 22,
    photos: makeTimelinePhotos('u-park-sujin', 18, {
      favIndices: [2, 5, 14],
      aiIndices: [3, 6],
    }),
  },
  {
    id: 'u-han-sian-friend',
    name: '한시안',
    relation: '친구',
    totalCount: 3,
    photos: makeTimelinePhotos('u-han-sian-friend', 3, { favIndices: [0] }),
  },
  {
    id: 'u-han-sian-work',
    name: '한시안',
    relation: '직장동료',
    totalCount: 30,
    photos: makeTimelinePhotos('u-han-sian-work', 18, {
      favIndices: [4, 7],
      aiIndices: [10, 12],
    }),
  },
  {
    id: 'u-kim-minjun',
    name: '김민준',
    relation: '친구',
    totalCount: 8,
    photos: makeTimelinePhotos('u-kim-minjun', 8, {
      favIndices: [1, 5],
      aiIndices: [2],
    }),
  },
]
