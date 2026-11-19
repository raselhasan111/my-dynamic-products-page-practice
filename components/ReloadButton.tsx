"use client";

import { useState } from "react";

export default function ReloadButton({ label }: { label: string }) {
  const [spinning, setSpinning] = useState(false);

  const reload = async () => {
    if (spinning) return;
    setSpinning(true);
    const minSpin = new Promise((r) => setTimeout(r, 1000)); // one full smooth turn before reloading
    // Drop any offline copies so the page is fetched fresh from the server.
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch {}
    await minSpin;
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={reload}
      disabled={spinning}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded border border-gray-400 text-xl"
    >
      <span className={`inline-block ${spinning ? "animate-[spin_1s_ease-in-out]" : ""}`}>↻</span>
    </button>
  );
}
