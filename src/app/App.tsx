import { Outlet } from 'react-router-dom'

import { AppProviders } from '@/app/providers/app-providers'

export function App() {
  return (
    <AppProviders>
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <Outlet />
      </div>
    </AppProviders>
  )
}
