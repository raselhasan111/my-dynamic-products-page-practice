"use client";

export default function ReloadButton({ label }: { label: string }) {
  const reload = async () => {
    // Drop any offline copies first so the page is fetched fresh from the server.
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch {}
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={reload}
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded border border-gray-400 text-xl"
    >
      ↻
    </button>
  );
}
