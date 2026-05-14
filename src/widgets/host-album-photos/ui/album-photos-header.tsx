const CHEVRON_RIGHT = '/icons/chevron-right.svg'

type AlbumPhotosHeaderProps = {
  title: string
  onBack: () => void
  onShare: () => void
  onMore?: () => void
}

export function AlbumPhotosHeader({
  title,
  onBack,
  onShare,
  onMore,
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

      <div className="absolute right-3 flex items-center text-[#222226]">
        <button
          type="button"
          onClick={onShare}
          aria-label="앨범 공유"
          className="flex h-10 w-10 items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            fill="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h120v80H240v400h480v-400H600v-80h120q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm200-240v-447l-64 64-56-57 160-160 160 160-56 57-64-64v447h-80Z" />
          </svg>
        </button>
        {onMore && (
          <button
            type="button"
            onClick={onMore}
            aria-label="앨범 더보기"
            className="flex h-10 w-10 items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z" />
            </svg>
          </button>
        )}
      </div>
    </header>
  )
}
