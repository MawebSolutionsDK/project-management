-- Fase 1-udvidelser: intern kunde + leads kan knyttes til eksisterende kunder
-- Kør i Supabase Dashboard -> SQL Editor -> New query -> Run

alter table customers
  add column if not exists is_internal boolean not null default false;

alter table leads
  add column if not exists customer_id uuid references customers(id) on delete set null;

create index if not exists leads_customer_id_idx on leads(customer_id);
