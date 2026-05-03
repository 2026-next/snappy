import { useState, type ChangeEvent, type FormEvent } from 'react'

const NAME_MAX_LENGTH = 30

type GroupCreateModalProps = {
  onClose: () => void
  onCreate: (name: string) => void
}

export function GroupCreateModal({ onClose, onCreate }: GroupCreateModalProps) {
  const [name, setName] = useState('')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value.slice(0, NAME_MAX_LENGTH))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onCreate(name.trim())
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-create-title"
      className="absolute inset-0 z-30 flex items-center justify-center px-5"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full max-w-[362px] flex-col items-center gap-5 rounded-[18px] bg-white px-4 py-5"
      >
        <h2
          id="group-create-title"
          className="text-[20px] font-bold leading-normal text-[#222226]"
        >
          사진 그룹 만들기
        </h2>

        <div className="flex w-full flex-col gap-[10px] rounded-2xl bg-[#f4f6fa] px-4 pb-4 pt-[10px]">
          <label
            htmlFor="group-name"
            className="text-[14px] font-medium tracking-[-0.28px] text-[#616369]"
          >
            그룹 이름
          </label>
          <input
            id="group-name"
            type="text"
            value={name}
            onChange={handleChange}
            maxLength={NAME_MAX_LENGTH}
            placeholder="예: 가족 사진 / 친구 단체샷 / 베스트컷"
            autoFocus
            className="h-[37px] w-full rounded-md bg-white px-[10px] text-[14px] font-medium tracking-[-0.28px] text-[#222226] placeholder:text-[#b7bdc6] focus:outline-none"
          />
        </div>

        <div className="flex w-full items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#f4f6fa] text-[18px] font-medium text-[#222226]"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={name.trim().length === 0}
            className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#222226] text-[18px] font-medium text-white transition-opacity disabled:opacity-50"
          >
            그룹 생성
          </button>
        </div>
      </form>
    </div>
  )
}
