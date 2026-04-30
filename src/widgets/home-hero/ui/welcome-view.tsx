import { useAuthStore, type AuthProvider } from '@/shared/auth/use-auth-store'

const KAKAO_ICON = '/icons/kakao.svg'
const GOOGLE_ICON = '/icons/google.svg'
const LOGO_PLACEHOLDER = '/icons/logo-placeholder.png'

export function WelcomeView() {
  const loginWith = useAuthStore((state) => state.loginWith)

  const handleLogin = (provider: AuthProvider) => () => {
    loginWith(provider)
  }

  return (
    <div className="relative flex flex-1 flex-col items-center px-5 pb-10">
      <div className="mt-[510px] flex items-center gap-2">
        <img
          src={LOGO_PLACEHOLDER}
          alt=""
          className="h-[39px] w-[39px] object-cover"
        />
        <h1 className="text-[40px] font-bold leading-none text-[#212121]">
          Snappy
        </h1>
      </div>

      <div className="mt-[44px] flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={handleLogin('kakao')}
          className="flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-[#fbe300] text-[18px] font-semibold text-[#3b1e1e] transition-opacity hover:opacity-90 active:opacity-80"
        >
          <img src={KAKAO_ICON} alt="" className="h-6 w-6" aria-hidden="true" />
          kakao로 시작하기
        </button>
        <button
          type="button"
          onClick={handleLogin('google')}
          className="flex h-[60px] w-full items-center justify-center gap-2 rounded-2xl bg-[#f4f6fa] text-[18px] font-semibold text-[#222226] transition-opacity hover:opacity-90 active:opacity-80"
        >
          <img src={GOOGLE_ICON} alt="" className="h-6 w-6" aria-hidden="true" />
          Google로 시작하기
        </button>
      </div>

      <p className="mt-9 text-center text-[10px] text-[#a2a5ad]">
        하객은 회원가입 없이 QR 또는 링크로 바로 사진을 업로드할 수 있어요
      </p>
    </div>
  )
}
