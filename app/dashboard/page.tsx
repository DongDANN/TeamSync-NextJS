'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidebar, { type SectionKey } from '@/components/dashboard/Sidebar'
import HeaderDashboard from '@/components/dashboard/HeaderDashboard'
import Summary from '@/components/dashboard/sections/Summary'
import Backlog from '@/components/dashboard/sections/Backlog'
import Board from '@/components/dashboard/sections/Board'
import Code from '@/components/dashboard/sections/Code'
import Timeline from '@/components/dashboard/sections/Timeline'
import Pages from '@/components/dashboard/sections/Pages'
import Forms from '@/components/dashboard/sections/Forms'

const sectionComponents: Record<SectionKey, React.ComponentType> = {
  Summary,
  Backlog,
  Board,
  Code,
  Timeline,
  Pages,
  Forms,
}

export default function DashboardPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<SectionKey>('Summary')
  const [userName, setUserName] = useState('Admin User')

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = (await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()) as { data: { full_name?: string } | null }

      setUserName(profile?.full_name ?? user.email ?? 'Admin User')
    }

    loadUser()
  }, [router])

  const SectionComponent = sectionComponents[selected]

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar selected={selected} setSelected={setSelected} />
      <div className="flex min-w-0 flex-1 flex-col">
        <HeaderDashboard title={selected} userName={userName} />
        <main className="flex-1 overflow-y-auto bg-zinc-50 p-6">
          <SectionComponent />
        </main>
      </div>
    </div>
  )
}
