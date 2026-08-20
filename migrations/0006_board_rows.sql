create table if not exists board_themes (
  id text primary key,
  name text not null,
  notice text not null default '',
  whiteboard text not null default '{"nodes":[],"connectors":[]}',
  position integer not null default 0,
  rev integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists board_cards (
  id text primary key,
  theme_id text not null,
  column_id text not null,
  position integer not null default 0,
  title text not null,
  description text not null default '',
  details text not null default '',
  images text not null default '{}',
  blocked integer not null default 0,
  urgent integer not null default 0,
  waiting integer not null default 0,
  waiting_note text not null default '',
  jira_url text not null default '',
  pr_url text not null default '',
  assignee text not null default '',
  duration real,
  pr_alert integer not null default 0,
  blocked_by text not null default '[]',
  created_at bigint not null default 0,
  rev integer not null default 1,
  updated_at timestamptz not null default now()
);

create index if not exists board_cards_theme_idx
  on board_cards (theme_id, column_id, position);
create index if not exists board_cards_rev_idx on board_cards (rev);
create index if not exists board_themes_rev_idx on board_themes (rev);

create table if not exists board_tombstones (
  id text primary key,
  kind text not null,
  rev integer not null,
  created_at timestamptz not null default now()
);

create index if not exists board_tombstones_rev_idx on board_tombstones (rev);

create table if not exists board_meta (
  id text primary key,
  active_theme_id text not null default '',
  migrated integer not null default 0
);
