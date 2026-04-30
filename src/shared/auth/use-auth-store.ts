import { create } from 'zustand'

export type AuthProvider = 'kakao' | 'google'

type AuthState = {
  isAuthenticated: boolean
  provider: AuthProvider | null
  loginWith: (provider: AuthProvider) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  provider: null,
  loginWith: (provider) => set({ isAuthenticated: true, provider }),
  logout: () => set({ isAuthenticated: false, provider: null }),
}))
