import { NextResponse } from "next/server";

type LookupResult = {
  name: string | null;
  source: "openfoodfacts" | "yahoo" | null;
};

async function lookupOpenFoodFacts(barcode: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
        barcode
      )}.json`,
      { headers: { "User-Agent": "stock-dana-app" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === 1 && data.product) {
      return data.product.product_name_ja || data.product.product_name || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function lookupYahooShopping(barcode: string): Promise<string | null> {
  const appId = process.env.YAHOO_APP_ID;
  if (!appId) return null;

  try {
    const url = new URL(
      "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch"
    );
    url.searchParams.set("appid", appId);
    url.searchParams.set("jan_code", barcode);
    url.searchParams.set("results", "1");

    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = await res.json();
    const hit = data?.hits?.[0];
    return hit?.name ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get("barcode");

  if (!barcode) {
    return NextResponse.json(
      { error: "barcodeパラメータが必要です" },
      { status: 400 }
    );
  }

  const result: LookupResult = { name: null, source: null };

  const offName = await lookupOpenFoodFacts(barcode);
  if (offName) {
    result.name = offName;
    result.source = "openfoodfacts";
    return NextResponse.json(result);
  }

  const yahooName = await lookupYahooShopping(barcode);
  if (yahooName) {
    result.name = yahooName;
    result.source = "yahoo";
    return NextResponse.json(result);
  }

  return NextResponse.json(result);
}
