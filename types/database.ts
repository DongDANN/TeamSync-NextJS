// Auto-generate this file with the Supabase CLI:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
//
// Or via the Supabase dashboard → Settings → API → Generate types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          updated_at: string | null
          github_token: string | null
          github_owner: string | null
          github_repo: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
          github_token?: string | null
          github_owner?: string | null
          github_repo?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string | null
          github_token?: string | null
          github_owner?: string | null
          github_repo?: string | null
        }
      }
      // Add your other tables here
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
