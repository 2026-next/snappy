import { type ChangeEvent, type FormEvent } from 'react'

const SEARCH_ICON = '/icons/search.svg'
const FILTER_ICON = '/icons/filter.svg'
const ADJUST_ICON = '/icons/adjust.svg'

type AlbumSearchBarProps = {
  value: string
  onChange: (value: string) => void
  onOpenFilter: () => void
  onOpenSort: () => void
}

export function AlbumSearchBar({
  value,
  onChange,
  onOpenFilter,
  onOpenSort,
}: AlbumSearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <div className="flex items-center justify-between gap-1 px-5">
      <form
        onSubmit={handleSubmit}
        role="search"
        className="flex h-[38px] flex-1 items-center gap-2 rounded-md bg-[#f4f6fa] px-[10px]"
      >
        <img
          src={SEARCH_ICON}
          alt=""
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="업로더 이름, 멘트로 검색"
          aria-label="사진 검색"
          className="h-full w-full bg-transparent text-[14px] font-medium tracking-[-0.28px] text-[#222226] placeholder:text-[#b7bdc6] focus:outline-none"
        />
      </form>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onOpenFilter}
          aria-label="필터 열기"
          className="flex h-[38px] w-10 items-center justify-center rounded-[10px] bg-[#f4f6fa]"
        >
          <img
            src={FILTER_ICON}
            alt=""
            className="h-6 w-6"
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          onClick={onOpenSort}
          aria-label="정렬 열기"
          className="flex h-[38px] w-10 items-center justify-center rounded-[10px] bg-[#f4f6fa]"
        >
          <img
            src={ADJUST_ICON}
            alt=""
            className="h-6 w-6"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  )
}
