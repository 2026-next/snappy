import { useState } from 'react'

import {
  DEFAULT_SORT,
  SORT_OPTIONS,
  type SortKey,
} from '@/widgets/host-album-photos/model/sort'

type SortSheetProps = {
  initialValue: SortKey
  onClose: () => void
  onApply: (value: SortKey) => void
}

export function SortSheet({
  initialValue,
  onClose,
  onApply,
}: SortSheetProps) {
  const [draft, setDraft] = useState<SortKey>(initialValue)

  const handleReset = () => {
    setDraft(DEFAULT_SORT)
    onApply(DEFAULT_SORT)
  }
  const handleApply = () => onApply(draft)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="정렬 기준"
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
            정렬 기준
          </h2>
        </div>

        <div className="flex flex-col gap-5 px-5 pb-5">
          <ul role="radiogroup" className="flex flex-col gap-2 px-[10px] pt-[10px]">
            {SORT_OPTIONS.map((option) => {
              const active = option.key === draft
              return (
                <li key={option.key}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setDraft(option.key)}
                    className="flex items-center gap-[9px]"
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        active
                          ? 'border-[#222226] bg-[#222226]'
                          : 'border-[#d7dbe2] bg-white'
                      }`}
                    />
                    <span className="text-[12px] font-medium tracking-[-0.24px] text-[#222226]">
                      {option.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

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
