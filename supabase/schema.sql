-- Executa a Supabase → SQL Editor → Run
-- (Si ja ho vas executar abans, no cal repetir-ho)

create table if not exists quiniela (
  id int primary key,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);

-- La fila inicial pot estar buida: l'app la omple sola en el primer accés
insert into quiniela (id, data) values (1, '{}')
on conflict (id) do nothing;

alter table quiniela disable row level security;
