import { makeTimelinePhotos } from '@/widgets/host-album-photos/model/mock-photos'
import { type TimelinePhoto } from '@/widgets/host-album-photos/model/timeline'

export type SimilarBucket = {
  id: string
  totalCount: number
  photos: TimelinePhoto[]
}

export const MOCK_SIMILAR_BUCKETS: SimilarBucket[] = [
  {
    id: 's-1',
    totalCount: 22,
    photos: makeTimelinePhotos('s-1', 18, {
      favIndices: [3],
      aiIndices: [2, 5],
    }),
  },
  {
    id: 's-2',
    totalCount: 40,
    photos: makeTimelinePhotos('s-2', 18, {
      favIndices: [0, 7],
      aiIndices: [1],
    }),
  },
  {
    id: 's-3',
    totalCount: 11,
    photos: makeTimelinePhotos('s-3', 11, {
      favIndices: [4],
      aiIndices: [6],
    }),
  },
  {
    id: 's-4',
    totalCount: 13,
    photos: makeTimelinePhotos('s-4', 13, {
      favIndices: [2, 9],
      aiIndices: [5],
    }),
  },
  {
    id: 's-5',
    totalCount: 8,
    photos: makeTimelinePhotos('s-5', 8, {
      favIndices: [0],
      aiIndices: [3],
    }),
  },
  {
    id: 's-6',
    totalCount: 3,
    photos: makeTimelinePhotos('s-6', 3, { aiIndices: [1] }),
  },
  {
    id: 's-7',
    totalCount: 13,
    photos: makeTimelinePhotos('s-7', 13, {
      favIndices: [1, 6],
      aiIndices: [4],
    }),
  },
  {
    id: 's-8',
    totalCount: 13,
    photos: makeTimelinePhotos('s-8', 13, {
      favIndices: [5],
      aiIndices: [2, 8],
    }),
  },
]
