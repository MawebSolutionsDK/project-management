-- Notifikations-center: gemmer hvilke (afledte) notifikationer der er markeret som set.
-- Kør i Supabase Dashboard -> SQL Editor -> New query -> Run

create table if not exists dismissed_notifications (
  key text primary key,
  dismissed_at timestamptz not null default now()
);

alter table dismissed_notifications enable row level security;

create policy "authenticated full access on dismissed_notifications"
  on dismissed_notifications for all
  to authenticated
  using (true)
  with check (true);
