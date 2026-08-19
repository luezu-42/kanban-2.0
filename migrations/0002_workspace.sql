create table if not exists profiles (
  user_id text primary key,
  name text not null,
  updated_at timestamptz not null default now()
);

create table if not exists workspace (
  id text primary key,
  payload text not null,
  updated_at timestamptz not null default now()
);
