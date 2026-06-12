import type { TemplateId } from '@/lib/templates'

type CodeProps = {
  template?: TemplateId
}

export default function Code({ template }: CodeProps) {
  return (
    <section className="rounded-3xl border border-theme-border/10 bg-theme-panel p-6">
      <h2 className="text-xl font-semibold uppercase tracking-[0.12em]">Code</h2>
      <p className="mt-2 max-w-3xl text-sm text-theme-fg/60">
        Review pull request status, CI outcomes, and merge readiness for your current development cycle.
      </p>
    </section>
  )
}
