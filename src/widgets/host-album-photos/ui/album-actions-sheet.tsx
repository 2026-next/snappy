type AlbumActionsSheetProps = {
  onRename: () => void
  onDelete: () => void
  onClose: () => void
}

export function AlbumActionsSheet({
  onRename,
  onDelete,
  onClose,
}: AlbumActionsSheetProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="앨범 관리"
      className="fixed inset-0 z-30 mx-auto flex w-full max-w-[402px] flex-col justify-end"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex w-full flex-col gap-2 rounded-t-2xl bg-white px-5 pb-6 pt-3">
        <div className="flex justify-center pt-1">
          <span aria-hidden="true" className="h-1 w-10 rounded-full bg-[#d7dbe2]" />
        </div>
        <button
          type="button"
          onClick={onRename}
          className="flex h-12 w-full items-center justify-start rounded-xl px-3 text-[16px] font-medium text-[#222226] transition-colors hover:bg-[#f4f6fa]"
        >
          앨범 이름 변경
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-12 w-full items-center justify-start rounded-xl px-3 text-[16px] font-medium text-[#e23a3a] transition-colors hover:bg-[#fdecec]"
        >
          앨범 삭제
        </button>
      </div>
    </div>
  )
}
