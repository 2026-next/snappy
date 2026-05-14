import { useState } from 'react'

import { SnappyLogo } from '@/shared/ui/snappy-logo'

interface GuestOnboardingViewProps {
  eventName?: string
  eventDate?: string
  thumbnailUrl?: string | null
  isLoading?: boolean
  onUploadStart: () => void
  onViewMyPhotos: () => void
  isHistoryModalOpen?: boolean
  onHistoryModalConfirm?: () => void
}

export function GuestOnboardingView({
  eventName,
  eventDate,
  thumbnailUrl,
  isLoading = false,
  onUploadStart,
  onViewMyPhotos,
  isHistoryModalOpen = false,
  onHistoryModalConfirm,
}: GuestOnboardingViewProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const coverLoaded = !!thumbnailUrl && loadedSrc === thumbnailUrl

  return (
    <div className="relative flex min-h-screen flex-col bg-white text-[#222226]">
      <div className="mx-auto flex w-full max-w-[402px] grow flex-col px-5 pt-6 pb-8">
        <header className="flex h-10 items-center justify-center">
          <SnappyLogo />
        </header>

        <main className="grow">
          <section className="mt-10 flex flex-col items-center gap-2">
            <div className="relative size-[140px] overflow-hidden rounded-[26.667px] bg-[#e6e8ee]">
              {(!thumbnailUrl || !coverLoaded) && (
                <div
                  aria-hidden="true"
                  className="shimmer absolute inset-0 h-full w-full"
                />
              )}
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt=""
                  onLoad={() => setLoadedSrc(thumbnailUrl)}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
                    coverLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              )}
            </div>
            <div className="flex w-full flex-col items-center">
              {isLoading ? (
                <div className="my-2.5 h-6 w-48 animate-pulse rounded-md bg-[#e8eaed]" />
              ) : (
                <p className="px-2.5 py-2.5 text-center text-[18px] font-medium tracking-[-0.36px]">
                  {eventName ?? ''}
                </p>
              )}
              <p className="pb-2.5 text-center text-[14px] tracking-[-0.28px] text-[#a2a5ad]">
                촬영하신 사진을 자유롭게 업로드해주세요
              </p>
            </div>
          </section>

          <section className="mt-12 flex flex-col gap-2">
            <div className="flex items-center gap-0.5 px-5">
              <InfoCircleIcon />
              <span className="text-[12px] font-semibold tracking-[-0.24px]">
                업로드 안내
              </span>
            </div>
            <div className="flex flex-col gap-1 text-[10px] tracking-[-0.2px]">
              <div className="flex flex-col gap-2 rounded-[16px] bg-[#f4f6fa] px-5 py-3">
                <p>• 직접 촬영한 사진을 업로드할 수 있어요</p>
                <p>• 여러 장을 한 번에 업로드할 수 있어요</p>
                <p>• 업로드한 사진은 소중히 보관합니다</p>
              </div>
              <div className="flex flex-col gap-2 rounded-[16px] bg-[#f4f6fa] px-5 py-3">
                <div className="flex gap-3">
                  <span className="w-16 text-[#616369]">이벤트 날짜</span>
                  {isLoading ? (
                    <div className="h-4 w-24 animate-pulse rounded bg-[#e8eaed]" />
                  ) : (
                    <span>{eventDate ?? '-'}</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <span className="w-16 text-[#616369]">지원 형식</span>
                  <span>JPG, PNG, HEIC</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer>
          <p className="py-2.5 text-center text-[10px] tracking-[-0.2px] text-[#a2a5ad] whitespace-nowrap">
            내 사진을 수정하거나 삭제하려면 업로드 시 설정한 비밀번호가 필요해요
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onUploadStart}
              className="h-[60px] w-full rounded-[16px] bg-[#222226] text-[18px] font-semibold tracking-[-0.36px] text-white"
            >
              사진 업로드 시작
            </button>
            <button
              type="button"
              onClick={onViewMyPhotos}
              className="h-[60px] w-full rounded-[16px] bg-[#f4f6fa] text-[18px] font-semibold tracking-[-0.36px] text-[#222226]"
            >
              내가 올린 사진 보기
            </button>
          </div>
        </footer>
      </div>

      {isHistoryModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="history-modal-title"
          className="fixed inset-0 z-30 mx-auto flex w-full max-w-[402px] items-center justify-center px-5"
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative flex w-full flex-col items-center gap-5 rounded-[18px] bg-white px-4 py-5">
            <h2
              id="history-modal-title"
              className="text-[20px] font-bold leading-normal text-[#222226]"
            >
              사진 업로드 이력이 있어요
            </h2>
            <p className="text-center text-[14px] leading-[1.5] text-[#616369]">
              내가 올린 사진 페이지로 이동할게요.{' '}
              <br />
              사진은 이동 후에도 추가로 업로드할 수 있어요.
            </p>
            <button
              type="button"
              onClick={onHistoryModalConfirm}
              className="h-11 w-full rounded-[16px] bg-[#222226] text-[18px] font-medium text-white"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoCircleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <circle cx="8.5" cy="8.5" r="7.75" stroke="#222226" strokeWidth="0.5" />
      <path
        d="M8.5 7.5V12"
        stroke="#222226"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="8.5" cy="5.5" r="0.75" fill="#222226" />
    </svg>
  )
}
