"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { createClient } from "@/lib/supabase/client";
import type { Item } from "@/types/item";

const SCANNER_ELEMENT_ID = "barcode-scanner";

export default function BarcodeScanner() {
  const router = useRouter();
  const supabase = createClient();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  const [cameraError, setCameraError] = useState("");
  const [matchedItem, setMatchedItem] = useState<Item | null>(null);
  const [lookupBarcode, setLookupBarcode] = useState("");
  const [lookingUp, setLookingUp] = useState(false);

  const handleDecoded = useCallback(
    async (decodedText: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      await scannerRef.current?.pause(true);

      const { data } = await supabase
        .from("items")
        .select("*")
        .eq("barcode", decodedText)
        .maybeSingle();

      if (data) {
        setMatchedItem(data as Item);
        return;
      }

      setLookupBarcode(decodedText);
      setLookingUp(true);
      try {
        const res = await fetch(
          `/api/product-lookup?barcode=${encodeURIComponent(decodedText)}`
        );
        const result = await res.json();
        const params = new URLSearchParams({ barcode: decodedText });
        if (result.name) params.set("name", result.name);
        router.push(`/items/new?${params.toString()}`);
      } catch {
        router.push(`/items/new?barcode=${encodeURIComponent(decodedText)}`);
      }
    },
    [router, supabase]
  );

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
      formatsToSupport: undefined,
      verbose: false,
    });
    scannerRef.current = scanner;
    isProcessingRef.current = false;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 160 } },
        (decodedText) => {
          handleDecoded(decodedText);
        },
        undefined
      )
      .catch(() => {
        setCameraError(
          "カメラを起動できませんでした。カメラの利用を許可してください。"
        );
      });

    return () => {
      scanner.stop().catch(() => {});
      scanner.clear();
    };
  }, [handleDecoded]);

  const resumeScanning = async () => {
    setMatchedItem(null);
    setLookupBarcode("");
    setLookingUp(false);
    await scannerRef.current?.resume();
    isProcessingRef.current = false;
  };

  const adjustQuantity = async (delta: number) => {
    if (!matchedItem) return;
    const nextQuantity = Math.max(0, matchedItem.quantity + delta);
    setMatchedItem({ ...matchedItem, quantity: nextQuantity });
    await supabase
      .from("items")
      .update({ quantity: nextQuantity })
      .eq("id", matchedItem.id);
  };

  return (
    <div className="p-4">
      <div
        id={SCANNER_ELEMENT_ID}
        className="mx-auto overflow-hidden rounded-2xl bg-black"
      />

      {cameraError && (
        <p className="mt-3 text-center text-sm text-red-600">{cameraError}</p>
      )}

      {lookingUp && !matchedItem && (
        <div className="mt-4 rounded-xl bg-white p-4 text-center text-sm text-neutral-500 shadow-sm">
          商品情報を検索中です（{lookupBarcode}）...
        </div>
      )}

      {matchedItem && (
        <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-neutral-400">登録済みの商品です</p>
          <p className="mt-1 text-lg font-bold text-neutral-900">
            {matchedItem.name}
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <button
              onClick={() => adjustQuantity(-1)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-2xl font-bold text-neutral-600 active:bg-neutral-200"
            >
              −
            </button>
            <span className="w-16 text-center text-2xl font-bold text-neutral-900">
              {matchedItem.quantity}
              {matchedItem.unit && (
                <span className="text-sm text-neutral-400">
                  {matchedItem.unit}
                </span>
              )}
            </span>
            <button
              onClick={() => adjustQuantity(1)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700 active:bg-emerald-200"
            >
              ＋
            </button>
          </div>
          <button
            onClick={resumeScanning}
            className="mt-4 w-full rounded-lg bg-neutral-800 px-4 py-2.5 text-sm font-medium text-white"
          >
            スキャンを続ける
          </button>
        </div>
      )}
    </div>
  );
}
