# future-CRM

A CRM web application built with Next.js, Supabase (database/auth), and deployed on Vercel.

## Stack
- **Frontend**: Next.js (React)
- **Database & Auth**: Supabase
- **Hosting**: Vercel
- **Repo**: GitHub (KoderKirk)

## Project Structure
```
future-CRM/
├── index.html        # Test page (pre-framework)
├── CLAUDE.md         # This file
```

## Environment Variables
See `.env.example` for required variables. Copy to `.env.local` for local development.

## Development
- Local: open `index.html` directly in browser, or use a dev server
- Production: deployed via Vercel on push to `main`

## Supabase
- Project URL and anon key stored in environment variables
- Schema and migrations tracked in `supabase/` directory
