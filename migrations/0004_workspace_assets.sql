create table if not exists workspace_assets (
  id text primary key,
  data text not null,
  updated_at timestamptz not null default now()
);
