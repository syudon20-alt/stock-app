-- 保管場所マスタを追加する移行用SQL
-- Supabase SQL Editorで一度だけ実行する

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

alter table locations enable row level security;

create policy "anyone can read locations"
  on locations for select
  using (true);

create policy "anyone can insert locations"
  on locations for insert
  with check (true);

create policy "anyone can update locations"
  on locations for update
  using (true);

create policy "anyone can delete locations"
  on locations for delete
  using (true);
