-- Inquiries from the public contact form.
-- Apply in the Supabase SQL editor (or CLI) once per project.

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null,
  event_type text not null,
  event_date date,
  location text,
  services text[] not null default '{}',
  message text not null,
  locale text not null check (locale in ('es', 'en')),
  status text not null default 'new'
);

alter table public.inquiries enable row level security;

-- No anon/authenticated policies: the Next.js server uses the service role,
-- which bypasses RLS. Public clients cannot read or write this table.

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_email_idx on public.inquiries (email);
