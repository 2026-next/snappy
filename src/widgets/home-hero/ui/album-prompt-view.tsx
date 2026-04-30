export function AlbumPromptView() {
  return (
    <div className="relative flex flex-1 flex-col px-5 pb-10">
      <h1 className="mt-[440px] text-[30px] leading-[1.4] text-[#222226]">
        그날의
        <br />
        추억을
        <br />
        수집해볼까요?
      </h1>

      <div className="mt-[60px] flex w-full flex-col gap-2">
        <button
          type="button"
          className="flex h-[60px] w-full items-center justify-center rounded-2xl bg-[#222226] text-[18px] font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
        >
          새 앨범 만들기
        </button>
        <button
          type="button"
          className="flex h-[60px] w-full items-center justify-center rounded-2xl bg-[#f4f6fa] text-[18px] font-semibold text-[#222226] transition-opacity hover:opacity-90 active:opacity-80"
        >
          내 사진 관리하기
        </button>
      </div>
    </div>
  )
}
