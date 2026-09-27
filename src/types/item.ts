export type Item = {
  id: string;
  barcode: string | null;
  name: string;
  category: string | null;
  quantity: number;
  unit: string | null;
  low_stock_threshold: number | null;
  location: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type ItemInput = {
  barcode: string | null;
  name: string;
  category: string | null;
  quantity: number;
  unit: string | null;
  low_stock_threshold: number | null;
  location: string | null;
  memo: string | null;
};

export function stockStatus(item: Item): "out" | "low" | "ok" {
  if (item.quantity <= 0) return "out";
  if (
    item.low_stock_threshold !== null &&
    item.quantity <= item.low_stock_threshold
  ) {
    return "low";
  }
  return "ok";
}
