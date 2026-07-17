-- updated_at-kolonner (til dag/uge/maaned-summary: "vundet denne uge", "afsluttet denne maaned" osv.)
-- Kør i Supabase Dashboard -> SQL Editor -> New query -> Run

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

alter table customers add column if not exists updated_at timestamptz not null default now();
drop trigger if exists trg_customers_updated_at on customers;
create trigger trg_customers_updated_at before update on customers
  for each row execute function set_updated_at();

alter table leads add column if not exists updated_at timestamptz not null default now();
drop trigger if exists trg_leads_updated_at on leads;
create trigger trg_leads_updated_at before update on leads
  for each row execute function set_updated_at();

alter table projects add column if not exists updated_at timestamptz not null default now();
drop trigger if exists trg_projects_updated_at on projects;
create trigger trg_projects_updated_at before update on projects
  for each row execute function set_updated_at();

alter table maintenance_agreements add column if not exists updated_at timestamptz not null default now();
drop trigger if exists trg_maintenance_agreements_updated_at on maintenance_agreements;
create trigger trg_maintenance_agreements_updated_at before update on maintenance_agreements
  for each row execute function set_updated_at();

alter table support_cases add column if not exists updated_at timestamptz not null default now();
drop trigger if exists trg_support_cases_updated_at on support_cases;
create trigger trg_support_cases_updated_at before update on support_cases
  for each row execute function set_updated_at();

alter table business_expenses add column if not exists updated_at timestamptz not null default now();
drop trigger if exists trg_business_expenses_updated_at on business_expenses;
create trigger trg_business_expenses_updated_at before update on business_expenses
  for each row execute function set_updated_at();
