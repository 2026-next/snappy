type EmptyStateProps = {
  onSendShareLink: () => void
}

export function EmptyState({ onSendShareLink }: EmptyStateProps) {
  return (
    <section className="flex w-full flex-col items-center gap-3 rounded-2xl bg-[#f4f6fa] px-5 py-5 text-center">
      <h2 className="text-[20px] font-bold leading-normal text-[#222226]">
        아직 업로드된 사진이 없어요
      </h2>
      <p className="text-[14px] leading-normal text-[#616369]">
        하객에게 링크를 공유해 사진을 받아보세요
      </p>
      <button
        type="button"
        onClick={onSendShareLink}
        className="flex h-11 w-[200px] items-center justify-center rounded-2xl bg-[#2a2c32] text-[18px] font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
      >
        앨범 공유 링크 보내기
      </button>
    </section>
  )
}
