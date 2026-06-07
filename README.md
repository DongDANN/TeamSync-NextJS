# My SaaS App

Next.js 15 + Supabase — hosted free on Vercel + Supabase.

## Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Auth**: Supabase Auth (email/password, OAuth, magic links)
- **Database**: Supabase Postgres with Row-Level Security
- **Storage**: Supabase Storage (file uploads, signed URLs)
- **Realtime**: Supabase Realtime (WebSocket subscriptions)
- **Hosting**: Vercel (free tier)

## Project structure

```
my-saas-app/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx       # Login page
│   │   ├── signup/page.tsx      # Signup page
│   │   └── callback/page.tsx    # OAuth + magic link callback
│   ├── dashboard/
│   │   └── page.tsx             # Protected dashboard (server component)
│   ├── api/
│   │   ├── auth/confirm/        # Email confirmation route handler
│   │   └── webhooks/            # e.g. Stripe webhooks
│   ├── layout.tsx
│   └── page.tsx                 # Redirects based on auth state
├── lib/
│   └── supabase/
│       ├── client.ts            # Browser client (client components)
│       ├── server.ts            # Server client (server components, route handlers)
│       ├── middleware.ts        # Middleware client (session refresh + route protection)
│       ├── storage.ts           # File upload helpers
│       └── useRealtimeTable.ts  # Realtime subscription hook
├── types/
│   └── database.ts              # Generated Supabase types
├── middleware.ts                 # Edge middleware (runs on every request)
├── supabase-migrations.sql       # Run in Supabase SQL editor
└── .env.local.example
```

## Setup

### 1. Clone and install

```bash
git clone <your-repo>
cd my-saas-app
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Copy your **Project URL** and **anon key** from Settings → API

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
# Fill in your Supabase URL and keys
```

### 4. Run the database migration

Open your Supabase dashboard → SQL Editor, paste the contents of
`supabase-migrations.sql` and run it. This creates:
- `profiles` table linked to `auth.users`
- Row-Level Security policies
- Auto-create profile trigger on signup

### 5. Enable Auth providers (optional)

Supabase dashboard → Authentication → Providers:
- Enable **Google**, **GitHub**, or any other OAuth provider
- Add your OAuth app credentials

### 6. Generate TypeScript types (optional but recommended)

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
```

### 7. Run locally

```bash
npm run dev
```

### 8. Deploy to Vercel

```bash
npx vercel
# Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# to your Vercel project environment variables
```

## Key patterns

### Reading data in a server component
```ts
const supabase = await createClient() // from lib/supabase/server.ts
const { data } = await supabase.from('profiles').select('*')
```

### Reading data in a client component
```ts
const supabase = createClient() // from lib/supabase/client.ts
const { data } = await supabase.from('profiles').select('*')
```

### Realtime subscription
```ts
const items = useRealtimeTable<Item>('items', { userId: user.id })
```

### File upload
```ts
import { uploadFile } from '@/lib/supabase/storage'
const url = await uploadFile(file, `avatars/${userId}`)
```

## Free tier limits

| Service | Limit |
|---|---|
| Vercel | 100 GB bandwidth, unlimited deploys |
| Supabase Auth | 50,000 MAU |
| Supabase Database | 500 MB |
| Supabase Storage | 1 GB |
| Supabase Realtime | 200 concurrent connections |
