import { useState } from 'react'

type SignupStep = 1 | 2 | 3

const RELATION_ROWS: string[][] = [
  ['부모', '친구', '형제자매', '친척', '직장동료'],
  ['지인', '기타'],
]

interface GuestSignupViewProps {
  onBack: () => void
  onComplete: (name: string, relation: string, password: string) => void
}

export function GuestSignupView({ onBack, onComplete }: GuestSignupViewProps) {
  const [step, setStep] = useState<SignupStep>(1)
  const [name, setName] = useState('')
  const [relation, setRelation] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const passwordMismatch =
    passwordConfirm.length > 0 && password !== passwordConfirm

  const isNextDisabled =
    (step === 1 && name.trim().length === 0) ||
    (step === 2 && relation.length === 0) ||
    (step === 3 &&
      (password.length === 0 ||
        passwordConfirm.length === 0 ||
        password !== passwordConfirm))

  const handleBack = () => {
    if (step === 1) onBack()
    else if (step === 2) setStep(1)
    else setStep(2)
  }

  const handleNext = () => {
    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else if (password === passwordConfirm && password.length > 0) {
      onComplete(name, relation, password)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6fa] text-[#222226]">
      <div className="mx-auto flex w-full max-w-[402px] grow flex-col px-5 pt-6 pb-8">
        <header className="relative flex h-10 items-center justify-center">
          <button
            type="button"
            onClick={handleBack}
            aria-label="뒤로가기"
            className="absolute left-0 flex size-10 items-center justify-center"
          >
            <ChevronLeftIcon />
          </button>
          <span className="text-[20px] font-bold tracking-[-0.4px]">
            참여자 정보 입력
          </span>
        </header>

        <div className="mt-2 flex flex-col items-center">
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-8 bg-[#222226]' : 'w-2 bg-[#b7bdc6]'
                }`}
              />
            ))}
          </div>
          <p className="mt-1 text-center text-[10px] tracking-[-0.2px] text-[#a2a5ad]">
            업로드 전 간단한 정보를 입력해주세요
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2">
          {/* 그룹 1: 이름 + 관계 */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col rounded-[16px] bg-white px-[10px] pt-[10px]">
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

            {step >= 2 && (
              <div className="flex flex-col">
                <div className="flex items-center px-[10px] py-[10px]">
                  <span className="text-[14px] font-medium tracking-[-0.28px] text-[#616369]">
                    주최자와의 관계
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  {RELATION_ROWS.map((row, i) => (
                    <div key={i} className="flex gap-1">
                      {row.map((rel) => (
                        <button
                          key={rel}
                          type="button"
                          onClick={() => setRelation(rel)}
                          className={`rounded-[16px] px-4 py-[10px] text-[12px] font-medium tracking-[-0.24px] ${
                            relation === rel
                              ? 'bg-[#222226] text-white'
                              : 'bg-white text-[#222226]'
                          }`}
                        >
                          {rel}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 그룹 2: 비밀번호 */}
          {step >= 3 && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-col rounded-[16px] bg-white px-[10px] pt-[10px]">
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

              <div className="flex flex-col gap-2">
                <div
                  className={`flex flex-col rounded-[16px] bg-white px-[10px] pt-[10px] ${
                    passwordMismatch ? 'border-[1.5px] border-[#ff3939]' : ''
                  }`}
                >
                  <span className="flex h-[30px] items-center text-[14px] font-medium tracking-[-0.28px] text-[#616369]">
                    비밀번호 확인
                  </span>
                  <div className="pb-[10px] pt-[10px]">
                    <input
                      type="password"
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="4~8자리 비밀번호 입력"
                      className="w-full border-b border-[#b7bdc6] bg-transparent pb-[5px] text-[18px] font-medium tracking-[-0.36px] text-[#222226] outline-none placeholder:text-[#b7bdc6]"
                    />
                  </div>
                </div>
                {passwordMismatch && (
                  <div className="flex items-center gap-[2px]">
                    <DangerCircleIcon />
                    <span className="text-[10px] font-medium tracking-[-0.2px] text-[#ff3939]">
                      비밀번호가 일치하지 않아요
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grow" />

        <button
          type="button"
          onClick={handleNext}
          disabled={isNextDisabled}
          className="flex h-[60px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#222226] text-[18px] font-medium tracking-[-0.36px] text-white disabled:opacity-40"
        >
          <ArrowCircleRightIcon />
          다음
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

function DangerCircleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="6" fill="#ff3939" />
      <path
        d="M6 3.5V6.5"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="6" cy="8.5" r="0.75" fill="white" />
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
