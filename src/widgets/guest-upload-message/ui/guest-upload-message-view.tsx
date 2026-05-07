import { useEffect, useState } from 'react'

interface GuestUploadMessageViewProps {
  files: File[]
  onBack: () => void
  onComplete: (message: string) => void
}

export function GuestUploadMessageView({
  files,
  onBack,
  onComplete,
}: GuestUploadMessageViewProps) {
  const [message, setMessage] = useState('')
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [files])

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#222226]">
      <div className="mx-auto flex w-full max-w-[402px] grow flex-col px-5 pt-6 pb-8">
        <header className="relative flex h-10 items-center justify-center">
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로가기"
            className="absolute left-0 flex size-10 items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>
          <span className="text-[20px] font-bold tracking-[-0.4px]">메세지 작성</span>
        </header>

        <div className="mt-2 flex flex-col items-center">
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === 3 ? 'w-8 bg-[#222226]' : 'w-2 bg-[#b7bdc6]'
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-center text-[10px] tracking-[-0.2px] text-[#a2a5ad]">
            사진과 함께 남길 메시지를 적어주세요
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2">
          {/* 선택한 사진 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-[2px]">
                <PhotoIcon />
                <span className="text-[12px] font-semibold tracking-[-0.24px]">선택한 사진</span>
              </div>
              <span className="text-[12px] tracking-[-0.24px] text-[#a2a5ad]">
                총 {files.length}장
              </span>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="text-[12px] tracking-[-0.24px] text-[#a2a5ad] underline"
            >
              사진 수정
            </button>
          </div>

          {/* 사진 가로 스트립 */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {previews.map((src, i) => (
              <div
                key={i}
                className="h-[70px] w-[70px] flex-shrink-0 overflow-hidden rounded-[4px] border border-[#d7dbe2]"
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>

          {/* 메세지 카드 */}
          <div className="flex flex-col gap-[10px] rounded-[16px] bg-[#f4f6fa] px-4 pb-4 pt-[10px]">
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium tracking-[-0.28px] text-[#616369] whitespace-nowrap">
                축하 메세지 작성
              </span>
              <span className="text-[12px] tracking-[-0.24px] text-[#a2a5ad] whitespace-nowrap">
                메세지는 생략해도 괜찮아요
              </span>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="진심을 담은 축하 메시지를 작성해보세요."
              className="h-[120px] w-full resize-none rounded-[6px] bg-white p-[10px] text-[14px] font-medium tracking-[-0.28px] text-[#222226] outline-none placeholder:text-[#b7bdc6]"
            />
          </div>
        </div>

        <div className="grow" />

        <button
          type="button"
          onClick={() => onComplete(message)}
          className="flex h-[60px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#222226] text-[18px] font-medium tracking-[-0.36px] text-white"
        >
          <CheckCircleIcon />
          사진 업로드 완료
        </button>
      </div>
    </div>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M17 7L10 14L17 21"
        stroke="#222226"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <rect x="1.5" y="3.5" width="14" height="10" rx="1.5" stroke="#222226" strokeWidth="1" />
      <circle cx="5.5" cy="7" r="1.5" stroke="#222226" strokeWidth="1" />
      <path
        d="M1.5 12L5.5 8.5L8.5 11.5L11 9.5L15.5 13.5"
        stroke="#222226"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="1.5" />
      <path
        d="M8 12L11 15L16 9"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
