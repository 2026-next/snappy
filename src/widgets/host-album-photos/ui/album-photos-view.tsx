import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { useNavigate } from 'react-router-dom'

import { type CategoryKey } from '@/widgets/host-album-photos/model/category'
import {
  EMPTY_FILTER,
  type FilterValue,
} from '@/widgets/host-album-photos/model/filter'
import { MOCK_SIMILAR_BUCKETS } from '@/widgets/host-album-photos/model/similar'
import {
  DEFAULT_SORT,
  type SortKey,
} from '@/widgets/host-album-photos/model/sort'
import {
  MOCK_TIMELINE_BUCKETS,
  type TimelinePhoto,
} from '@/widgets/host-album-photos/model/timeline'
import { MOCK_UPLOADER_BUCKETS } from '@/widgets/host-album-photos/model/uploader'
import { useGroupStore } from '@/widgets/host-album-photos/store/group-store'

import { AlbumPhotosHeader } from './album-photos-header'
import { AlbumSearchBar } from './album-search-bar'
import { CategoryTabs } from './category-tabs'
import { EmptyState } from './empty-state'
import { FilterSheet } from './filter-sheet'
import { GroupCreateModal } from './group-create-modal'
import { GroupDetail } from './group-detail'
import { GroupSelectModal } from './group-select-modal'
import { PhotoGrid, type PhotoItem } from './photo-grid'
import { SelectionActionBar } from './selection-action-bar'
import { SortSheet } from './sort-sheet'
import { StackBucketList } from './stack-bucket-list'
import { TimelineDetail } from './timeline-detail'
import { TimelineList, type RowBucket } from './timeline-list'

const PLUS_CIRCLE = '/icons/plus-circle.svg'

const ALBUM_TITLE = '민수 & 지연 Wedding'
const MOCK_PHOTO_COUNT = 18
const MOCK_TOTAL_COUNT = 428
const MOCK_FAVORITE_TOTAL_COUNT = 143

type Overlay = 'none' | 'filter' | 'sort' | 'create-group' | 'select-group'

