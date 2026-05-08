import { create } from 'zustand'

import type { GuestEventInfo } from '@/shared/api/guest'

type GuestEventState = {
  event: GuestEventInfo | null
  setEvent: (event: GuestEventInfo) => void
  clearEvent: () => void
}

export const useGuestEventStore = create<GuestEventState>()((set) => ({
  event: null,
  setEvent: (event) => set({ event }),
  clearEvent: () => set({ event: null }),
}))
