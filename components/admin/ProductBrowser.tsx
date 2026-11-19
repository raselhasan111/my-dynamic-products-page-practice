"use client";

import { useState, type ReactNode } from "react";

export type ProductGroup = {
  id: string;
  title: string;
  warn?: boolean;
  items: { key: string; search: string; node: ReactNode }[];
};

const bn = (n: number) => n.toLocaleString("bn-BD");

// Search box + collapsible category groups + a collapsed "new product" form.
export default function ProductBrowser({ groups, newForm }: { groups: ProductGroup[]; newForm: ReactNode }) {
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const q = query.trim().toLowerCase();

  const visible = groups
    .map((g) => ({ ...g, items: q ? g.items.filter((i) => i.search.includes(q)) : g.items }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <div className="sticky top-12 z-10 bg-white py-2">
        <input
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="পণ্য বা ক্যাটাগরি খুঁজুন…"
          aria-label="পণ্য খুঁজুন"
          className="h-11 w-full rounded border border-gray-400 px-3 text-base"
        />
      </div>

      {newForm && (
        <details className="mb-2 rounded border border-green-700">
          <summary className="min-h-11 cursor-pointer px-3 py-2.5 font-semibold text-green-800">+ নতুন পণ্য</summary>
          <div className="px-3 pb-3">{newForm}</div>
        </details>
      )}

      {visible.length === 0 && <p className="py-4 text-sm text-gray-600">কোনো পণ্য পাওয়া যায়নি</p>}

      {visible.map((g) => (
        <details
          key={g.id}
          open={q !== "" || openIds.has(g.id)}
          onToggle={(e) => {
            if (q !== "") return; // while searching, groups are forced open
            const isOpen = e.currentTarget.open;
            setOpenIds((prev) => {
              if (prev.has(g.id) === isOpen) return prev;
              const next = new Set(prev);
              if (isOpen) next.add(g.id);
              else next.delete(g.id);
              return next;
            });
          }}
          className="border-b border-gray-200"
        >
          <summary
            className={`min-h-12 cursor-pointer py-3 font-semibold ${g.warn ? "text-red-700" : "text-green-800"}`}
          >
            {g.title} ({bn(g.items.length)})
          </summary>
          <div className="divide-y divide-gray-100 pb-2">
            {g.items.map((i) => (
              <div key={i.key}>{i.node}</div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
