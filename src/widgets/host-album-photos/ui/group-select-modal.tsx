import { useEffect, useState } from 'react'

import { useGroupStore } from '@/widgets/host-album-photos/store/group-store'

const PLUS_ICON = '/icons/plus-circle-dark.svg'

type GroupSelectModalProps = {
  selectedPhotoCount: number
  onClose: () => void
  onAdd: (groupId: string) => void
  onCreateNew: () => void
}

export function GroupSelectModal({
  selectedPhotoCount,
  onClose,
  onAdd,
  onCreateNew,
}: GroupSelectModalProps) {
  const groups = useGroupStore((state) => state.groups)
  const isLoading = useGroupStore((state) => state.isLoadingGroups)
  const fetchGroups = useGroupStore((state) => state.fetchGroups)
  const [pickedId, setPickedId] = useState<string | null>(null)

  useEffect(() => {
    if (groups.length === 0) {
      void fetchGroups()
    }
  }, [groups.length, fetchGroups])

  const handleConfirm = () => {
    if (!pickedId) return
    onAdd(pickedId)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-select-title"
      className="absolute inset-0 z-30 flex items-center justify-center px-5"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex w-full max-w-[362px] flex-col items-center gap-5 rounded-[18px] bg-white px-4 py-5">
        <div className="flex w-full flex-col items-center gap-1">
          <h2
            id="group-select-title"
            className="text-[20px] font-bold leading-normal text-[#222226]"
          >
            사진 그룹에 추가하기
          </h2>
          <p className="text-[14px] tracking-[-0.28px] text-[#616369]">
            선택한 {selectedPhotoCount}장의 사진을 추가할 그룹을 선택하세요
          </p>
        </div>

        <ul
          role="radiogroup"
          aria-label="그룹 목록"
          className="flex max-h-[280px] w-full flex-col gap-2 overflow-y-auto"
        >
          {isLoading && groups.length === 0 ? (
            <li className="py-4 text-center text-[14px] text-[#a2a5ad]">
              그룹을 불러오는 중...
            </li>
          ) : (
            groups.map((group) => {
              const picked = pickedId === group.id
              return (
                <li key={group.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={picked}
                    onClick={() => setPickedId(group.id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors ${
                      picked
                        ? 'bg-[#222226] text-white'
                        : 'bg-[#f4f6fa] text-[#222226]'
                    }`}
                  >
                    <span className="text-[16px] font-medium">
                      {group.name}
                    </span>
                    <span
                      className={`text-[14px] ${
                        picked ? 'text-white/70' : 'text-[#a2a5ad]'
                      }`}
                    >
                      {group.totalCount.toLocaleString()}장
                    </span>
                  </button>
                </li>
              )
            })
          )}
          <li>
            <button
              type="button"
              onClick={onCreateNew}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#d7dbe2] bg-white px-4 py-3 text-[16px] font-medium text-[#222226]"
            >
              <img
                src={PLUS_ICON}
                alt=""
                aria-hidden="true"
                className="h-5 w-5"
              />
              새 그룹 만들기
            </button>
          </li>
        </ul>

        <div className="flex w-full items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#f4f6fa] text-[18px] font-medium text-[#222226]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!pickedId}
            className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#222226] text-[18px] font-medium text-white transition-opacity disabled:opacity-50"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  )
}
