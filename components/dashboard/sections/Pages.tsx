import type { TemplateId } from '@/lib/templates'

type PagesProps = {
  template?: TemplateId
}

export default function Pages({ template }: PagesProps) {
  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6">
      <h2 className="text-xl font-semibold uppercase tracking-[0.12em]">Pages</h2>
      <p className="mt-2 max-w-3xl text-sm text-black/60">
        Manage internal documentation pages, publish updates, and keep structured notes searchable.
      </p>
    </section>
  )
}
