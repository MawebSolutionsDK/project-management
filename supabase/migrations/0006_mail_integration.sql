-- Mail-integration: tabeller til at logge og spore indkommende mails
-- Kør i Supabase Dashboard -> SQL Editor -> New query -> Run

create table if not exists emails (
  id uuid primary key default gen_random_uuid(),
  mailbox text not null,
  message_id text not null,
  imap_uid bigint,
  from_address text,
  from_name text,
  subject text,
  received_at timestamptz,
  preview text,
  matched_customer_id uuid references customers(id) on delete set null,
  matched_lead_id uuid references leads(id) on delete set null,
  is_read boolean not null default false,
  is_actioned boolean not null default false,
  created_at timestamptz not null default now(),
  unique (mailbox, message_id)
);

alter table emails enable row level security;

create policy "authenticated full access on emails"
  on emails for all
  to authenticated
  using (true)
  with check (true);

create index if not exists emails_received_at_idx on emails(received_at desc);
create index if not exists emails_matched_customer_id_idx on emails(matched_customer_id);
create index if not exists emails_matched_lead_id_idx on emails(matched_lead_id);

create table if not exists mail_sync_state (
  mailbox text primary key,
  last_uid bigint not null default 0,
  last_synced_at timestamptz
);

alter table mail_sync_state enable row level security;

create policy "authenticated full access on mail_sync_state"
  on mail_sync_state for all
  to authenticated
  using (true)
  with check (true);
