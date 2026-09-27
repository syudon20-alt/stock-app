"use client";

import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/": "在庫一覧",
  "/scan": "スキャン",
  "/items/new": "手動で追加",
};

export default function Header() {
  const pathname = usePathname();

  const title =
    TITLES[pathname] ??
    (pathname.startsWith("/items/") ? "編集" : "ストックだな");

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur">
      <h1 className="text-lg font-bold text-neutral-900">{title}</h1>
    </header>
  );
}
