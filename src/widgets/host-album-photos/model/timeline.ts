import { makeTimelinePhotos } from '@/widgets/host-album-photos/model/mock-photos'
import { type PhotoItem } from '@/widgets/host-album-photos/ui/photo-grid'

export type TimelinePhoto = PhotoItem & {
  isAi: boolean
}

export type TimelineBucketData = {
  id: string
  date: string
  time: string
  totalCount: number
  photos: TimelinePhoto[]
}

export const MOCK_TIMELINE_BUCKETS: TimelineBucketData[] = [
  {
    id: '2026-05-04T1200',
    date: '2026.05.04',
    time: '12:00',
    totalCount: 42,
    photos: makeTimelinePhotos('2026-05-04T1200', 18, {
      favIndices: [2, 4, 8],
      aiIndices: [2, 3, 11],
    }),
  },
  {
    id: '2026-05-04T1300',
    date: '2026.05.04',
    time: '13:00',
    totalCount: 108,
    photos: makeTimelinePhotos('2026-05-04T1300', 18, {
      favIndices: [0, 5, 9],
      aiIndices: [4, 7],
    }),
  },
  {
    id: '2026-05-04T1400',
    date: '2026.05.04',
    time: '14:00',
    totalCount: 36,
    photos: makeTimelinePhotos('2026-05-04T1400', 18, {
      favIndices: [1, 6],
      aiIndices: [0, 12],
    }),
  },
  {
    id: '2026-05-04T1500',
    date: '2026.05.04',
    time: '15:00',
    totalCount: 27,
    photos: makeTimelinePhotos('2026-05-04T1500', 18, {
      favIndices: [3, 7],
      aiIndices: [9],
    }),
  },
  {
    id: '2026-05-04T1600',
    date: '2026.05.04',
    time: '16:00',
    totalCount: 84,
    photos: makeTimelinePhotos('2026-05-04T1600', 18, {
      favIndices: [0, 4, 11],
      aiIndices: [2, 5, 8],
    }),
  },
  {
    id: '2026-05-04T1700',
    date: '2026.05.04',
    time: '17:00',
    totalCount: 30,
    photos: makeTimelinePhotos('2026-05-04T1700', 18, {
      favIndices: [10],
      aiIndices: [3, 14],
    }),
  },
]
