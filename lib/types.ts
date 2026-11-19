export type Lang = "bn" | "en";

export type Product = {
  name_bn: string;
  name_en: string;
  category_bn: string;
  category_en: string;
  unit_bn: string;
  price: number;
};

export type ProductData = {
  updatedAt: string; // YYYY-MM-DD
  products: Product[];
};
