import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { type PhotoDetail, getPhotoDetail } from '@/shared/api/photo'

const CHEVRON_RIGHT = '/icons/chevron-right.svg'
const DOWNLOAD_ICON = '/icons/download.svg'

const HEADER_TITLE = '사진 저장하기'
const POLAROID_FONT = "'THEFACESHOP INKLIPQUID', cursive"

type SaveTab = 'polaroid' | 'plain'

function formatTakenDate(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`
}

class PolaroidCorsError extends Error {
  constructor() {
    super(
      '폴라로이드 합성을 위해 이미지 저장소(GCS) CORS 설정이 필요해요. 백엔드에 문의해주세요.',
    )
    this.name = 'PolaroidCorsError'
  }
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new PolaroidCorsError())
    img.src = src
  })
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

async function downloadPlain(src: string, filename: string): Promise<void> {
  try {
    const res = await fetch(src)
    if (!res.ok) throw new Error(`이미지를 불러오지 못했어요 (상태 코드 ${res.status})`)
    const blob = await res.blob()
    triggerDownload(blob, filename)
  } catch {
    const anchor = document.createElement('a')
    anchor.href = src
    anchor.download = filename
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }
}

type PolaroidOptions = {
  showMessage: boolean
  showUploader: boolean
  showTakenAt: boolean
  message: string
  uploaderName: string
  takenAtLabel: string
}

async function downloadPolaroid(
  src: string,
  options: PolaroidOptions,
  filename: string,
): Promise<void> {
  const img = await loadImage(src)
  const canvas = document.createElement('canvas')
  const targetWidth = 1200
  const photoRatio = img.naturalHeight === 0 ? 0.75 : img.naturalHeight / img.naturalWidth
  const photoWidth = targetWidth - 112
  const photoHeight = Math.round(photoWidth * photoRatio)

  const captionLines: string[] = []
  if (options.showMessage && options.message) captionLines.push(options.message)
  if (options.showUploader && options.uploaderName) {
    captionLines.push(`From. ${options.uploaderName}`)
  }
  if (options.showTakenAt && options.takenAtLabel) {
    captionLines.push(options.takenAtLabel)
  }
  const captionLineHeight = 64
  const captionPaddingTop = captionLines.length > 0 ? 32 : 0
  const captionPaddingBottom = captionLines.length > 0 ? 56 : 56
  const captionAreaHeight =
    captionLines.length === 0
      ? 56
      : captionPaddingTop +
        captionLines.length * captionLineHeight +
        captionPaddingBottom

  const totalHeight = 56 + photoHeight + captionAreaHeight
  canvas.width = targetWidth
  canvas.height = totalHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('이미지 합성을 준비하지 못했어요')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.drawImage(img, 56, 56, photoWidth, photoHeight)

  if (captionLines.length > 0) {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    let y = 56 + photoHeight + captionPaddingTop + captionLineHeight / 2
    captionLines.forEach((line, index) => {
      const isMessage = index === 0 && options.showMessage && options.message
      ctx.fillStyle = isMessage ? '#222226' : '#878787'
      const fontSize = isMessage ? 56 : 44
      ctx.font = `${fontSize}px ${POLAROID_FONT}, sans-serif`
      ctx.fillText(line, canvas.width / 2, y)
      y += captionLineHeight
    })
  }

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('이미지를 만들지 못했어요'))
      triggerDownload(blob, filename)
      resolve()
    }, 'image/png')
  })
}

export function PhotoSaveView() {
  const navigate = useNavigate()
  const { photoId } = useParams<{ photoId: string }>()

  const [photo, setPhoto] = useState<PhotoDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<SaveTab>('polaroid')
  const [showMessage, setShowMessage] = useState(true)
  const [showUploader, setShowUploader] = useState(true)
  // "촬영 날짜 보이기" toggle is hidden from the UI until the underlying
  // taken-at rendering is fixed; the state is pinned to false so the preview
  // and bake paths simply skip it.
  const showTakenAt = false
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (!photoId) return
    cancelledRef.current = false
    setIsLoading(true)
    setError(null)
    setImgLoaded(false)
    getPhotoDetail(photoId)
      .then((detail) => {
        if (!cancelledRef.current) setPhoto(detail)
      })
      .catch((err: unknown) => {
        if (!cancelledRef.current) {
          setError(err instanceof Error ? err.message : '사진을 불러오지 못했어요')
        }
      })
      .finally(() => {
        if (!cancelledRef.current) setIsLoading(false)
      })
    return () => {
      cancelledRef.current = true
    }
  }, [photoId])

  const photoSrc = photo?.url ?? photo?.thumbnailUrl ?? null
  const message = photo?.message ?? ''
  const uploaderName = photo?.uploaderName ?? ''
  const takenAtLabel = useMemo(
    () => formatTakenDate(photo?.takenAt ?? null),
    [photo?.takenAt],
  )

  const handleBack = () => navigate(-1)

  const handleSave = async () => {
    if (isSaving) return
    if (!photo || !photoSrc) {
      setError('저장할 사진을 불러오지 못했어요')
      return
    }
    if (tab === 'polaroid' && !imgLoaded) {
      setError('사진이 아직 로딩 중이에요. 잠시 후 다시 시도해주세요.')
      return
    }
    setIsSaving(true)
    setError(null)
    const filename = `snappy-${photo.id}-${tab}.${tab === 'polaroid' ? 'png' : 'jpg'}`
    try {
      if (tab === 'polaroid') {
        await downloadPolaroid(
          photoSrc,
          {
            showMessage,
            showUploader,
            showTakenAt,
            message,
            uploaderName,
            takenAtLabel,
          },
          filename,
        )
      } else {
        await downloadPlain(photoSrc, filename)
      }
      setIsCompleteModalOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '사진 저장에 실패했어요')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGoHome = () => {
    setIsCompleteModalOpen(false)
    navigate('/')
  }
  const handleGoBack = () => {
    setIsCompleteModalOpen(false)
    navigate(-1)
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-[#f4f6fa]">
      <header className="relative flex h-[60px] items-center justify-center px-5">
        <button
          type="button"
          onClick={handleBack}
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
          {HEADER_TITLE}
        </h1>
      </header>

      <div className="flex justify-center pt-3">
        <div
          role="tablist"
          aria-label="저장 형식"
          className="flex items-center gap-2 rounded-2xl bg-white p-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'polaroid'}
            onClick={() => setTab('polaroid')}
            className={[
              'flex h-7 w-[120px] items-center justify-center rounded-lg px-[10px] text-[14px] font-medium',
              tab === 'polaroid'
                ? 'bg-[#d7dbe2] text-[#222226]'
                : 'bg-white text-[#616369]',
            ].join(' ')}
          >
            폴라로이드
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'plain'}
            onClick={() => setTab('plain')}
            className={[
              'flex h-7 w-[120px] items-center justify-center rounded-lg px-[10px] text-[14px] font-medium',
              tab === 'plain'
                ? 'bg-[#d7dbe2] text-[#222226]'
                : 'bg-white text-[#616369]',
            ].join(' ')}
          >
            일반 사진
          </button>
        </div>
      </div>

      {error && (
        <p className="px-5 pt-2 text-center text-[12px] text-[#e23a3a]">
          {error}
        </p>
      )}

      {tab === 'polaroid' ? (
        <div className="mt-6 flex flex-col items-center gap-6 px-5">
          <div
            className="flex w-full flex-col items-center justify-center gap-[10px] bg-white p-[14px]"
            style={{ filter: 'drop-shadow(0px 4px 5px rgba(0,0,0,0.15))' }}
          >
            <div className="relative w-full overflow-hidden bg-[#e6e8ee]">
              {!imgLoaded && (
                <div
                  aria-hidden="true"
                  className="shimmer aspect-[4/3] w-full"
                />
              )}
              {photoSrc && (
                <img
                  src={photoSrc}
                  alt=""
                  onLoad={() => setImgLoaded(true)}
                  className={`block h-auto w-full transition-opacity duration-200 ${
                    imgLoaded ? 'opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-1 py-[4px]">
              {showMessage && message && (
                <p
                  className="text-[24px] leading-[1.4] text-[#222226]"
                  style={{ fontFamily: POLAROID_FONT }}
                >
                  {message}
                </p>
              )}
              {showUploader && uploaderName && (
                <p
                  className="text-[20px] leading-[1.4] text-[#878787]"
                  style={{ fontFamily: POLAROID_FONT }}
                >
                  From. {uploaderName}
                </p>
              )}
              {showTakenAt && takenAtLabel && (
                <p
                  className="text-[20px] leading-[1.4] text-[#878787]"
                  style={{ fontFamily: POLAROID_FONT }}
                >
                  {takenAtLabel}
                </p>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col items-center p-[10px]">
            <div className="flex w-[289px] flex-col items-start gap-5">
              <ToggleRow
                label="축하 메세지 보이기"
                checked={showMessage}
                onChange={setShowMessage}
              />
              <ToggleRow
                label="업로더 이름 보이기"
                checked={showUploader}
                onChange={setShowUploader}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center px-5">
          <div className="relative w-full overflow-hidden bg-[#e6e8ee]">
            {!imgLoaded && (
              <div
                aria-hidden="true"
                className="shimmer aspect-[4/3] w-full"
              />
            )}
            {photoSrc && (
              <img
                src={photoSrc}
                alt=""
                onLoad={() => setImgLoaded(true)}
                className={`block h-auto w-full transition-opacity duration-200 ${
                  imgLoaded ? 'opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      )}

      <div className="mt-auto px-5 pb-5 pt-6">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoading || !photo}
          className="flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-[#222226] text-[18px] font-medium text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
        >
          <img
            src={DOWNLOAD_ICON}
            alt=""
            className="h-6 w-6 [filter:invert(1)]"
            aria-hidden="true"
          />
          {isSaving ? '저장 중...' : '갤러리에 저장하기'}
        </button>
      </div>

      {isCompleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-save-complete-title"
          className="fixed inset-0 z-30 mx-auto flex w-full max-w-[402px] items-center justify-center px-5"
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setIsCompleteModalOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative flex w-full flex-col items-center gap-5 rounded-[18px] bg-white px-4 py-5">
            <h2
              id="photo-save-complete-title"
              className="text-[20px] font-bold leading-normal text-[#222226]"
            >
              사진 저장이 완료되었습니다
            </h2>
            <p className="text-center text-[14px] leading-[1.5] text-[#616369]">
              선택한 사진이 갤러리에 저장되었어요.
              <br />
              계속해서 사진을 확인하거나 홈으로 이동해보세요.
            </p>
            <div className="flex w-full items-center gap-4">
              <button
                type="button"
                onClick={handleGoHome}
                className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#f4f6fa] text-[18px] font-medium text-[#222226]"
              >
                홈으로 가기
              </button>
              <button
                type="button"
                onClick={handleGoBack}
                className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#222226] text-[18px] font-medium text-white"
              >
                이전으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

type ToggleRowProps = {
  label: string
  checked: boolean
  onChange: (next: boolean) => void
}

function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <p className="text-[14px] font-semibold text-black">{label}</p>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-[26px] w-[48px] rounded-full transition-colors',
          checked ? 'bg-[#222226]' : 'bg-[#d7dbe2]',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-[3px] h-5 w-5 rounded-full bg-white transition-all',
            checked ? 'left-[25px]' : 'left-[3px]',
          ].join(' ')}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}
