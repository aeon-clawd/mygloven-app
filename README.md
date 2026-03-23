# mygloven Dashboard

A React + TypeScript dashboard for the mygloven music event venue platform. Features role-based access for venues, artists, service providers, and event organizers.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS v4** for styling
- **React Router v7** with lazy-loaded routes
- **Supabase** for auth & data (works in demo mode without credentials)
- **Lucide React** for icons

## Getting Started

```bash
npm install
npm run dev
```

The app runs in **demo mode** by default. Sign in with any email/password to explore.

### Connecting Supabase

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Add your Supabase project URL and anon key, then create a `profiles` table:

```sql
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  role text not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);
```

## Roles

| Role | Description |
|------|-------------|
| **Venue** | Manage spaces, bookings, and analytics |
| **Artist** | Showcase profiles, portfolios, and gig history |
| **Provider** | Offer event services and manage clients |
| **Organizer** | Plan events, find venues, manage budgets |

## Deployment

Configured for Vercel with SPA rewrites. Push to a connected repo or run:

```bash
npx vercel
```

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build
