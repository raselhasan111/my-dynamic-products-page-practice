"use client";

import { useState, type ReactNode } from "react";

const TABS = [
  { key: "products", label: "পণ্য" },
  { key: "categories", label: "ক্যাটাগরি" },
  { key: "units", label: "একক" },
] as const;

type Key = (typeof TABS)[number]["key"];

// Sticky tab bar + one section at a time. Hidden sections stay mounted so typed values are kept.
export default function AdminTabs({ panels }: { panels: Record<Key, ReactNode> }) {
  const [active, setActive] = useState<Key>("products");

  return (
    <>
      <div role="tablist" className="sticky top-0 z-10 flex border-b border-gray-300 bg-white">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            id={`tab-${t.key}`}
            aria-selected={active === t.key}
            aria-controls={`panel-${t.key}`}
            onClick={() => {
              setActive(t.key);
              window.scrollTo({ top: 0 });
            }}
            className={`min-h-12 flex-1 border-b-4 text-base font-bold ${
              active === t.key ? "border-green-700 text-green-800" : "border-transparent text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {TABS.map((t) => (
        <div
          key={t.key}
          role="tabpanel"
          id={`panel-${t.key}`}
          aria-labelledby={`tab-${t.key}`}
          hidden={active !== t.key}
        >
          {panels[t.key]}
        </div>
      ))}
    </>
  );
}
