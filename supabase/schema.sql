-- ストックだな 初期スキーマ
-- Supabase SQL Editorで一度だけ実行する

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  barcode text,
  name text not null,
  category text,
  quantity numeric not null default 0,
  unit text,
  low_stock_threshold numeric,
  location text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists items_barcode_idx on items (barcode);

alter table items enable row level security;

create policy "signed-in family members can manage items"
  on items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- updated_atを更新時に自動でnow()にするトリガー
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger items_set_updated_at
  before update on items
  for each row
  execute function set_updated_at();
