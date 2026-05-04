const TRASH_ICON = '/icons/trash.svg'
const PLUS_CIRCLE = '/icons/plus-circle.svg'

type SelectionActionBarProps = {
  selectedCount: number
  showAddToGroup?: boolean
  onDelete: () => void
  onAddToGroup?: () => void
}

export function SelectionActionBar({
  selectedCount,
  showAddToGroup = true,
  onDelete,
  onAddToGroup,
}: SelectionActionBarProps) {
  const hasSelection = selectedCount > 0

  return (
    <div className="flex w-full items-center gap-[10px]">
      <button
        type="button"
        onClick={onDelete}
        disabled={!hasSelection}
        className={`flex h-[60px] items-center justify-center gap-2 rounded-2xl text-[18px] font-medium transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 ${
          showAddToGroup
            ? 'flex-1 bg-[#f4f6fa] text-[#222226]'
            : 'w-full bg-[#222226] text-white'
        }`}
      >
        <img
          src={TRASH_ICON}
          alt=""
          className={`h-6 w-6 ${showAddToGroup ? '' : 'invert'}`}
          aria-hidden="true"
        />
        {selectedCount}개 사진 삭제
      </button>
      {showAddToGroup && onAddToGroup ? (
        <button
          type="button"
          onClick={onAddToGroup}
          disabled={!hasSelection}
          className="flex h-[60px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#222226] text-[18px] font-medium text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
        >
          <img
            src={PLUS_CIRCLE}
            alt=""
            className="h-6 w-6"
            aria-hidden="true"
          />
          그룹에 추가
        </button>
      ) : null}
    </div>
  )
}
