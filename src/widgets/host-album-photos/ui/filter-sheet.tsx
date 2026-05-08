import { useState } from 'react'

import {
  EMPTY_FILTER,
  PHOTO_STATUS_OPTIONS,
  RELATIONSHIP_OPTIONS,
  type FilterValue,
  type PhotoStatusKey,
  type RelationshipKey,
} from '@/widgets/host-album-photos/model/filter'

type FilterSheetProps = {
  initialValue: FilterValue
  onClose: () => void
  onApply: (value: FilterValue) => void
}

export function FilterSheet({
  initialValue,
  onClose,
  onApply,
}: FilterSheetProps) {
  const [draft, setDraft] = useState<FilterValue>(initialValue)

  const toggleRelationship = (key: RelationshipKey) => {
    setDraft((prev) => ({
      ...prev,
      relationships: prev.relationships.includes(key)
        ? prev.relationships.filter((k) => k !== key)
        : [...prev.relationships, key],
    }))
  }

  const togglePhotoStatus = (key: PhotoStatusKey) => {
    setDraft((prev) => ({
      ...prev,
      photoStatus: prev.photoStatus.includes(key)
        ? prev.photoStatus.filter((k) => k !== key)
        : [...prev.photoStatus, key],
    }))
  }

  const handleReset = () => {
    setDraft(EMPTY_FILTER)
    onApply(EMPTY_FILTER)
  }
  const handleApply = () => onApply(draft)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="필터 설정"
      className="absolute inset-0 z-30 flex flex-col justify-end"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex w-full flex-col rounded-t-2xl bg-white">
        <div className="flex justify-center pt-2">
          <span aria-hidden="true" className="h-1 w-10 rounded-full bg-[#d7dbe2]" />
        </div>

        <div className="px-5 pb-1 pt-3">
          <h2 className="px-[10px] py-[10px] text-[16px] font-semibold tracking-[-0.32px] text-black">
            필터 설정
          </h2>
        </div>

        <div className="flex flex-col gap-4 px-5 pb-5">
          <FilterGroup label="관계">
            <div className="flex flex-wrap gap-1">
              {RELATIONSHIP_OPTIONS.map((option) => {
                const active = draft.relationships.includes(option.key)
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => toggleRelationship(option.key)}
                    aria-pressed={active}
                    className={`flex items-center rounded-2xl px-4 py-[10px] text-[12px] font-medium tracking-[-0.24px] transition-colors ${
                      active
                        ? 'bg-[#222226] text-white'
                        : 'bg-[#f4f6fa] text-[#222226]'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </FilterGroup>

          <FilterGroup label="사진 상태">
            <div className="flex flex-wrap gap-1">
              {PHOTO_STATUS_OPTIONS.map((option) => {
                const active = draft.photoStatus.includes(option.key)
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => togglePhotoStatus(option.key)}
                    aria-pressed={active}
                    className={`flex items-center rounded-2xl px-4 py-[10px] text-[12px] font-medium tracking-[-0.24px] transition-colors ${
                      active
                        ? 'bg-[#222226] text-white'
                        : 'bg-[#f4f6fa] text-[#222226]'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </FilterGroup>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#f4f6fa] text-[18px] font-medium text-[#222226]"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#222226] text-[18px] font-medium text-white"
            >
              적용하기
            </button>
          </div>
        </div>

        <div className="h-8 w-full" />
      </div>
    </div>
  )
}

function FilterGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <p className="px-[10px] py-[10px] text-[14px] font-medium tracking-[-0.28px] text-[#616369]">
        {label}
      </p>
      {children}
    </div>
  )
}
