"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { stockStatus, type Item } from "@/types/item";

type Filter = "all" | "low" | "out";
type GroupBy = "category" | "location";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "low", label: "残りわずか" },
  { key: "out", label: "在庫切れ" },
];

const GROUP_OPTIONS: { key: GroupBy; label: string }[] = [
  { key: "category", label: "カテゴリ別" },
  { key: "location", label: "場所別" },
];

export default function ItemList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("category");

  const updateQuantity = async (item: Item, nextQuantity: number) => {
    const clamped = Math.max(0, nextQuantity);
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, quantity: clamped } : i))
    );
    await supabase.from("items").update({ quantity: clamped }).eq("id", item.id);
  };

  const filtered = items.filter((item) => {
    if (filter === "low" && stockStatus(item) !== "low") return false;
    if (filter === "out" && stockStatus(item) !== "out") return false;
    if (query.trim() && !item.name.toLowerCase().includes(query.trim().toLowerCase())) {
      return false;
    }
    return true;
  });

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const item of filtered) {
      const raw = groupBy === "category" ? item.category : item.location;
      const key = raw?.trim() || "未設定";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "ja"));
  }, [filtered, groupBy]);

  return (
    <div className="p-4">
      <input
        type="search"
        placeholder="商品名で検索"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />

      <div className="mb-3 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === f.key
                ? "bg-emerald-600 text-white"
                : "bg-neutral-200 text-neutral-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex gap-1 rounded-lg bg-neutral-100 p-1 text-sm">
        {GROUP_OPTIONS.map((g) => (
          <button
            key={g.key}
            onClick={() => setGroupBy(g.key)}
            className={`flex-1 rounded-md py-1.5 font-medium ${
              groupBy === g.key
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-500"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {grouped.length === 0 && (
        <p className="mt-10 text-center text-sm text-neutral-400">
          該当する在庫がありません
        </p>
      )}

      <div className="space-y-6">
        {grouped.map(([category, categoryItems]) => (
          <section key={category}>
            <h2 className="mb-2 text-xs font-bold text-neutral-400">
              {category}
            </h2>
            <ul className="space-y-2">
              {categoryItems.map((item) => {
                const status = stockStatus(item);
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
                  >
                    <Link
                      href={`/items/${item.id}`}
                      className="min-w-0 flex-1"
                    >
                      <p className="truncate font-medium text-neutral-900">
                        {item.name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-400">
                        {(() => {
                          const sub =
                            groupBy === "category" ? item.location : item.category;
                          return sub && <span>{sub}</span>;
                        })()}
                        {status === "out" && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 font-medium text-red-600">
                            在庫切れ
                          </span>
                        )}
                        {status === "low" && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-600">
                            残りわずか
                          </span>
                        )}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-lg font-bold text-neutral-600 active:bg-neutral-200"
                        aria-label="減らす"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-sm font-semibold text-neutral-900">
                        {item.quantity}
                        {item.unit && (
                          <span className="text-xs text-neutral-400">
                            {item.unit}
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700 active:bg-emerald-200"
                        aria-label="増やす"
                      >
                        ＋
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
