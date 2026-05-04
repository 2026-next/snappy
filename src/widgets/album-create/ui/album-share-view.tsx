const ALBUM_COVER = '/images/album-cover-sample.png'
const QR_SAMPLE = '/images/qr-sample.png'
const COPY_ICON = '/icons/copy.svg'
const QR_ICON = '/icons/qr.svg'
const KAKAO_TALK_ICON = '/icons/kakao-talk.svg'
const INSTAGRAM_ICON = '/icons/instagram.svg'

const ALLOWED_SHARE_PROTOCOLS = new Set(['http:', 'https:'])

function safeShareUrl(raw: string): string | null {
  try {
    const url = new URL(raw)
    return ALLOWED_SHARE_PROTOCOLS.has(url.protocol) ? url.toString() : null
  } catch {
    return null
  }
}

type AlbumShareViewProps = {
  albumName: string
  shareUrl: string
  onGoHome: () => void
}

type ShareAction = {
  key: string
  label: string
  icon: string
}

const SHARE_ACTIONS: ShareAction[] = [
  { key: 'copy', label: '링크 복사', icon: COPY_ICON },
  { key: 'qr', label: 'QR 저장', icon: QR_ICON },
  { key: 'kakao', label: '카카오톡', icon: KAKAO_TALK_ICON },
  { key: 'instagram', label: '인스타그램', icon: INSTAGRAM_ICON },
]

export function AlbumShareView({
  albumName,
  shareUrl,
  onGoHome,
}: AlbumShareViewProps) {
  const safeUrl = safeShareUrl(shareUrl)

  const handleCopy = async () => {
    if (!safeUrl) return
    try {
      await navigator.clipboard.writeText(safeUrl)
    } catch {
      // Clipboard may be unavailable (insecure context, denied permission)
    }
  }

  return (
    <section className="relative flex flex-1 flex-col items-stretch px-5 pb-6">
      <div className="mt-[86px] flex justify-center">
        <div className="relative h-[140px] w-[140px] overflow-hidden rounded-[26.67px] bg-[#a2a5ad]">
          <img
            src={ALBUM_COVER}
            alt=""
            className="absolute left-[-18.95%] top-[-44.53%] h-[204%] w-[137.91%] max-w-none"
          />
        </div>
      </div>

      <h2 className="mt-[26px] text-center text-[18px] font-medium text-[#222226]">
        {albumName}
      </h2>

      <div className="mt-[40px] flex items-center gap-2">
        <div className="relative h-[109px] w-[106px] shrink-0 overflow-hidden">
          <img
            src={QR_SAMPLE}
            alt={`${albumName} 공유 QR 코드`}
            className="absolute left-0 top-[-22.29%] h-[135.67%] w-[281.7%] max-w-none"
          />
        </div>
        <div className="flex flex-col">
          <p className="px-[10px] py-[4px] text-[12px] text-[#616369]">
            링크가 생성되었어요!
          </p>
          {safeUrl ? (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all px-[10px] py-[4px] text-[12px] text-[#6691e8] underline-offset-2 hover:underline"
            >
              {safeUrl}
            </a>
          ) : (
            <span className="px-[10px] py-[4px] text-[12px] text-[#c0392b]">
              유효하지 않은 공유 링크예요.
            </span>
          )}
        </div>
      </div>

      <div className="mt-[10px] flex items-center gap-2">
        {SHARE_ACTIONS.map((action) => {
          const isCopy = action.key === 'copy'
          const disabled = isCopy && !safeUrl
          return (
            <button
              key={action.key}
              type="button"
              onClick={isCopy ? handleCopy : undefined}
              disabled={disabled}
              className="flex flex-1 flex-col items-center gap-[7px] rounded-2xl bg-[#f4f6fa] py-3 transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <img
                src={action.icon}
                alt=""
                className="h-6 w-6"
                aria-hidden="true"
              />
              <span className="text-[10px] text-[#222226]">{action.label}</span>
            </button>
          )
        })}
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={onGoHome}
        className="flex h-[60px] w-full items-center justify-center rounded-2xl bg-[#222226] text-[18px] font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
      >
        홈으로 돌아가기
      </button>
    </section>
  )
}
