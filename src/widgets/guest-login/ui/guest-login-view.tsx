import { useState } from 'react'

interface GuestLoginViewProps {
  onBack: () => void
  onSubmit: (name: string, password: string) => Promise<boolean>
  onCreateAccount: () => void
}

export function GuestLoginView({
  onBack,
  onSubmit,
  onCreateAccount,
}: GuestLoginViewProps) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)

  const handleSubmit = async () => {
    const success = await onSubmit(name, password)
    if (!success) {
      setIsErrorModalOpen(true)
    }
  }

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
          <span className="text-[20px] font-bold tracking-[-0.4px]">로그인</span>
        </header>

        <section className="mt-[86px] flex flex-col items-center gap-3">
          <div className="flex size-[74px] items-center justify-center rounded-full bg-[#212121]">
            <LockIcon />
          </div>
          <div className="flex w-full flex-col items-center">
            <p className="py-2.5 text-center text-[18px] font-medium tracking-[-0.36px]">
              비밀번호를 입력해주세요
            </p>
            <p className="pb-2.5 text-center text-[14px] tracking-[-0.28px] text-[#a2a5ad] whitespace-nowrap">
              업로드할 때 설정한 비밀번호로 내가 올린 사진을 확인할 수 있어요
            </p>
          </div>
        </section>

        <section className="mt-12 flex flex-col gap-2">
          <div className="flex flex-col rounded-[16px] bg-[#f4f6fa] px-[10px] pt-[10px]">
            <span className="flex h-[30px] items-center text-[14px] font-medium tracking-[-0.28px] text-[#616369]">
              이름
            </span>
            <div className="pb-[10px] pt-[10px]">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="실명을 입력해주세요"
                className="w-full border-b border-[#b7bdc6] bg-transparent pb-[5px] text-[18px] font-medium tracking-[-0.36px] text-[#222226] outline-none placeholder:text-[#b7bdc6]"
              />
            </div>
          </div>
          <div className="flex flex-col rounded-[16px] bg-[#f4f6fa] px-[10px] pt-[10px]">
            <span className="flex h-[30px] items-center text-[14px] font-medium tracking-[-0.28px] text-[#616369]">
              비밀번호
            </span>
            <div className="pb-[10px] pt-[10px]">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="4~8자리 비밀번호 입력"
                className="w-full border-b border-[#b7bdc6] bg-transparent pb-[5px] text-[18px] font-medium tracking-[-0.36px] text-[#222226] outline-none placeholder:text-[#b7bdc6]"
              />
            </div>
          </div>
        </section>

        <div className="grow" />

        <button
          type="button"
          onClick={handleSubmit}
          className="flex h-[60px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#222226] text-[18px] font-medium tracking-[-0.36px] text-white"
        >
          <ArrowCircleRightIcon />
          다음
        </button>
      </div>

      {isErrorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="flex w-full max-w-[362px] flex-col items-center gap-5 rounded-[18px] bg-white px-4 py-5">
            <p className="max-w-[280px] text-center text-[20px] font-bold tracking-[-0.4px] text-[#222226]">
              일치하는 정보가 없습니다
            </p>
            <p className="max-w-[280px] text-center text-[14px] leading-[1.5] text-[#616369]">
              입력하신 이름 또는 비밀번호가 일치하지 않아요.
              <br />
              처음 이용하시는 경우 계정을 먼저 만들어 주세요.
            </p>
            <div className="flex w-full gap-4">
              <button
                type="button"
                onClick={() => setIsErrorModalOpen(false)}
                className="h-[44px] flex-1 rounded-[16px] bg-[#f4f6fa] text-[18px] font-medium text-[#222226]"
              >
                다시 입력
              </button>
              <button
                type="button"
                onClick={onCreateAccount}
                className="h-[44px] flex-1 rounded-[16px] bg-[#222226] text-[18px] font-medium text-white"
              >
                계정 만들기
              </button>
            </div>
          </div>
        </div>
      )}
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

function LockIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
      <path
        d="M16 26V16Q16 6 27 6Q38 6 38 16V26"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="8" y="26" width="38" height="22" rx="5" stroke="white" strokeWidth="3" />
      <circle cx="27" cy="35" r="3.5" stroke="white" strokeWidth="2.5" />
      <path d="M27 38.5V43" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function ArrowCircleRightIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" stroke="white" strokeWidth="1.5" />
      <path
        d="M10.5 8.5L14.5 12L10.5 15.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
