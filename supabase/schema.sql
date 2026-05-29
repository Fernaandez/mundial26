-- Executa això al SQL Editor de Supabase (gratuït, sense targeta)
-- Dashboard → SQL Editor → New query → Run

create table if not exists quiniela (
  id int primary key,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

insert into quiniela (id, data) values (1, '{}')
on conflict (id) do nothing;
