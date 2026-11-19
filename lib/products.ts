import { cacheLife } from "next/cache";
import raw from "@/data/products.json";
import type { Product, ProductData } from "./types";

// Single data-access point. To switch to the Google Sheet later, replace the
// body with a fetch of process.env.PRODUCTS_SHEET_CSV_URL (the sheet's
// "Publish to web -> CSV" link), parse rows into Product, and skip rows with
// a missing name or a non-numeric price.
export async function getProductData(): Promise<ProductData> {
  "use cache";
  cacheLife("hours");
  return raw as ProductData;
}

export function groupByCategory(products: Product[]) {
  const map = new Map<string, { category_bn: string; category_en: string; items: Product[] }>();
  for (const p of products) {
    const g = map.get(p.category_bn) ?? { category_bn: p.category_bn, category_en: p.category_en, items: [] };
    g.items.push(p);
    map.set(p.category_bn, g);
  }
  return [...map.values()];
}
