-- Fase 2: Vedligeholdelsesaftaler, Support, Udgifter
-- Kør i Supabase Dashboard -> SQL Editor -> New query -> Run

-- VEDLIGEHOLDELSESAFTALER --------------------------------------------------
create table if not exists maintenance_agreements (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete restrict,
  plan_name text not null,
  monthly_price numeric not null,
  period_years integer not null default 1 check (period_years in (1, 2, 3)),
  start_date date not null,
  renewal_date date generated always as ((start_date + (period_years * interval '1 year'))::date) stored,
  status text not null default 'aktiv' check (status in ('aktiv', 'opsagt', 'udloebet')),
  notes text,
  created_at timestamptz not null default now()
);

alter table maintenance_agreements enable row level security;

create policy "authenticated full access on maintenance_agreements"
  on maintenance_agreements for all
  to authenticated
  using (true)
  with check (true);

create index if not exists maintenance_agreements_customer_id_idx on maintenance_agreements(customer_id);

-- SUPPORTSAGER (adskilt fra vedligeholdelse, saelges separat) --------------
create table if not exists support_cases (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete restrict,
  title text not null,
  description text,
  hours_spent numeric,
  invoice_status text not null default 'ikke_faktureret'
    check (invoice_status in ('ikke_faktureret', 'faktureret', 'betalt')),
  status text not null default 'aaben' check (status in ('aaben', 'loest')),
  opened_at date not null default current_date,
  closed_at date,
  notes text,
  created_at timestamptz not null default now()
);

alter table support_cases enable row level security;

create policy "authenticated full access on support_cases"
  on support_cases for all
  to authenticated
  using (true)
  with check (true);

create index if not exists support_cases_customer_id_idx on support_cases(customer_id);

-- SOFTWARE/PLUGIN-UDGIFTER --------------------------------------------------
create table if not exists business_expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  annual_cost numeric not null,
  renewal_month integer check (renewal_month between 1 and 12),
  notes text,
  created_at timestamptz not null default now()
);

alter table business_expenses enable row level security;

create policy "authenticated full access on business_expenses"
  on business_expenses for all
  to authenticated
  using (true)
  with check (true);
