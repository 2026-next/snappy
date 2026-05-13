import {
  CATEGORY_OPTIONS,
  type CategoryKey,
} from '@/widgets/host-album-photos/model/category'

type CategoryTabsProps = {
  selected: CategoryKey
  onSelect: (key: CategoryKey) => void
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="사진 분류"
      className="scrollbar-hide -mx-5 overflow-x-auto px-5"
    >
      <ul className="flex w-max items-center gap-1">
        {CATEGORY_OPTIONS.map((option) => {
          const active = option.key === selected
          return (
            <li key={option.key}>
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelect(option.key)}
                className={`flex items-center rounded-2xl px-3 py-[10px] text-[12px] font-medium tracking-[-0.24px] transition-colors ${
                  active
                    ? 'bg-[#222226] text-[#f4f6fa]'
                    : 'bg-[#f4f6fa] text-[#222226]'
                }`}
              >
                {option.label}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
