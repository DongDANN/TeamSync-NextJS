import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Profile = {
  full_name?: string
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Middleware already handles the redirect, but this is a safety net
  if (!user) redirect('/auth/login')

  // Example: fetch user-specific data from the database
  const { data: profile } = (await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()) as { data: Profile | null };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {profile?.full_name ?? user.email}</p>
      {/* Your dashboard UI here */}
    </div>
  )
}
