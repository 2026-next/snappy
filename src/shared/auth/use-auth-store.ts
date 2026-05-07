import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type AuthProvider = 'kakao' | 'google'
export type SessionType = 'GUEST' | 'USER'

export type TokenPair = {
  accessToken: string
  refreshToken: string
  tokenType: string
}

export type MeResponse = {
  sessionType: SessionType
  user?: Record<string, unknown> | null
  guest?: Record<string, unknown> | null
}

type PersistedFields = {
  accessToken: string | null
  refreshToken: string | null
  tokenType: string | null
  provider: AuthProvider | null
  sessionType: SessionType | null
  user: Record<string, unknown> | null
  guest: Record<string, unknown> | null
}

type AuthState = PersistedFields & {
  isAuthenticated: boolean
  setTokens: (pair: TokenPair, provider: AuthProvider | null) => void
  setSession: (me: MeResponse) => void
  logout: () => void
}

const emptyPersisted: PersistedFields = {
  accessToken: null,
  refreshToken: null,
  tokenType: null,
  provider: null,
  sessionType: null,
  user: null,
  guest: null,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...emptyPersisted,
      isAuthenticated: false,
      setTokens: (pair, provider) =>
        set({
          accessToken: pair.accessToken,
          refreshToken: pair.refreshToken,
          tokenType: pair.tokenType,
          provider,
          sessionType: null,
          user: null,
          guest: null,
          isAuthenticated: true,
        }),
      setSession: (me) =>
        set({
          sessionType: me.sessionType,
          user: me.user ?? null,
          guest: me.guest ?? null,
        }),
      logout: () => set({ ...emptyPersisted, isAuthenticated: false }),
    }),
    {
      name: 'snappy.auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedFields => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        tokenType: state.tokenType,
        provider: state.provider,
        sessionType: state.sessionType,
        user: state.user,
        guest: state.guest,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = state.accessToken != null
        }
      },
    },
  ),
)
