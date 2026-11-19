export type Lang = "bn" | "en";

// ---- Rows as stored in the Google Sheet (admin side) ----
export type Category = { id: string; name_bn: string; name_en: string; sort: number };
export type Unit = { id: string; name_bn: string; name_en: string };
export type ProductRow = {
  id: string;
  category_id: string;
  name_bn: string;
  name_en: string;
  unit_id: string;
  price: number;
  updated_at: string; // YYYY-MM-DD
};
export type SheetData = { categories: Category[]; units: Unit[]; products: ProductRow[] };

// ---- Shape used by the public page ----
export type Product = {
  id: string;
  name_bn: string;
  name_en: string;
  category_bn: string;
  category_en: string;
  unit_bn: string;
  price: number;
};

export type ProductData = {
  updatedAt: string; // YYYY-MM-DD, empty when there are no products
  products: Product[];
};
