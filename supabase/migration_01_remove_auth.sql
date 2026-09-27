-- ログイン必須(auth.role() = 'authenticated')から、
-- 読書管理・レシピアプリと同じ「URLを知っていれば誰でも操作可」に変更する移行用SQL
-- Supabase SQL Editorで一度だけ実行する

drop policy if exists "signed-in family members can manage items" on items;

create policy "anyone can read items"
  on items for select
  using (true);

create policy "anyone can insert items"
  on items for insert
  with check (true);

create policy "anyone can update items"
  on items for update
  using (true);

create policy "anyone can delete items"
  on items for delete
  using (true);
