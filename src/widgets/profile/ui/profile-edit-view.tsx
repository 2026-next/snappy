import { useState, type FormEvent } from 'react'

interface ProfileEditViewProps {
  initialName: string
  isSaving: boolean
  errorMessage: string | null
  successMessage: string | null
  onBack: () => void
  onSubmit: (name: string) => Promise<void> | void
}

const MAX_NAME_LENGTH = 50

export function ProfileEditView({
  initialName,
  isSaving,
  errorMessage,
  successMessage,
  onBack,
  onSubmit,
}: ProfileEditViewProps) {
  const [name, setName] = useState(initialName)

  const trimmed = name.trim()
  const canSubmit =
    !isSaving && trimmed.length > 0 && trimmed.length <= MAX_NAME_LENGTH && trimmed !== initialName

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return
    void onSubmit(trimmed)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-white px-5 pt-6 pb-8 text-[#222226]">
      <header className="relative flex h-10 items-center justify-center">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="absolute left-0 flex size-10 items-center justify-center"
        >
          <ChevronLeftIcon />
        </button>
        <span className="text-[20px] font-bold tracking-[-0.4px]">프로필 수정</span>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-semibold tracking-[-0.24px] text-[#616369]">
            이름
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSaving}
            maxLength={MAX_NAME_LENGTH}
            placeholder="이름을 입력해주세요"
            className="h-[48px] w-full rounded-[12px] bg-[#f4f6fa] px-4 text-[14px] font-medium tracking-[-0.28px] text-[#222226] outline-none placeholder:text-[#b7bdc6] disabled:opacity-60"
          />
          <span className="self-end text-[10px] tracking-[-0.2px] text-[#a2a5ad]">
            {name.length} / {MAX_NAME_LENGTH}
          </span>
        </label>

        {errorMessage && (
          <p
            role="alert"
            className="text-center text-[12px] tracking-[-0.24px] text-[#e23a3a]"
          >
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p
            role="status"
            className="text-center text-[12px] tracking-[-0.24px] text-[#2c8a4a]"
          >
            {successMessage}
          </p>
        )}

        <div className="grow" />

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex h-[60px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#222226] text-[18px] font-medium tracking-[-0.36px] text-white disabled:opacity-50"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </form>
    </main>
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
