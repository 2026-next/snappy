import type { PropsWithChildren } from 'react'

import { AuthBootstrapper } from '@/app/providers/auth-bootstrapper'

export function AppProviders({ children }: PropsWithChildren) {
  return <AuthBootstrapper>{children}</AuthBootstrapper>
}
