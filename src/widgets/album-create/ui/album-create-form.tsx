import { useState, type ChangeEvent, type FormEvent } from 'react'

const ALBUM_COVER = '/images/album-cover-sample.png'
const PENCIL_ICON = '/icons/pencil.svg'
const LINK_ICON = '/icons/link.svg'

const NAME_MAX_LENGTH = 30

type AlbumCreateFormProps = {
  onCreate: (name: string) => void
}

export function AlbumCreateForm({ onCreate }: AlbumCreateFormProps) {
  const [name, setName] = useState('')

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value.slice(0, NAME_MAX_LENGTH)
    setName(next)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onCreate(name)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-1 flex-col items-stretch px-5"
    >
      <div className="mt-[60px] flex justify-center">
        <div className="relative">
          <div className="relative h-[140px] w-[140px] overflow-hidden rounded-[26.67px] bg-[#a2a5ad]">
            <img
              src={ALBUM_COVER}
              alt=""
              className="absolute left-[-18.95%] top-[-44.53%] h-[204%] w-[137.91%] max-w-none"
            />
          </div>
          <button
            type="button"
            aria-label="대표 이미지 변경"
            className="absolute -bottom-1 -right-1 flex h-[30px] w-[30px] items-center justify-center"
          >
            <span className="absolute h-[25px] w-[25px] rounded-full bg-[#222226]" />
            <img
              src={PENCIL_ICON}
              alt=""
              className="relative h-[15px] w-[15px]"
              aria-hidden="true"
            />
          </button>
        </div>
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
              onChange={handleChange}
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

      <button
        type="submit"
        className="mt-[8px] flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-[#222226] text-[18px] font-medium text-white transition-opacity hover:opacity-90 active:opacity-80"
      >
        <img src={LINK_ICON} alt="" className="h-6 w-6" aria-hidden="true" />
        공유 링크 생성
      </button>
    </form>
  )
}
