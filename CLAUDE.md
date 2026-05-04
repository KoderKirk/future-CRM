# future-CRM

A private CRM web app for managing investor contacts, projects, and relationship categories.

## Stack
- **Frontend**: Next.js 14.2.3 (App Router, TypeScript, Tailwind CSS v3)
- **Icons**: lucide-react 0.363.0
- **Database**: Supabase (Postgres, JS client `@supabase/supabase-js`)
- **Hosting**: Vercel (auto-deploys on push to `main`)
- **Repo**: https://github.com/KoderKirk/future-CRM
- **Live URL**: https://future-crm-mocha.vercel.app

## Project Structure
```
src/
├── app/
│   ├── layout.tsx                  # Root layout — wraps in <Providers> + <Sidebar>
│   ├── contacts/page.tsx           # Contact table, checkbox selection, detail panel, CSV import
│   ├── projects/page.tsx           # Project card grid — clicking a card navigates to detail
│   ├── projects/[id]/page.tsx      # Project detail — committed contacts table
│   ├── category/page.tsx           # Color-coded category tag management
│   └── archive/page.tsx            # Archived contacts, projects, categories (restore / delete)
├── components/
│   ├── Sidebar.tsx                 # Left nav — Contacts, Projects, Category, Archive
│   └── Providers.tsx               # 'use client' wrapper for CRMContext (required by server layout.tsx)
├── context/
│   └── CRMContext.tsx              # ALL state + Supabase CRUD — single source of truth
├── lib/
│   └── supabase.ts                 # Supabase client singleton
└── types/
    └── index.ts                    # Contact, Project, Category, CustomColumn, ImportLog, ProjectContact
supabase/
└── schema.sql                      # Full schema — run once in Supabase SQL editor
```

## Supabase Tables
All tables use `uuid` PKs (`gen_random_uuid()`). RLS enabled on all with permissive `anon` policy (no auth yet).

| Table | Key columns |
|---|---|
| `contacts` | name, organization, phone, email, type, categories `text[]`, custom_fields `jsonb`, archived `bool` |
| `projects` | name, type (fund/mandate/other), description, status (active/pipeline/closed), archived `bool` |
| `categories` | name, color, description, archived `bool` |
| `custom_columns` | label, key (snake_case) |
| `import_logs` | filename, row_count, created_at |
| `project_contacts` | project_id, contact_id — UNIQUE(project_id, contact_id) |

## Key Patterns

**State management (`CRMContext.tsx`)**
- Loads all tables in one `Promise.all` on mount; local state is the source of truth after that
- Every mutation: call Supabase → update local state (no full refetch)
- `archived` boolean = soft delete. Archive sets `archived=true`, restore sets `archived=false`, permanent delete is a hard `DELETE`
- `contactCount` on categories is computed in-memory, not stored in DB
- `project_contacts` is a junction table; `commitContactsToProject` uses `upsert` with `onConflict: 'project_id,contact_id'`

**Contacts page**
- Checkbox column (leftmost) for multi-select; select-all in header
- When ≥1 checked: indigo action bar appears with "Commit to Pipeline" button
- Commit modal lists non-closed projects; creates rows in `project_contacts`
- Right-side detail panel opens on row click (independent of checkbox state)
- Footer has "Upload CSV" button opening the import modal

**CSV import**
- Template download generates headers from current columns (standard + custom); categories use `|` as separator within the cell (e.g. `LP|Tier 1`)
- Parser handles quoted fields and CRLF/LF line endings
- `bulkAddContacts` does a single Supabase insert for the batch, then logs to `import_logs`

**Projects page → detail page**
- Card click → `router.push('/projects/[id]')`. Archive/delete buttons use `e.stopPropagation()`
- Detail page at `/projects/[id]` shows committed contacts; X button on hover removes via `removeContactFromProject`

**UI conventions**
- Dark theme: body `#0a0a0a`, sidebar `#0f0f0f`, cards `#111`, borders `#1e1e1e` / `#2a2a2a`
- Accent: `indigo-600` (buttons), `indigo-500` (hover), `indigo-400` (active nav/text)
- All pages are `'use client'` components consuming `useCRM()`
- Modals: fixed inset overlay `bg-black/60`, click-outside closes, `z-50`

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
`.env.local` for local dev (gitignored). Same vars must be set in Vercel → Settings → Environment Variables.

## Development
```bash
npm install
npm run dev    # http://localhost:3000
```

## What's Not Built Yet (natural next steps)
- **Auth** — currently uses anon Supabase key, fully public. Add Supabase Auth + RLS policies scoped to `auth.uid()` when ready
- **Contact → project visibility** — contacts page doesn't yet show which projects a contact is committed to
- **Edit projects** — project cards have no inline edit; only add/archive/delete
- **Notes / activity log** — no per-contact notes or interaction history yet
- **Sorting / filtering** — contacts table has search but no column sort or filter by category/type
