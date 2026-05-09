create table standings (
  team text primary key,
  position int not null,
  pj int not null default 0,
  wins int not null default 0,
  draws int not null default 0,
  losses int not null default 0,
  pts_for int not null default 0,
  pts_against int not null default 0,
  win_pct float not null default 0,
  form text[] not null default '{}',
  classification text,
  updated_at timestamptz not null default now()
);

alter table standings enable row level security;
create policy "standings readable by all" on standings for select using (true);
