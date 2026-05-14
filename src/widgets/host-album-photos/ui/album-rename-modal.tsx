import { useState, type ChangeEvent, type FormEvent } from 'react'

const NAME_MAX_LENGTH = 100

type AlbumRenameModalProps = {
  initialName: string
  isSubmitting?: boolean
  errorMessage?: string | null
  onClose: () => void
  onSubmit: (name: string) => void
}

export function AlbumRenameModal({
  initialName,
  isSubmitting = false,
  errorMessage = null,
  onClose,
  onSubmit,
}: AlbumRenameModalProps) {
  const [name, setName] = useState(initialName)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value.slice(0, NAME_MAX_LENGTH))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed === initialName.trim() || isSubmitting) return
    onSubmit(trimmed)
  }

  const isDisabled =
    isSubmitting ||
    name.trim().length === 0 ||
    name.trim() === initialName.trim()

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-rename-title"
      className="fixed inset-0 z-30 mx-auto flex w-full max-w-[402px] items-center justify-center px-5"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full flex-col items-center gap-5 rounded-[18px] bg-white px-4 py-5"
      >
        <h2
          id="album-rename-title"
          className="text-[20px] font-bold leading-normal text-[#222226]"
        >
          앨범 이름 변경
        </h2>

        <div className="flex w-full flex-col gap-[10px] rounded-2xl bg-[#f4f6fa] px-4 pb-4 pt-[10px]">
          <label
            htmlFor="album-rename-input"
            className="text-[14px] font-medium tracking-[-0.28px] text-[#616369]"
          >
            앨범 이름
          </label>
          <input
            id="album-rename-input"
            type="text"
            value={name}
            onChange={handleChange}
            maxLength={NAME_MAX_LENGTH}
            autoFocus
            className="h-[37px] w-full rounded-md bg-white px-[10px] text-[14px] font-medium tracking-[-0.28px] text-[#222226] placeholder:text-[#b7bdc6] focus:outline-none"
          />
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="-mt-2 w-full text-[12px] text-[#e23a3a]"
          >
            {errorMessage}
          </p>
        )}

        <div className="flex w-full items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#f4f6fa] text-[18px] font-medium text-[#222226] disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isDisabled}
            className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#222226] text-[18px] font-medium text-white transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}
