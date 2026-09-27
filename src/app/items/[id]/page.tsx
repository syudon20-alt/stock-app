import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ItemForm from "@/components/ItemForm";
import type { Item } from "@/types/item";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  return <ItemForm mode="edit" item={data as Item} />;
}
