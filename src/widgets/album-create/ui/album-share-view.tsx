import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

const ALBUM_COVER = '/images/album-cover-sample.png'
const COPY_ICON = '/icons/copy.svg'
const QR_ICON = '/icons/qr.svg'
const SHARE_ICON = '/icons/link.svg'

const QR_RENDER_OPTIONS = {
  errorCorrectionLevel: 'M',
  margin: 1,
  width: 480,
  color: { dark: '#222226', light: '#ffffff' },
} as const

const ALLOWED_SHARE_PROTOCOLS = new Set(['http:', 'https:'])

function safeShareUrl(raw: string): string | null {
  try {
    const url = new URL(raw)
    return ALLOWED_SHARE_PROTOCOLS.has(url.protocol) ? url.toString() : null
  } catch {
    return null
  }
}

function sanitizeFilename(input: string): string {
  const cleaned = input.replace(/[\\/:*?"<>|]+/g, '').trim()
  return cleaned.length > 0 ? cleaned : 'snappy-album'
}

type AlbumShareViewProps = {
  albumName: string
  shareUrl: string
  onGoHome: () => void
}

export function AlbumShareView({
  albumName,
  shareUrl,
  onGoHome,
}: AlbumShareViewProps) {
  const safeUrl = safeShareUrl(shareUrl)
  const [toast, setToast] = useState<string | null>(null)
  const [isSavingQr, setIsSavingQr] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const toastTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!safeUrl) {
      setQrDataUrl(null)
      return
    }
    let cancelled = false
    QRCode.toDataURL(safeUrl, QR_RENDER_OPTIONS)
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl)
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [safeUrl])

  const showToast = (message: string) => {
    setToast(message)
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current)
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null)
      toastTimerRef.current = null
    }, 2000)
  }

  const handleCopy = async () => {
    if (!safeUrl) return
    try {
      await navigator.clipboard.writeText(safeUrl)
      showToast('링크가 복사되었어요')
    } catch {
      showToast('복사에 실패했어요')
    }
  }

  const handleSaveQr = async () => {
    if (isSavingQr) return
    if (!safeUrl) {
      showToast('유효하지 않은 공유 링크예요')
      return
    }
    setIsSavingQr(true)
    try {
      const qrDataUrlForSave = await QRCode.toDataURL(
        safeUrl,
        QR_RENDER_OPTIONS,
      )
      const response = await fetch(qrDataUrlForSave)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `${sanitizeFilename(albumName)}-qr.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
      showToast('QR 이미지를 저장했어요')
    } catch {
      showToast('QR 저장에 실패했어요')
    } finally {
      setIsSavingQr(false)
    }
  }

  const handleShare = async () => {
    if (!safeUrl) return
    const shareData = {
      title: albumName,
      text: `${albumName} 사진 공유 앨범`,
      url: safeUrl,
    }
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        showToast('공유에 실패했어요')
      }
      return
    }
    try {
      await navigator.clipboard.writeText(safeUrl)
      showToast('공유 기능이 지원되지 않아 링크를 복사했어요')
    } catch {
      showToast('공유에 실패했어요')
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
        <div className="relative h-[109px] w-[106px] shrink-0 overflow-hidden bg-white">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`${albumName} 공유 QR 코드`}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-[#a2a5ad]">
              QR 생성 중…
            </div>
          )}
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
        <button
          type="button"
          onClick={handleCopy}
          disabled={!safeUrl}
          className="flex flex-1 flex-col items-center gap-[7px] rounded-2xl bg-[#f4f6fa] py-3 transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <img src={COPY_ICON} alt="" className="h-6 w-6" aria-hidden="true" />
          <span className="text-[10px] text-[#222226]">링크 복사</span>
        </button>
        <button
          type="button"
          onClick={handleSaveQr}
          disabled={isSavingQr}
          className="flex flex-1 flex-col items-center gap-[7px] rounded-2xl bg-[#f4f6fa] py-3 transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <img src={QR_ICON} alt="" className="h-6 w-6" aria-hidden="true" />
          <span className="text-[10px] text-[#222226]">
            {isSavingQr ? '저장 중...' : 'QR 저장'}
          </span>
        </button>
        <button
          type="button"
          onClick={handleShare}
          disabled={!safeUrl}
          className="flex flex-1 flex-col items-center gap-[7px] rounded-2xl bg-[#222226] py-3 transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <img src={SHARE_ICON} alt="" className="h-6 w-6" aria-hidden="true" />
          <span className="text-[10px] text-white">공유하기</span>
        </button>
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={onGoHome}
        className="flex h-[60px] w-full items-center justify-center rounded-2xl bg-[#222226] text-[18px] font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
      >
        홈으로 돌아가기
      </button>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-4"
        >
          <div className="rounded-full bg-[#222226]/95 px-4 py-2 text-[13px] font-medium text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </section>
  )
}
