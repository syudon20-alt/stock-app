"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Location } from "@/types/location";

export default function LocationManager({
  initialLocations,
}: {
  initialLocations: Location[];
}) {
  const [locations, setLocations] = useState(initialLocations);
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSaving(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("locations")
      .insert({ name: trimmed })
      .select()
      .single();

    setSaving(false);

    if (error) {
      setErrorMessage(
        error.code === "23505"
          ? "同じ名前の場所が既に登録されています"
          : error.message
      );
      return;
    }

    setLocations((prev) =>
      [...prev, data as Location].sort((a, b) => a.name.localeCompare(b.name, "ja"))
    );
    setName("");
  };

  const handleDelete = async (location: Location) => {
    if (!confirm(`「${location.name}」を削除しますか？`)) return;

    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", location.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setLocations((prev) => prev.filter((l) => l.id !== location.id));
  };

  return (
    <div className="p-4">
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="新しい場所名（例: 冷凍庫）"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          追加
        </button>
      </form>

      {errorMessage && (
        <p className="mb-3 text-sm text-red-600">{errorMessage}</p>
      )}

      {locations.length === 0 ? (
        <p className="mt-6 text-center text-sm text-neutral-400">
          まだ場所が登録されていません
        </p>
      ) : (
        <ul className="space-y-2">
          {locations.map((location) => (
            <li
              key={location.id}
              className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm"
            >
              <span className="text-neutral-900">{location.name}</span>
              <button
                onClick={() => handleDelete(location)}
                className="text-xs font-medium text-red-500 hover:text-red-700"
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
