const CHEVRON_RIGHT = '/icons/chevron-right.svg'
const SHARE_ICON = '/icons/link.svg'

type AlbumPhotosHeaderProps = {
  title: string
  onBack: () => void
  onShare: () => void
}

export function AlbumPhotosHeader({
  title,
  onBack,
  onShare,
}: AlbumPhotosHeaderProps) {
  return (
    <header className="relative flex h-[60px] items-center justify-center px-5">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로 가기"
        className="absolute left-5 flex h-10 w-10 items-center justify-center"
      >
        <img
          src={CHEVRON_RIGHT}
          alt=""
          className="h-[15.67px] w-[8.67px] -scale-x-100"
          aria-hidden="true"
        />
      </button>

      <h1 className="text-[20px] font-bold tracking-[-0.4px] text-[#222226]">
        {title}
      </h1>

      <button
        type="button"
        onClick={onShare}
        aria-label="앨범 공유"
        className="absolute right-5 flex h-10 w-10 items-center justify-center"
      >
        <img
          src={SHARE_ICON}
          alt=""
          className="h-6 w-6"
          style={{ filter: 'brightness(0)' }}
          aria-hidden="true"
        />
      </button>
    </header>
  )
}
