"use client";

import { useMemo, useState } from "react";
import type { Lang, Product } from "@/lib/types";
import { formatPrice } from "@/lib/i18n";

type Props = {
  products: Product[];
  lang: Lang;
  placeholder: string;
  clearLabel: string;
  noResults: string;
};

export default function ProductList({ products, lang, placeholder, clearLabel, noResults }: Props) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, { bn: string; en: string; items: Product[] }>();
    for (const p of products) {
      const catMatch = p.category_bn.toLowerCase().includes(q) || p.category_en.toLowerCase().includes(q);
      const nameMatch = p.name_bn.toLowerCase().includes(q) || p.name_en.toLowerCase().includes(q);
      if (q && !catMatch && !nameMatch) continue;
      const g = map.get(p.category_bn) ?? { bn: p.category_bn, en: p.category_en, items: [] };
      g.items.push(p);
      map.set(p.category_bn, g);
    }
    return [...map.values()];
  }, [products, query]);

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-2">
        <div className="relative mx-auto max-w-xl">
          <input
            type="text"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="h-12 w-full rounded border border-gray-400 px-3 pr-12 text-base"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={clearLabel}
              className="absolute right-0 top-0 h-12 w-12 text-xl"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-xl px-4">
        {groups.length === 0 && <p className="py-8 text-center text-gray-600">{noResults}</p>}
        {groups.map((g) => (
          <section key={g.bn} className="mt-5">
            <h2 className="border-b-2 border-black pb-1 text-lg font-bold">
              {lang === "bn" ? g.bn : g.en}
            </h2>
            <ul>
              {g.items.map((p) => (
                <li
                  key={p.id}
                  className="flex min-h-12 items-center justify-between gap-3 border-b border-gray-200 py-2"
                >
                  <div>
                    <div className="text-base">{p.name_bn}</div>
                    {lang === "en" && <div className="text-xs text-gray-600">{p.name_en}</div>}
                  </div>
                  <div className="whitespace-nowrap text-right font-bold">
                    {formatPrice(p.price)}{" "}
                    <span className="text-sm font-normal text-gray-600">/ {p.unit_bn}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
