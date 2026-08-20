alter table board_cards add column waiting integer not null default 0;
alter table board_cards add column waiting_note text not null default '';
