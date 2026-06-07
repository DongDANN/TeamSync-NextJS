'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

// Generic hook that subscribes to any table's changes
// Usage: const items = useRealtimeTable<Item>('items', { userId })
export function useRealtimeTable<T extends { id: string }>(
  table: string,
  filter?: { userId?: string }
) {
  const [rows, setRows] = useState<T[]>([])

  useEffect(() => {
    const supabase = createClient()

    // Initial fetch
    const query = supabase.from(table).select('*')
    if (filter?.userId) query.eq('user_id', filter.userId)
    query.then(({ data }) => { if (data) setRows(data as T[]) })

    // Subscribe to changes
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.eventType === 'INSERT') {
            setRows(prev => [...prev, payload.new as T])
          } else if (payload.eventType === 'UPDATE') {
            setRows(prev =>
              prev.map(r => r.id === (payload.new as T).id ? payload.new as T : r)
            )
          } else if (payload.eventType === 'DELETE') {
            setRows(prev => prev.filter(r => r.id !== (payload.old as T).id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [table, filter?.userId])

  return rows
}
