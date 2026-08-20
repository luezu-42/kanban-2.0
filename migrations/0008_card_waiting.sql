alter table board_cards add column if not exists waiting integer not null default 0;
alter table board_cards add column if not exists waiting_note text not null default '';
