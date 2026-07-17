-- Produkter/ydelser: katalog + kobling til aftaler og projekter
-- Kør i Supabase Dashboard -> SQL Editor -> New query -> Run

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  pricing_type text not null default 'engangsbeloeb' check (pricing_type in ('engangsbeloeb', 'maanedlig')),
  default_price numeric not null,
  description text,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table products enable row level security;

create policy "authenticated full access on products"
  on products for all to authenticated using (true) with check (true);

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();

alter table maintenance_agreements
  add column if not exists product_id uuid references products(id) on delete set null;

alter table projects
  add column if not exists product_id uuid references products(id) on delete set null;

create index if not exists maintenance_agreements_product_id_idx on maintenance_agreements(product_id);
create index if not exists projects_product_id_idx on projects(product_id);
