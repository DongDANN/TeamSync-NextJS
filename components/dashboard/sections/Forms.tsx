import type { TemplateId } from '@/lib/templates'

type FormsProps = {
  template?: TemplateId
}

export default function Forms({ template }: FormsProps) {
  return (
    <section className="rounded-3xl border border-theme-border/10 bg-theme-panel p-6">
      <h2 className="text-xl font-semibold uppercase tracking-[0.12em]">Forms</h2>
      <p className="mt-2 max-w-3xl text-sm text-theme-fg/60">
        Build and review intake forms, submissions, and automation rules tied to team workflows.
      </p>
    </section>
  )
}
