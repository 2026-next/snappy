type AlbumDeleteModalProps = {
  albumName: string
  isSubmitting?: boolean
  errorMessage?: string | null
  onClose: () => void
  onConfirm: () => void
}

export function AlbumDeleteModal({
  albumName,
  isSubmitting = false,
  errorMessage = null,
  onClose,
  onConfirm,
}: AlbumDeleteModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-delete-title"
      className="fixed inset-0 z-30 mx-auto flex w-full max-w-[402px] items-center justify-center px-5"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative flex w-full flex-col items-center gap-5 rounded-[18px] bg-white px-4 py-5">
        <h2
          id="album-delete-title"
          className="text-center text-[20px] font-bold leading-normal text-[#222226]"
        >
          이 앨범을 삭제할까요?
        </h2>
        <p className="text-center text-[14px] leading-[1.5] text-[#616369]">
          <span className="font-medium text-[#222226]">{albumName}</span>
          <br />
          앨범의 모든 사진, 메시지, 그룹이 함께 삭제돼요.
          <br />
          삭제한 앨범은 복구할 수 없어요.
        </p>

        {errorMessage && (
          <p
            role="alert"
            className="w-full text-center text-[12px] text-[#e23a3a]"
          >
            {errorMessage}
          </p>
        )}

        <div className="flex w-full items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#f4f6fa] text-[18px] font-medium text-[#222226] disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#e23a3a] text-[18px] font-medium text-white transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? '삭제 중...' : '삭제하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
