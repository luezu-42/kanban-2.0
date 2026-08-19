create table if not exists _migrations (
  name text primary key,
  applied_at text not null default (datetime('now'))
);

create table if not exists profiles (
  user_id text primary key,
  name text not null,
  updated_at text not null default (datetime('now'))
);

create table if not exists workspace (
  id text primary key,
  payload text not null,
  updated_at text not null default (datetime('now'))
);

create table if not exists workspace_auth (
  id text primary key,
  salt text not null,
  hash text not null,
  updated_at text not null default (datetime('now'))
);

insert into workspace_auth (id, salt, hash)
values (
  'ledger',
  'bb07d3e5e49391551e0220c910c2fc73',
  '007fdd290394a88fa389045484a040d1f182df76e4747408274f48238e277d63cbb255f66cc4df651c7e9909d4a19e685e65d51b026c467cc2124b9a513ecedc'
)
on conflict (id) do nothing;

create table if not exists workspace_assets (
  id text primary key,
  data text not null,
  updated_at text not null default (datetime('now'))
);

create table if not exists webrtc_peers (
  room text not null,
  peer_id text not null,
  name text not null default '',
  last_seen text not null default (datetime('now')),
  primary key (room, peer_id)
);

create table if not exists webrtc_signals (
  id integer primary key autoincrement,
  room text not null,
  to_peer text not null,
  from_peer text not null,
  kind text not null,
  payload text not null,
  created_at text not null default (datetime('now'))
);

create index if not exists webrtc_signals_inbox
  on webrtc_signals (room, to_peer, id);
