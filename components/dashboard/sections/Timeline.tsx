import type { TemplateId } from '@/lib/templates'

type TimelineProps = {
  template?: TemplateId
}

export default function Timeline({ template }: TimelineProps) {
  return (
    <section className="rounded-3xl border border-theme-border/10 bg-theme-panel p-6">
      <h2 className="text-xl font-semibold uppercase tracking-[0.12em]">Timeline</h2>
      <p className="mt-2 max-w-3xl text-sm text-theme-fg/60">
        Visualize milestones, due dates, and dependencies so you can keep project delivery on track.
      </p>
    </section>
  )
}
