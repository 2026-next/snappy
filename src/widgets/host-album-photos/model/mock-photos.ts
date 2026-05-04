import { type TimelinePhoto } from '@/widgets/host-album-photos/model/timeline'
import { type PhotoItem } from '@/widgets/host-album-photos/ui/photo-grid'

type MakeTimelinePhotosOptions = {
  favIndices?: number[]
  aiIndices?: number[]
}

export function makeTimelinePhotos(
  prefix: string,
  count: number,
  { favIndices = [], aiIndices = [] }: MakeTimelinePhotosOptions = {},
): TimelinePhoto[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
    src: null,
    isFavorite: favIndices.includes(index),
    isAi: aiIndices.includes(index),
  }))
}

export function makeBasicPhotos(prefix: string, count: number): PhotoItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
    src: null,
    isFavorite: false,
  }))
}
