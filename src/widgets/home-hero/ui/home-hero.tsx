import { ProjectOverview } from '@/features/project-overview/ui/project-overview'
import { TodoPreview } from '@/features/todo-preview/ui/todo-preview'
import { APP_NAME } from '@/shared/config/app'
import { PageShell } from '@/shared/ui/page-shell'

export function HomeHero() {
  return (
    <PageShell
      eyebrow="React + Vite starter"
      title={`${APP_NAME} project architecture`}
      description="This baseline is intentionally plain. It focuses on file structure, tooling, routing, and tests so product work can begin without another setup pass."
    >
      <div className="grid gap-6">
        <TodoPreview />
        <ProjectOverview />
      </div>
    </PageShell>
  )
}
