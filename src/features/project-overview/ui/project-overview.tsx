import { starterHighlights } from '@/features/project-overview/model/highlights'

export function ProjectOverview() {
  return (
    <section
      aria-labelledby="project-overview-title"
      className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30"
    >
      <h2
        id="project-overview-title"
        className="text-lg font-semibold text-slate-50"
      >
        Starter overview
      </h2>
      <ul className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
        {starterHighlights.map((highlight) => (
          <li
            key={highlight}
            className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3"
          >
            {highlight}
          </li>
        ))}
      </ul>
    </section>
  )
}
