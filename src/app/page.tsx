import { createClient } from "@/lib/supabase/server";
import ItemList from "@/components/ItemList";
import type { Item } from "@/types/item";

export default async function HomePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("category", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600">
        在庫の取得に失敗しました: {error.message}
      </div>
    );
  }

  return <ItemList initialItems={(data ?? []) as Item[]} />;
}
