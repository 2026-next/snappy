import { useNavigate } from 'react-router-dom'

import { authStartUrl, type OAuthProvider } from '@/shared/config/api'
import { useAuthStore } from '@/shared/auth/use-auth-store'

const KAKAO_ICON = '/icons/kakao.svg'
const GOOGLE_ICON = '/icons/google.svg'
const LOGO_SYMBOL = '/images/logo/logo_simbol.svg'
const AUTH_HERO = '/images/welcome-hero.png'

const DEBUG_ACCESS_TOKEN =
  (import.meta.env.VITE_DEBUG_ACCESS_TOKEN as string | undefined) ??
  'debug-access-token'
const DEBUG_REFRESH_TOKEN =
  (import.meta.env.VITE_DEBUG_REFRESH_TOKEN as string | undefined) ??
  'debug-refresh-token'

export function AuthView() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)

  const handleLogin = (provider: OAuthProvider) => () => {
    window.location.assign(authStartUrl(provider))
  }

  const handleDebugLogin = () => {
    setTokens(
      {
        accessToken: DEBUG_ACCESS_TOKEN,
        refreshToken: DEBUG_REFRESH_TOKEN,
        tokenType: 'Bearer',
      },
      'google',
    )
    navigate('/')
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[584px] overflow-hidden"
      >
        <img
          src={AUTH_HERO}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/10 via-[31%] to-white to-[94%]" />
      </div>

      <div className="relative flex flex-1 flex-col items-center px-5 pb-10">
        <div className="mt-[510px] flex items-center gap-2">
          <img
            src={LOGO_SYMBOL}
            alt=""
            aria-hidden="true"
            className="h-[39px] w-[39px] object-contain"
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
          {import.meta.env.DEV ? (
            <button
              type="button"
              onClick={handleDebugLogin}
              className="mt-2 flex h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#b7bdc6] bg-white text-[14px] font-medium text-[#616369] transition-opacity hover:opacity-80 active:opacity-70"
            >
              🛠 디버그 로그인 (DEV)
            </button>
          ) : null}
        </div>

        <p className="mt-9 text-center text-[10px] text-[#a2a5ad]">
          하객은 회원가입 없이 QR 또는 링크로 바로 사진을 업로드할 수 있어요
        </p>
      </div>
    </main>
  )
}
