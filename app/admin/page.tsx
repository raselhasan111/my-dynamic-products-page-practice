import type { Metadata } from "next";
import { Suspense } from "react";
import { logout } from "@/app/admin/actions";
import { isAdmin } from "@/lib/admin-auth";
import { ensureTabs, readSheet, SheetConfigError } from "@/lib/sheets";
import type { SheetData } from "@/lib/types";
import AdminPanel from "@/components/admin/AdminPanel";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "অ্যাডমিন",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="flex-1">
      <Suspense fallback={<p className="px-4 py-8 text-center text-gray-600">লোড হচ্ছে…</p>}>
        <AdminContent />
      </Suspense>
    </main>
  );
}

// Reads cookies, so it runs at request time (inside Suspense, as Cache Components requires).
async function AdminContent() {
  if (!(await isAdmin())) return <LoginForm />;
  let data: SheetData;
  try {
    await ensureTabs();
    data = await readSheet();
  } catch (e) {
    console.error("admin load failed:", e instanceof Error ? e.message : "unknown");
    return (
      <div className="mx-auto max-w-xl px-4 py-8">
        <p className="text-red-700">
          {e instanceof SheetConfigError
            ? "Google Sheet সংযোগ করা হয়নি (.env.local এ GOOGLE_* ভ্যালু দিন)।"
            : "Google Sheet পড়া যায়নি। শিটটি সার্ভিস অ্যাকাউন্টের সাথে Editor হিসেবে শেয়ার করা আছে কি না দেখুন।"}
        </p>
        <form action={logout} className="mt-4">
          <button className="min-h-11 rounded border border-gray-400 px-4 text-sm">লগ আউট</button>
        </form>
      </div>
    );
  }
  return <AdminPanel data={data} />;
}
