create table if not exists workspace_auth (
  id text primary key,
  salt text not null,
  hash text not null,
  updated_at timestamptz not null default now()
);

insert into workspace_auth (id, salt, hash)
values (
  'ledger',
  'bb07d3e5e49391551e0220c910c2fc73',
  '007fdd290394a88fa389045484a040d1f182df76e4747408274f48238e277d63cbb255f66cc4df651c7e9909d4a19e685e65d51b026c467cc2124b9a513ecedc'
)
on conflict (id) do nothing;
