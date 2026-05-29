-- Executa a Supabase → SQL Editor → Run

create table if not exists quiniela (
  id int primary key,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

insert into quiniela (id, data) values (1, '{}')
on conflict (id) do nothing;

-- Permet lectura/escriptura amb la clau anon de Vercel
alter table quiniela disable row level security;
