"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Item, ItemInput } from "@/types/item";

type Props = {
  mode: "create" | "edit";
  item?: Item;
  initialBarcode?: string;
  initialName?: string;
};

export default function ItemForm({ mode, item, initialBarcode, initialName }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<ItemInput>({
    barcode: item?.barcode ?? initialBarcode ?? null,
    name: item?.name ?? initialName ?? "",
    category: item?.category ?? null,
    quantity: item?.quantity ?? 1,
    unit: item?.unit ?? null,
    low_stock_threshold: item?.low_stock_threshold ?? null,
    location: item?.location ?? null,
    memo: item?.memo ?? null,
  });
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const set = <K extends keyof ItemInput>(key: K, value: ItemInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrorMessage("商品名は必須です");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    const payload = {
      ...form,
      category: form.category?.trim() || null,
      unit: form.unit?.trim() || null,
      location: form.location?.trim() || null,
      memo: form.memo?.trim() || null,
      barcode: form.barcode?.trim() || null,
    };

    const { error } =
      mode === "create"
        ? await supabase.from("items").insert(payload)
        : await supabase.from("items").update(payload).eq("id", item!.id);

    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm(`「${item.name}」を削除しますか？`)) return;

    setSaving(true);
    const { error } = await supabase.from("items").delete().eq("id", item.id);
    setSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <Field label="商品名 *">
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="数量">
          <input
            type="number"
            step="any"
            value={form.quantity}
            onChange={(e) => set("quantity", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="単位">
          <input
            type="text"
            placeholder="個・本・パックなど"
            value={form.unit ?? ""}
            onChange={(e) => set("unit", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="カテゴリ">
        <input
          type="text"
          placeholder="食品・日用品など"
          value={form.category ?? ""}
          onChange={(e) => set("category", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="保管場所">
        <input
          type="text"
          placeholder="キッチン棚・冷凍庫など"
          value={form.location ?? ""}
          onChange={(e) => set("location", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="残りわずかの目安（この数以下で警告）">
        <input
          type="number"
          step="any"
          value={form.low_stock_threshold ?? ""}
          onChange={(e) =>
            set(
              "low_stock_threshold",
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
          className={inputClass}
        />
      </Field>

      <Field label="バーコード">
        <input
          type="text"
          value={form.barcode ?? ""}
          onChange={(e) => set("barcode", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="メモ">
        <textarea
          value={form.memo ?? ""}
          onChange={(e) => set("memo", e.target.value)}
          rows={2}
          className={inputClass}
        />
      </Field>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {mode === "create" ? "登録する" : "保存する"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="rounded-lg border border-red-200 px-4 py-2.5 font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            削除
          </button>
        )}
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-neutral-700">
        {label}
      </label>
      {children}
    </div>
  );
}
