import type { PropsWithChildren } from 'react'

type PageShellProps = PropsWithChildren<{
  eyebrow: string
  title: string
  description: string
}>

export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: PageShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
      <div className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-cyan-300">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
          {description}
        </p>
      </div>
      <div className="mt-10">{children}</div>
    </main>
  )
}
