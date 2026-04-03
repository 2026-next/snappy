import { Link } from 'react-router-dom'

import { APP_NAME } from '@/shared/config/app'
import { PageShell } from '@/shared/ui/page-shell'

export function NotFoundPage() {
  return (
    <PageShell
      eyebrow="404"
      title="Page not found"
      description={`The route does not exist in the current ${APP_NAME} starter.`}
    >
      <Link
        to="/"
        className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-900"
      >
        Back to home
      </Link>
    </PageShell>
  )
}
