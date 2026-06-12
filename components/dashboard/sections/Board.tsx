import type { TemplateId } from '@/lib/templates'

type BoardProps = {
  template?: TemplateId
}

export default function Board({ template }: BoardProps) {
  return (
    <section className="rounded-3xl border border-theme-border/10 bg-theme-panel p-6">
      <h2 className="text-xl font-semibold uppercase tracking-[0.12em]">Board</h2>
      <p className="mt-2 max-w-3xl text-sm text-theme-fg/60">
        Track work in progress, monitor handoffs, and move cards through your active workflow columns.
      </p>
    </section>
  )
}
