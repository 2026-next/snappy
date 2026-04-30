import { useAuthStore } from '@/shared/auth/use-auth-store'
import { AlbumPromptView } from '@/widgets/home-hero/ui/album-prompt-view'
import { WelcomeView } from '@/widgets/home-hero/ui/welcome-view'

const WELCOME_HERO = '/images/welcome-hero.png'

export function HomeHero() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-[402px] flex-col bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[584px] overflow-hidden"
      >
        <img
          src={WELCOME_HERO}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/10 via-[31%] to-white to-[94%]" />
      </div>

      {isAuthenticated ? <AlbumPromptView /> : <WelcomeView />}
    </main>
  )
}
