# future-CRM

A private CRM web app for managing investor contacts, projects, and relationship categories.

## Stack
- **Frontend**: Next.js 14.2.3 (App Router, TypeScript, Tailwind CSS v3)
- **Icons**: lucide-react
- **Database**: Supabase (Postgres)
- **Hosting**: Vercel (auto-deploys on push to `main`)
- **Repo**: https://github.com/KoderKirk/future-CRM
- **Live URL**: https://future-crm-mocha.vercel.app

## Project Structure
```
src/
├── app/
│   ├── layout.tsx           # Root layout — wraps everything in <Providers> + <Sidebar>
│   ├── contacts/page.tsx    # Searchable contact table with right-side detail/edit panel
│   ├── projects/page.tsx    # Project card grid (fund / mandate / other)
│   ├── category/page.tsx    # Color-coded category tag management
│   └── archive/page.tsx     # Archived contacts, projects, categories (restore / delete)
├── components/
│   ├── Sidebar.tsx          # Left nav — Contacts, Projects, Category, Archive
│   └── Providers.tsx        # Client wrapper for CRMContext (required by server layout.tsx)
├── context/
│   └── CRMContext.tsx       # All state + Supabase CRUD — single source of truth
├── lib/
│   └── supabase.ts          # Supabase client (reads NEXT_PUBLIC_* env vars)
└── types/
    └── index.ts             # Contact, Project, Category, CustomColumn interfaces
supabase/
└── schema.sql               # Run once in Supabase SQL editor to create tables + RLS
```

## Data Model
All four Supabase tables use `uuid` PKs and an `archived boolean` column (soft-delete pattern):

- **contacts** — name, organization, phone, email, type, categories (text[]), custom_fields (jsonb), archived
- **projects** — name, type (fund/mandate/other), description, status (active/pipeline/closed), archived
- **categories** — name, color, description, archived
- **custom_columns** — label, key (snake_case of label)

RLS is enabled on all tables with a permissive `anon` policy (no auth yet).

## Key Patterns
- `CRMContext.tsx` loads all data once on mount via `useEffect` → `Promise.all` across all four tables. Every mutation calls Supabase then updates local state — no full refetch needed.
- `contactCount` on categories is computed in-memory from active contacts, not stored in the DB.
- Archive = set `archived = true` in DB. Restore = set `archived = false`. Permanent delete = `DELETE`.
- Custom columns are stored in the `custom_columns` table and rendered dynamically in the contacts table.

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
Copy `.env.example` to `.env.local` for local dev. Add the same vars in Vercel → Settings → Environment Variables.

## Development
```bash
npm install
npm run dev    # http://localhost:3000
```
Vercel auto-deploys on every push to `main`.

## Supabase Setup (one-time)
Run `supabase/schema.sql` in the Supabase SQL editor to create tables and RLS policies.
