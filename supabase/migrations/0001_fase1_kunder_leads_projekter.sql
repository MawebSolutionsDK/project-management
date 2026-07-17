-- Fase 1: Kunder, Leads, Projekter
-- Kør denne i Supabase Dashboard -> SQL Editor -> New query -> Run

create extension if not exists "pgcrypto";

-- KUNDER -----------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cvr text,
  contact_person text,
  email text,
  phone text,
  industry text,               -- fx: rejsebureau, lokal service, andet
  status text not null default 'aktiv' check (status in ('aktiv', 'tidligere')),
  notes text,
  created_at timestamptz not null default now()
);

alter table customers enable row level security;

create policy "authenticated full access on customers"
  on customers for all
  to authenticated
  using (true)
  with check (true);

-- LEADS --------------------------------------------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,          -- firmanavn/kontakt
  contact_person text,
  email text,
  phone text,
  source text,                 -- facebook, henvisning, gratis vurdering, kold kontakt, andet
  status text not null default 'ny'
    check (status in ('ny', 'kontaktet', 'vurdering_sendt', 'tilbud', 'vundet', 'tabt')),
  next_action text,
  next_action_date date,
  notes text,
  created_at timestamptz not null default now()
);

alter table leads enable row level security;

create policy "authenticated full access on leads"
  on leads for all
  to authenticated
  using (true)
  with check (true);

-- PROJEKTER ------------------------------------------------------------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete restrict,
  name text not null,           -- fx "Nyt website", "Redesign", "SEO-audit"
  type text,                    -- nyt_website, redesign, seo_audit, andet
  status text not null default 'forespoergsel'
    check (status in ('forespoergsel', 'tilbud_sendt', 'aftalt', 'i_gang', 'afsluttet', 'efter_service')),
  scope_description text,
  deadline date,
  price numeric,
  invoice_status text not null default 'ikke_faktureret'
    check (invoice_status in ('ikke_faktureret', 'faktureret', 'betalt')),
  links text,
  notes text,
  created_at timestamptz not null default now()
);

alter table projects enable row level security;

create policy "authenticated full access on projects"
  on projects for all
  to authenticated
  using (true)
  with check (true);

create index if not exists projects_customer_id_idx on projects(customer_id);
