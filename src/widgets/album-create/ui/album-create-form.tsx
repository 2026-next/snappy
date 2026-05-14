import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'

import type { CreateEventInput } from '@/shared/api/event'

const LINK_ICON = '/icons/link.svg'

const NAME_MAX_LENGTH = 30

const toLocalIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type AlbumCreateFormProps = {
  onCreate: (input: CreateEventInput) => void
  isSubmitting?: boolean
  errorMessage?: string | null
  initialCoverFile?: File | null
}

export function AlbumCreateForm({
  onCreate,
  isSubmitting = false,
  errorMessage = null,
  initialCoverFile = null,
}: AlbumCreateFormProps) {
  const today = useMemo(() => toLocalIsoDate(new Date()), [])
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState(today)
  const [coverFile, setCoverFile] = useState<File | null>(initialCoverFile)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const coverPreview = useMemo(() => {
    if (!coverFile) return null
    return URL.createObjectURL(coverFile)
  }, [coverFile])

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview)
    }
  }, [coverPreview])

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value.slice(0, NAME_MAX_LENGTH)
    setName(next)
  }

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEventDate(event.target.value)
  }

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    event.target.value = ''
    if (file) setCoverFile(file)
  }

  const isDateValid = Boolean(eventDate) && eventDate >= today

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting || !isDateValid) return
    onCreate({ name, eventDate })
  }

  const isDisabled =
    isSubmitting || name.trim().length === 0 || !isDateValid

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-1 flex-col items-stretch px-5"
    >
      <div className="mt-[60px] flex justify-center">
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCoverChange}
          data-testid="album-cover-picker"
        />
        {coverPreview ? (
          <div className="relative h-[140px] w-[140px] overflow-hidden rounded-[26.67px] bg-[#e6e8ee]">
            <img
              src={coverPreview}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              aria-label="대표 이미지 변경"
              className="absolute bottom-2 right-2 flex h-7 items-center justify-center rounded-full bg-[#222226]/90 px-3 text-[11px] font-medium text-white"
            >
              변경
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            aria-label="대표 이미지 업로드"
            className="flex h-[140px] w-[140px] flex-col items-center justify-center gap-2 rounded-[26.67px] border-2 border-dashed border-[#b7bdc6] bg-[#f4f6fa] text-[#616369] transition-colors hover:border-[#222226] hover:text-[#222226]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#222226] text-white">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10 4V16M4 10H16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-[12px] font-medium tracking-[-0.24px]">
              대표 이미지 업로드
            </span>
          </button>
        )}
      </div>

      <div className="mt-[28px] rounded-2xl bg-[#f4f6fa] p-[10px]">
        <label htmlFor="album-name" className="block px-[10px] py-[10px]">
          <span className="block text-[14px] font-medium text-[#616369]">
            앨범 이름
          </span>
        </label>
        <div className="flex items-end gap-[10px] px-[10px] pb-[5px]">
          <div className="flex-1">
            <input
              id="album-name"
              type="text"
              value={name}
              onChange={handleNameChange}
              maxLength={NAME_MAX_LENGTH}
              placeholder="예: 우리의 소중한 결혼식"
              className="w-full border-b border-[#b7bdc6] bg-transparent pb-[6px] text-[18px] font-medium text-[#222226] placeholder:text-[#b7bdc6] focus:border-[#222226] focus:outline-none"
            />
          </div>
          <span className="pb-[8px] text-[12px] text-[#616369]">
            {name.length}/{NAME_MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="mt-[10px] rounded-2xl bg-[#f4f6fa] p-[10px]">
        <label htmlFor="event-date" className="block px-[10px] py-[10px]">
          <span className="block text-[14px] font-medium text-[#616369]">
            행사 날짜
          </span>
        </label>
        <div className="px-[10px] pb-[5px]">
          <input
            id="event-date"
            type="date"
            value={eventDate}
            min={today}
            onChange={handleDateChange}
            required
            className="w-full border-b border-[#b7bdc6] bg-transparent pb-[6px] text-[18px] font-medium text-[#222226] focus:border-[#222226] focus:outline-none"
          />
        </div>
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-[8px] rounded-xl bg-[#fdecec] px-4 py-3 text-[13px] text-[#c0392b]"
        >
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isDisabled}
        className="mt-[8px] flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-[#222226] text-[18px] font-medium text-white transition-opacity hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <img src={LINK_ICON} alt="" className="h-6 w-6" aria-hidden="true" />
        {isSubmitting ? '만드는 중...' : '공유 링크 생성'}
      </button>
    </form>
  )
}
