import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { type PhotoSummary } from '@/shared/api/photo'
import { type CategoryKey } from '@/widgets/host-album-photos/model/category'
import {
  EMPTY_FILTER,
  type FilterValue,
} from '@/widgets/host-album-photos/model/filter'
import {
  DEFAULT_SORT,
  type SortKey,
} from '@/widgets/host-album-photos/model/sort'
import { useAlbumPhotosStore } from '@/widgets/host-album-photos/store/album-photos-store'
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

type Overlay = 'none' | 'filter' | 'sort' | 'create-group' | 'select-group'

function toGridItem(photo: PhotoSummary): PhotoItem {
  return {
    id: photo.id,
    src: photo.thumbnailUrl ?? photo.url,
    isFavorite: photo.isFavorite,
  }
}

function toTimelinePhoto(photo: PhotoSummary): PhotoItem & { isAi: boolean } {
  return { ...toGridItem(photo), isAi: photo.isAi }
}

export function AlbumPhotosView() {
  const navigate = useNavigate()
  const { albumId = '' } = useParams<{ albumId: string }>()

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryKey>('all')
  const [filter, setFilter] = useState<FilterValue>(EMPTY_FILTER)
  const [sort, setSort] = useState<SortKey>(DEFAULT_SORT)
  const [overlay, setOverlay] = useState<Overlay>('none')

  const [activeBucketId, setActiveBucketId] = useState<string | null>(null)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  const album = useAlbumPhotosStore((state) => state.album)
  const timeline = useAlbumPhotosStore((state) => state.timeline)
  const uploader = useAlbumPhotosStore((state) => state.uploader)
  const similar = useAlbumPhotosStore((state) => state.similar)
  const fetchAlbum = useAlbumPhotosStore((state) => state.fetchAlbum)
  const fetchTimeline = useAlbumPhotosStore((state) => state.fetchTimeline)
  const fetchUploaderGrouping = useAlbumPhotosStore(
    (state) => state.fetchUploaderGrouping,
  )
  const fetchSimilarComposition = useAlbumPhotosStore(
    (state) => state.fetchSimilarComposition,
  )
  const runUploaderSearch = useAlbumPhotosStore(
    (state) => state.runUploaderSearch,
  )
  const toggleFavorite = useAlbumPhotosStore((state) => state.toggleFavorite)
  const deletePhotos = useAlbumPhotosStore((state) => state.deletePhotos)
  const resetForEvent = useAlbumPhotosStore((state) => state.resetForEvent)

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
    resetForEvent(albumId)
  }, [albumId, resetForEvent])

  useEffect(() => {
    if (!albumId) return
    if (category === 'all' || category === 'favorite') {
      if (album.loadedEventId !== albumId && !album.isLoading) {
        void fetchAlbum(albumId, sort === 'oldest' ? 'asc' : 'desc')
      }
    }
    if (category === 'timeline') {
      if (timeline.loadedEventId !== albumId && !timeline.isLoading) {
        void fetchTimeline(albumId)
      }
    }
    if (category === 'uploader') {
      if (uploader.loadedEventId !== albumId && !uploader.isLoading) {
        void fetchUploaderGrouping(albumId)
      }
    }
    if (category === 'similar') {
      if (similar.loadedEventId !== albumId && !similar.isLoading) {
        void fetchSimilarComposition(albumId)
      }
    }
    if (category === 'group' && groups.length === 0) {
      void fetchGroups()
    }
  }, [
    albumId,
    category,
    sort,
    album.loadedEventId,
    album.isLoading,
    timeline.loadedEventId,
    timeline.isLoading,
    uploader.loadedEventId,
    uploader.isLoading,
    similar.loadedEventId,
    similar.isLoading,
    groups.length,
    fetchAlbum,
    fetchTimeline,
    fetchUploaderGrouping,
    fetchSimilarComposition,
    fetchGroups,
  ])

  useEffect(() => {
    if (category === 'group' && activeBucketId) {
      void fetchGroupPhotos(activeBucketId)
    }
  }, [category, activeBucketId, fetchGroupPhotos])

  useEffect(() => {
    if (category !== 'uploader' || !albumId) return
    const trimmed = search.trim()
    const handle = window.setTimeout(() => {
      void runUploaderSearch(albumId, trimmed)
    }, 300)
    return () => window.clearTimeout(handle)
  }, [category, search, albumId, runUploaderSearch])

  const albumGridItems = useMemo(
    () => album.data.items.map(toGridItem),
    [album.data.items],
  )
  const albumFavoriteItems = useMemo(
    () => album.data.items.filter((p) => p.isFavorite).map(toGridItem),
    [album.data.items],
  )
  const flatTotalCount =
    category === 'favorite' ? albumFavoriteItems.length : album.data.total
  const isFlatGridView = category === 'all' || category === 'favorite'
  const visibleFlatPhotos =
    category === 'favorite' ? albumFavoriteItems : albumGridItems
  const isFlatEmpty =
    isFlatGridView &&
    !album.isLoading &&
    album.loadedEventId === albumId &&
    visibleFlatPhotos.length === 0

  const activeTimelineBucket =
    category === 'timeline'
      ? (timeline.data.find((b) => b.id === activeBucketId) ?? null)
      : null
  const activeUploaderBucket =
    category === 'uploader'
      ? (uploader.data.find((b) => b.id === activeBucketId) ?? null)
      : null
  const activeSimilarBucket =
    category === 'similar'
      ? (similar.data.find((b) => b.id === activeBucketId) ?? null)
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

  const handleMore = () => {}

  const handleApplyFilter = (value: FilterValue) => {
    setFilter(value)
    setOverlay('none')
  }
  const handleApplySort = (value: SortKey) => {
    setSort(value)
    setOverlay('none')
    if (albumId) {
      void fetchAlbum(albumId, value === 'oldest' ? 'asc' : 'desc')
    }
  }
  const handleCreateGroup = (name: string) => {
    if (!name) return
    setOverlay('none')
    exitSelectionMode()
  }

  const handleSendShareLink = () => {}
  const handleDeleteAllFromHeader = async () => {
    const allIds = album.data.items.map((p) => p.id)
    if (allIds.length === 0) return
    await deletePhotos(allIds)
  }
  const handleToggleFavorite = (id: string) => {
    void toggleFavorite(id)
  }

  const handleToggleSelect = (photoId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(photoId)) next.delete(photoId)
      else next.add(photoId)
      return next
    })
  }

  const handleEnterSelection = () => {
    setIsSelectionMode(true)
    setSelectedIds(new Set())
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    await deletePhotos(Array.from(selectedIds))
    exitSelectionMode()
  }
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
      timeline.data.map((bucket) => ({
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
    [timeline.data],
  )

  const uploaderRowBuckets: RowBucket[] = useMemo(
    () =>
      uploader.data.map((bucket) => ({
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
    [uploader.data],
  )

  const similarStackBuckets = useMemo(
    () =>
      similar.data.map((bucket) => ({
        id: bucket.id,
        totalCount: bucket.totalCount,
      })),
    [similar.data],
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
    !isFlatEmpty &&
    !isSelectionMode &&
    !isInDetailView &&
    (isFlatGridView || category === 'group')

  const isInGroupDetail = category === 'group' && activeGroup !== null
  const isInOtherDetail = isInDetailView && !isInGroupDetail
  const showSelectionBar =
    isSelectionMode && (isInGroupDetail || isInOtherDetail)

  // referenced for future filter-application work
  void filter

  const renderContent = () => {
    if (isFlatGridView) {
      if (album.isLoading && album.data.items.length === 0) {
        return (
          <p className="py-8 text-center text-[14px] text-[#a2a5ad]">
            사진을 불러오는 중...
          </p>
        )
      }
      if (album.error) {
        return (
          <p className="py-8 text-center text-[14px] text-[#e23a3a]">
            {album.error}
          </p>
        )
      }
      if (isFlatEmpty) {
        return <EmptyState onSendShareLink={handleSendShareLink} />
      }
      return (
        <PhotoGrid
          category={category}
          photos={visibleFlatPhotos}
          totalCount={flatTotalCount}
          onDelete={handleDeleteAllFromHeader}
          onToggleFavorite={handleToggleFavorite}
        />
      )
    }

    if (category === 'timeline') {
      if (timeline.isLoading && timeline.data.length === 0) {
        return (
          <p className="py-8 text-center text-[14px] text-[#a2a5ad]">
            타임라인을 불러오는 중...
          </p>
        )
      }
      if (timeline.error) {
        return (
          <p className="py-8 text-center text-[14px] text-[#e23a3a]">
            {timeline.error}
          </p>
        )
      }
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
            photos={activeTimelineBucket.photos.map(toTimelinePhoto)}
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onToggleFavorite={handleToggleFavorite}
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
      if (uploader.isLoading && uploader.data.length === 0) {
        return (
          <p className="py-8 text-center text-[14px] text-[#a2a5ad]">
            업로더별 사진을 불러오는 중...
          </p>
        )
      }
      if (uploader.error) {
        return (
          <p className="py-8 text-center text-[14px] text-[#e23a3a]">
            {uploader.error}
          </p>
        )
      }
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
            photos={activeUploaderBucket.photos.map(toTimelinePhoto)}
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onToggleFavorite={handleToggleFavorite}
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
      if (similar.isLoading && similar.data.length === 0) {
        return (
          <p className="py-8 text-center text-[14px] text-[#a2a5ad]">
            비슷한 구도를 분석하는 중...
          </p>
        )
      }
      if (similar.error) {
        return (
          <p className="py-8 text-center text-[14px] text-[#e23a3a]">
            {similar.error}
          </p>
        )
      }
      if (activeSimilarBucket) {
        return (
          <TimelineDetail
            totalCount={activeSimilarBucket.totalCount}
            photos={activeSimilarBucket.photos.map(toTimelinePhoto)}
            isSelectionMode={isSelectionMode}
            selectedIds={selectedIds}
            onToggleFavorite={handleToggleFavorite}
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
            onDelete={
              isInGroupDetail ? handleDeleteFromGroup : handleDeleteSelected
            }
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
    </main>
  )
}
