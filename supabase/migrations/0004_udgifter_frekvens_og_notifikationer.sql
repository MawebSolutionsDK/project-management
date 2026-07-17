-- Udgifter: betalingshyppighed (måned/år) + præcis fornyelsesdato i stedet for kun måned
-- Kør i Supabase Dashboard -> SQL Editor -> New query -> Run

alter table business_expenses rename column annual_cost to cost;

alter table business_expenses
  add column if not exists billing_frequency text not null default 'aarlig'
    check (billing_frequency in ('maanedlig', 'aarlig'));

alter table business_expenses
  add column if not exists renewal_date date;

alter table business_expenses
  drop column if exists renewal_month;
