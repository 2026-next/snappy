type EmptyStateVariant = 'no-photos' | 'no-favorites'

type EmptyStateProps = {
  variant?: EmptyStateVariant
  onSendShareLink?: () => void
}

export function EmptyState({
  variant = 'no-photos',
  onSendShareLink,
}: EmptyStateProps) {
  if (variant === 'no-favorites') {
    return (
      <section className="flex w-full flex-col items-center gap-3 rounded-2xl bg-[#f4f6fa] px-5 py-5 text-center">
        <h2 className="text-[14px] font-medium leading-normal text-[#222226]">
          아직 즐겨찾기 한 사진이 없어요
        </h2>
        <p className="text-[12px] leading-normal text-[#a2a5ad]">
          마음에 드는 사진의 하트를 눌러 즐겨찾기에 추가해보세요
        </p>
      </section>
    )
  }

  return (
    <section className="flex w-full flex-col items-center gap-3 rounded-2xl bg-[#f4f6fa] px-5 py-5 text-center">
      <h2 className="text-[14px] font-medium leading-normal text-[#222226]">
        아직 업로드된 사진이 없어요
      </h2>
      <p className="text-[12px] leading-normal text-[#a2a5ad]">
        하객에게 링크를 공유해 사진을 받아보세요
      </p>
      <button
        type="button"
        onClick={onSendShareLink}
        className="mt-1 flex h-11 items-center justify-center rounded-2xl bg-[#222226] px-5 text-[14px] font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
      >
        앨범 공유 링크 보내기
      </button>
    </section>
  )
}
