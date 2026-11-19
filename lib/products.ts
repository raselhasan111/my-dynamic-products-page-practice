import { cacheLife, cacheTag } from "next/cache";
import { readSheet } from "./sheets";
import type { Product, ProductData, SheetData } from "./types";

// Public read path. The Google Sheet is the database; admin changes call updateTag("products")
// so they show immediately, while edits made directly in the sheet appear within about a minute.
export async function getProductData(): Promise<ProductData> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");
  try {
    return toProductData(await readSheet());
  } catch (e) {
    console.error("sheet read failed:", e instanceof Error ? e.message : "unknown");
    return { updatedAt: "", products: [] };
  }
}

// Joins the three tabs into display rows, ordered by category `sort` then sheet row order.
// Products whose category was removed are skipped.
export function toProductData({ categories, units, products }: SheetData): ProductData {
  const unitName = new Map(units.map((u) => [u.id, u.name_bn]));
  const out: Product[] = [];
  for (const c of categories) {
    for (const p of products) {
      if (p.category_id !== c.id) continue;
      out.push({
        id: p.id,
        name_bn: p.name_bn,
        name_en: p.name_en || p.name_bn,
        category_bn: c.name_bn,
        category_en: c.name_en || c.name_bn,
        unit_bn: unitName.get(p.unit_id) ?? "",
        price: p.price,
      });
    }
  }
  const updatedAt = products.map((p) => p.updated_at).filter(Boolean).sort().at(-1) ?? "";
  return { updatedAt, products: out };
}