function createMockPhotos(count: number): PhotoItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `photo-${index + 1}`,
    src: null,
    isFavorite: true,
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

  const [timelineBuckets, setTimelineBuckets] = useState(MOCK_TIMELINE_BUCKETS)
  const [uploaderBuckets, setUploaderBuckets] = useState(MOCK_UPLOADER_BUCKETS)
  const [similarBuckets, setSimilarBuckets] = useState(MOCK_SIMILAR_BUCKETS)

  const [activeBucketId, setActiveBucketId] = useState<string | null>(null)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  const groups = useGroupStore((state) => state.groups)
  const groupTotalCount = useGroupStore((state) => state.groupTotalCount)
  const isLoadingGroups = useGroupStore((state) => state.isLoadingGroups)
  const groupPhotos = useGroupStore((state) => state.groupPhotos)
  const loadingGroupId = useGroupStore((state) => state.loadingGroupId)
  const fetchGroups = useGroupStore((state) => state.fetchGroups)
  const fetchGroupPhotos = useGroupStore((state) => state.fetchGroupPhotos)
  const removePhotoFromGroup = useGroupStore(
    (state) => state.removePhotoFromGroup,
  )

  useEffect(() => {
    if (category === 'group' && groups.length === 0) {
      void fetchGroups()
    }
  }, [category, groups.length, fetchGroups])

  useEffect(() => {
    if (category === 'group' && activeBucketId) {
      void fetchGroupPhotos(activeBucketId)
    }
  }, [category, activeBucketId, fetchGroupPhotos])

  const visibleFlatPhotos = useMemo(() => {
    if (category === 'favorite') {
      return photos.filter((photo) => photo.isFavorite)
    }
    return photos
  }, [photos, category])

  const flatTotalCount = isEmpty
    ? 0
    : category === 'favorite'
      ? MOCK_FAVORITE_TOTAL_COUNT
      : MOCK_TOTAL_COUNT

  const isFlatGridView = category === 'all' || category === 'favorite'

  const activeTimelineBucket =
    category === 'timeline'
      ? (timelineBuckets.find((b) => b.id === activeBucketId) ?? null)
      : null
  const activeUploaderBucket =
    category === 'uploader'
      ? (uploaderBuckets.find((b) => b.id === activeBucketId) ?? null)
      : null
  const activeSimilarBucket =
    category === 'similar'
      ? (similarBuckets.find((b) => b.id === activeBucketId) ?? null)
      : null
  const activeGroup =
    category === 'group'
      ? (groups.find((g) => g.id === activeBucketId) ?? null)
      : null

  const isInDetailView = activeBucketId !== null && !isFlatGridView

  const exitSelectionMode = () => {
    setIsSelectionMode(false)
    setSelectedIds(new Set())
  }

  const handleSelectCategory = (key: CategoryKey) => {
    setCategory(key)
    setActiveBucketId(null)
    exitSelectionMode()
  }

  const handleBack = () => {
    if (isSelectionMode) {
      exitSelectionMode()
      return
    }
    if (isInDetailView) {
      setActiveBucketId(null)
      exitSelectionMode()
      return
    }
    navigate(-1)
  }
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
    exitSelectionMode()
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

  const togglePhotoFavorite = <
    B extends { id: string; photos: TimelinePhoto[] },
  >(
    bucketId: string,
    photoId: string,
    setBuckets: Dispatch<SetStateAction<B[]>>,
  ) => {
    setBuckets((prev) =>
      prev.map((bucket) =>
        bucket.id === bucketId
          ? {
              ...bucket,
              photos: bucket.photos.map((photo) =>
                photo.id === photoId
                  ? { ...photo, isFavorite: !photo.isFavorite }
                  : photo,
              ),
            }
          : bucket,
      ),
    )
  }

  const handleToggleTimelineFavorite = (photoId: string) => {
    if (!activeBucketId) return
    togglePhotoFavorite(activeBucketId, photoId, setTimelineBuckets)
  }
  const handleToggleUploaderFavorite = (photoId: string) => {
    if (!activeBucketId) return
    togglePhotoFavorite(activeBucketId, photoId, setUploaderBuckets)
  }
  const handleToggleSimilarFavorite = (photoId: string) => {
    if (!activeBucketId) return
    togglePhotoFavorite(activeBucketId, photoId, setSimilarBuckets)
  }

  const handleToggleSelect = (photoId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(photoId)) {
        next.delete(photoId)
      } else {
        next.add(photoId)
      }
      return next
    })
  }

  const handleEnterSelection = () => {
    setIsSelectionMode(true)
    setSelectedIds(new Set())
  }

  const handleDeleteSelected = () => {}
  const handleAddSelectedToGroup = () => {
    setOverlay('select-group')
  }
  const handleAddToExistingGroup = () => {
    setOverlay('none')
    exitSelectionMode()
  }

  const handleDeleteFromGroup = async () => {
    if (!activeGroup) return
    await removePhotoFromGroup(activeGroup.id, Array.from(selectedIds))
    exitSelectionMode()
  }

  const timelineRowBuckets: RowBucket[] = useMemo(
    () =>
      timelineBuckets.map((bucket) => ({
        id: bucket.id,
        headerTitle: (
          <>
            <span>{bucket.date}</span>
            <span>·</span>
            <span>{bucket.time}</span>
          </>
        ),
        totalCount: bucket.totalCount,
        photoCount: bucket.photos.length,
        ariaLabel: `${bucket.date} ${bucket.time} 사진 모두 보기`,
      })),
    [timelineBuckets],
  )

  const uploaderRowBuckets: RowBucket[] = useMemo(
    () =>
      uploaderBuckets.map((bucket) => ({
        id: bucket.id,
        headerTitle: (
          <>
            <span>{bucket.name}</span>
            <span>·</span>
            <span>{bucket.relation}</span>
          </>
        ),
        totalCount: bucket.totalCount,
        photoCount: bucket.photos.length,
        ariaLabel: `${bucket.name} ${bucket.relation} 사진 모두 보기`,
      })),
    [uploaderBuckets],
  )

  const similarStackBuckets = useMemo(
    () =>
      similarBuckets.map((bucket) => ({
        id: bucket.id,
        totalCount: bucket.totalCount,
      })),
    [similarBuckets],
  )

  const groupStackBuckets = useMemo(
    () =>
      groups.map((group) => ({
        id: group.id,
        totalCount: group.totalCount,
        label: group.name,
      })),
    [groups],
  )

  const showCreateGroupCta =
    !isEmpty &&
    !isSelectionMode &&
    !isInDetailView &&
    (isFlatGridView || category === 'group')

  const isInGroupDetail = category === 'group' && activeGroup !== null
  const isInOtherDetail = isInDetailView && !isInGroupDetail
  const showSelectionBar =
    isSelectionMode && (isInGroupDetail || isInOtherDetail)

  const renderContent = () => {
    if (isEmpty) {
      return <EmptyState onSendShareLink={handleSendShareLink} />
    }

    if (category === 'all' || category === 'favorite') {
      return (
        <PhotoGrid
          category={category}
          photos={visibleFlatPhotos}
          totalCount={flatTotalCount}
          onDelete={handleDeletePhotos}
          onToggleFavorite={handleToggleFavorite}
        />
      )
    }

    if (category === 'timeline') {
      if (activeTimelineBucket) {
        return (
          <TimelineDetail
            headerTitle={
              <>
                <span className="font-semibold text-[#222226]">
                  {activeTimelineBucket.date}
                </span>
                <span className="font-semibold text-[#222226]">·</span>
                <span className="font-semibold text-[#222226]">
                  {activeTimelineBucket.time}
                </span>
              </>
            }
            totalCount={activeTimelineBucket.totalCount}
            photos={activeTimelineBucket.photos}
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onToggleFavorite={handleToggleTimelineFavorite}
            onToggleSelect={handleToggleSelect}
            onEnterSelection={handleEnterSelection}
            onExitSelection={exitSelectionMode}
          />
        )
      }
      return (
        <TimelineList
          buckets={timelineRowBuckets}
          onOpenBucket={(bucketId) => {
            setActiveBucketId(bucketId)
            exitSelectionMode()
          }}
        />
      )
    }

    if (category === 'uploader') {
      if (activeUploaderBucket) {
        return (
          <TimelineDetail
            headerTitle={
              <>
                <span className="font-semibold text-[#222226]">
                  {activeUploaderBucket.name}
                </span>
                <span className="font-semibold text-[#222226]">·</span>
                <span className="font-semibold text-[#222226]">
                  {activeUploaderBucket.relation}
                </span>
              </>
            }
            totalCount={activeUploaderBucket.totalCount}
            photos={activeUploaderBucket.photos}
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onToggleFavorite={handleToggleUploaderFavorite}
            onToggleSelect={handleToggleSelect}
            onEnterSelection={handleEnterSelection}
            onExitSelection={exitSelectionMode}
          />
        )
      }
      return (
        <TimelineList
          buckets={uploaderRowBuckets}
          onOpenBucket={(bucketId) => {
            setActiveBucketId(bucketId)
            exitSelectionMode()
          }}
        />
      )
    }

    if (category === 'similar') {
      if (activeSimilarBucket) {
        return (
          <TimelineDetail
            totalCount={activeSimilarBucket.totalCount}
            photos={activeSimilarBucket.photos}
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onToggleFavorite={handleToggleSimilarFavorite}
            onToggleSelect={handleToggleSelect}
            onEnterSelection={handleEnterSelection}
            onExitSelection={exitSelectionMode}
          />
        )
      }
      return (
        <StackBucketList
          buckets={similarStackBuckets}
          onOpenBucket={(bucketId) => {
            setActiveBucketId(bucketId)
            exitSelectionMode()
          }}
          ariaLabelFor={(bucket) => `비슷한 구도 ${bucket.totalCount}장 보기`}
        />
      )
    }

    if (category === 'group') {
      if (activeGroup) {
        const photosForGroup = groupPhotos[activeGroup.id]
        if (loadingGroupId === activeGroup.id || !photosForGroup) {
          return (
            <p className="py-8 text-center text-[14px] text-[#a2a5ad]">
              그룹 사진을 불러오는 중...
            </p>
          )
        }
        return (
          <GroupDetail
            groupName={activeGroup.name}
            totalCount={activeGroup.totalCount}
            photos={photosForGroup}
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onEnterSelection={handleEnterSelection}
            onExitSelection={exitSelectionMode}
          />
        )
      }
      if (isLoadingGroups && groups.length === 0) {
        return (
          <p className="py-8 text-center text-[14px] text-[#a2a5ad]">
            그룹을 불러오는 중...
          </p>
        )
      }
      return (
        <div className="flex flex-col gap-2">
          <p className="text-right text-[12px] text-[#a2a5ad]">
            총 {groupTotalCount.toLocaleString()}개
          </p>
          <StackBucketList
            buckets={groupStackBuckets}
            onOpenBucket={(bucketId) => {
              setActiveBucketId(bucketId)
              exitSelectionMode()
            }}
            ariaLabelFor={(bucket) => `${bucket.label ?? '그룹'} 사진 보기`}
          />
        </div>
      )
    }

    return null
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
          <CategoryTabs selected={category} onSelect={handleSelectCategory} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-[100px] pt-5">
        {renderContent()}
      </div>

      {showCreateGroupCta && (
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

      {showSelectionBar && (
        <div className="sticky bottom-0 left-0 right-0 z-10 flex justify-center bg-gradient-to-t from-white via-white to-transparent px-5 pb-5 pt-3">
          <SelectionActionBar
            selectedCount={selectedIds.size}
            showAddToGroup={!isInGroupDetail}
            onDelete={isInGroupDetail ? handleDeleteFromGroup : handleDeleteSelected}
            onAddToGroup={handleAddSelectedToGroup}
          />
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
      {overlay === 'select-group' && (
        <GroupSelectModal
          selectedPhotoCount={selectedIds.size}
          onClose={() => setOverlay('none')}
          onAdd={handleAddToExistingGroup}
          onCreateNew={() => setOverlay('create-group')}
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
