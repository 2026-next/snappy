import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { type CategoryKey } from '@/widgets/host-album-photos/model/category'
import {
  EMPTY_FILTER,
  type FilterValue,
} from '@/widgets/host-album-photos/model/filter'
import {
  DEFAULT_SORT,
  type SortKey,
} from '@/widgets/host-album-photos/model/sort'

import { AlbumPhotosHeader } from './album-photos-header'
import { AlbumSearchBar } from './album-search-bar'
import { CategoryTabs } from './category-tabs'
import { EmptyState } from './empty-state'
import { FilterSheet } from './filter-sheet'
import { GroupCreateModal } from './group-create-modal'
import { PhotoGrid, type PhotoItem } from './photo-grid'
import { SortSheet } from './sort-sheet'

const PLUS_CIRCLE = '/icons/plus-circle.svg'

const ALBUM_TITLE = '민수 & 지연 Wedding'
const MOCK_PHOTO_COUNT = 18
const MOCK_TOTAL_COUNT = 428

type Overlay = 'none' | 'filter' | 'sort' | 'create-group'

function createMockPhotos(count: number): PhotoItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `photo-${index + 1}`,
    src: null,
    isFavorite: false,
  }))
}

export function AlbumPhotosView() {
  const navigate = useNavigate()

  const [isEmpty, setIsEmpty] = useState(false)
  const [photos, setPhotos] = useState<PhotoItem[]>(() =>
    createMockPhotos(MOCK_PHOTO_COUNT),
  )
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryKey>('all')
  const [filter, setFilter] = useState<FilterValue>(EMPTY_FILTER)
  const [sort, setSort] = useState<SortKey>(DEFAULT_SORT)
  const [overlay, setOverlay] = useState<Overlay>('none')

  const totalCount = isEmpty ? 0 : MOCK_TOTAL_COUNT

  const handleBack = () => navigate(-1)
  const handleMore = () => {
    // placeholder — opens nothing for now
  }

  const handleApplyFilter = (value: FilterValue) => {
    setFilter(value)
    setOverlay('none')
  }
  const handleApplySort = (value: SortKey) => {
    setSort(value)
    setOverlay('none')
  }
  const handleCreateGroup = (name: string) => {
    if (!name) return
    setOverlay('none')
  }

  const handleSendShareLink = () => {
    // placeholder — would open share flow later
  }
  const handleDeletePhotos = () => {
    // placeholder — would open delete flow later
  }
  const handleToggleFavorite = (id: string) => {
    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === id ? { ...photo, isFavorite: !photo.isFavorite } : photo,
      ),
    )
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-white">
      <AlbumPhotosHeader
        title={ALBUM_TITLE}
        onBack={handleBack}
        onMore={handleMore}
      />

      <div className="mt-[10px] flex flex-col gap-3">
        <AlbumSearchBar
          value={search}
          onChange={setSearch}
          onOpenFilter={() => setOverlay('filter')}
          onOpenSort={() => setOverlay('sort')}
        />
        <div className="px-5">
          <CategoryTabs selected={category} onSelect={setCategory} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-[100px] pt-5">
        {isEmpty ? (
          <EmptyState onSendShareLink={handleSendShareLink} />
        ) : (
          <PhotoGrid
            photos={photos}
            totalCount={totalCount}
            onDelete={handleDeletePhotos}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </div>

      {!isEmpty && (
        <div className="sticky bottom-0 left-0 right-0 z-10 flex justify-center bg-gradient-to-t from-white via-white to-transparent px-5 pb-5 pt-3">
          <button
            type="button"
            onClick={() => setOverlay('create-group')}
            className="flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-[#222226] text-[18px] font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
          >
            <img
              src={PLUS_CIRCLE}
              alt=""
              className="h-6 w-6"
              aria-hidden="true"
            />
            그룹 생성
          </button>
        </div>
      )}

      {overlay === 'filter' && (
        <FilterSheet
          initialValue={filter}
          onClose={() => setOverlay('none')}
          onApply={handleApplyFilter}
        />
      )}
      {overlay === 'sort' && (
        <SortSheet
          initialValue={sort}
          onClose={() => setOverlay('none')}
          onApply={handleApplySort}
        />
      )}
      {overlay === 'create-group' && (
        <GroupCreateModal
          onClose={() => setOverlay('none')}
          onCreate={handleCreateGroup}
        />
      )}

      {import.meta.env.DEV && (
        <button
          type="button"
          onClick={() => setIsEmpty((prev) => !prev)}
          aria-label="dev: 빈 상태 토글"
          className="fixed bottom-4 right-4 z-50 flex h-10 items-center justify-center rounded-full bg-fuchsia-600 px-3 text-[12px] font-semibold text-white shadow-lg"
        >
          DEV: {isEmpty ? '빈 상태' : '사진 있음'}
        </button>
      )}
    </main>
  )
}
