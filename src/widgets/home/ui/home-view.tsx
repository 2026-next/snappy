import { useNavigate } from 'react-router-dom'

const HOME_COLLAGE = '/images/home-collage.png'

export function HomeView() {
  const navigate = useNavigate()

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[584px] overflow-hidden"
      >
        <img
          src={HOME_COLLAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/10 via-[31%] to-white to-[94%]" />
      </div>

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
            onClick={() => navigate('/albums/new')}
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
    </main>
  )
}
