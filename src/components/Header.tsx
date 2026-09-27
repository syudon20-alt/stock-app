"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/": "在庫一覧",
  "/scan": "スキャン",
  "/items/new": "手動で追加",
  "/locations": "保管場所の管理",
};

export default function Header() {
  const pathname = usePathname();

  const title =
    TITLES[pathname] ??
    (pathname.startsWith("/items/") ? "編集" : "ストックだな");

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur">
      <h1 className="text-lg font-bold text-neutral-900">{title}</h1>
      {pathname !== "/locations" && (
        <Link
          href="/locations"
          className="text-xs font-medium text-neutral-400 hover:text-neutral-600"
        >
          場所を管理
        </Link>
      )}
    </header>
  );
}
