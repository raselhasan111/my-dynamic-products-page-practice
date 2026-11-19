"use server";

import { updateTag } from "next/cache";
import {
  clearFails,
  clearSession,
  codeMatches,
  createSession,
  isBlocked,
  recordFail,
  requireAdmin,
} from "@/lib/admin-auth";
import { appendRows, deleteRowById, newId, readSheet, updateRowById } from "@/lib/sheets";
import type { ActionState } from "./state";

const ok = (message: string, reset = false): ActionState => ({ ok: true, message, reset });
const fail = (message: string): ActionState => ({ ok: false, message });
const GENERIC = "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।";

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }); // YYYY-MM-DD

function field(fd: FormData, key: string, max: number, required = true): string | null {
  const v = String(fd.get(key) ?? "").trim();
  if (required && !v) return null;
  return v.length > max ? null : v;
}

function parsePrice(fd: FormData): number | null {
  const raw = String(fd.get("price") ?? "")
    .trim()
    .replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)));
  if (!/^\d+(\.\d{1,2})?$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 0 && n <= 1_000_000 ? n : null;
}

// Runs an admin action: re-checks the session, catches errors, refreshes the public page cache.
async function guarded(fn: () => Promise<ActionState>): Promise<ActionState> {
  try {
    await requireAdmin();
  } catch {
    return fail("আবার লগইন করুন।");
  }
  try {
    const result = await fn();
    if (result.ok) updateTag("products");
    return result;
  } catch (e) {
    console.error("admin action failed:", e instanceof Error ? e.message : "unknown");
    return fail(GENERIC);
  }
}

// ---------------- login / logout ----------------
export async function login(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    if (await isBlocked()) return fail("অনেকবার ভুল হয়েছে। ১৫ মিনিট পর আবার চেষ্টা করুন।");
    const code = String(fd.get("code") ?? "");
    if (!code || !codeMatches(code)) {
      await recordFail();
      return fail("কোডটি ঠিক নয়।");
    }
    await clearFails();
    await createSession();
    return ok("");
  } catch (e) {
    console.error("login failed:", e instanceof Error ? e.message : "unknown");
    return fail("অ্যাডমিন কোড সেট করা নেই।");
  }
}

export async function logout() {
  await clearSession();
}

// ---------------- categories ----------------
export async function saveCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const id = String(fd.get("id") ?? "");
    const bn = field(fd, "name_bn", 80);
    const en = field(fd, "name_en", 80, false);
    const sort = Number(String(fd.get("sort") ?? "0")) || 0;
    if (!bn || en === null) return fail("ক্যাটাগরির বাংলা নাম দিন (সর্বোচ্চ ৮০ অক্ষর)।");
    const { categories } = await readSheet();
    if (categories.some((c) => c.id !== id && c.name_bn === bn)) return fail("এই নামে ক্যাটাগরি আগেই আছে।");
    if (id) {
      if (!categories.some((c) => c.id === id)) return fail("ক্যাটাগরি পাওয়া যায়নি।");
      await updateRowById("categories", id, [bn, en, sort]);
      return ok("সেভ হয়েছে।");
    }
    const next = categories.reduce((m, c) => Math.max(m, c.sort), 0) + 1;
    await appendRows("categories", [[newId(), bn, en, String(fd.get("sort") ?? "").trim() ? sort : next]]);
    return ok("ক্যাটাগরি যোগ হয়েছে।", true);
  });
}

export async function deleteCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const id = String(fd.get("id") ?? "");
    const { products } = await readSheet();
    if (products.some((p) => p.category_id === id)) return fail("এই ক্যাটাগরিতে পণ্য আছে, আগে পণ্যগুলো মুছুন বা সরান।");
    return (await deleteRowById("categories", id)) ? ok("মুছে ফেলা হয়েছে।") : fail("ক্যাটাগরি পাওয়া যায়নি।");
  });
}

// ---------------- units ----------------
export async function saveUnit(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const id = String(fd.get("id") ?? "");
    const bn = field(fd, "name_bn", 30);
    const en = field(fd, "name_en", 30, false);
    if (!bn || en === null) return fail("এককের বাংলা নাম দিন (সর্বোচ্চ ৩০ অক্ষর)।");
    const { units } = await readSheet();
    if (units.some((u) => u.id !== id && u.name_bn === bn)) return fail("এই নামে একক আগেই আছে।");
    if (id) {
      if (!units.some((u) => u.id === id)) return fail("একক পাওয়া যায়নি।");
      await updateRowById("units", id, [bn, en]);
      return ok("সেভ হয়েছে।");
    }
    await appendRows("units", [[newId(), bn, en]]);
    return ok("একক যোগ হয়েছে।", true);
  });
}

export async function deleteUnit(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const id = String(fd.get("id") ?? "");
    const { products } = await readSheet();
    if (products.some((p) => p.unit_id === id)) return fail("কোনো পণ্য এই একক ব্যবহার করছে, তাই মোছা যাবে না।");
    return (await deleteRowById("units", id)) ? ok("মুছে ফেলা হয়েছে।") : fail("একক পাওয়া যায়নি।");
  });
}

// ---------------- products ----------------
export async function saveProduct(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const id = String(fd.get("id") ?? "");
    const bn = field(fd, "name_bn", 80);
    const en = field(fd, "name_en", 80, false);
    const price = parsePrice(fd);
    const categoryId = String(fd.get("category_id") ?? "");
    const unitId = String(fd.get("unit_id") ?? "");
    if (!bn || en === null) return fail("পণ্যের বাংলা নাম দিন (সর্বোচ্চ ৮০ অক্ষর)।");
    if (price === null) return fail("দাম সঠিক নয় (০ থেকে ১০,০০,০০০, সর্বোচ্চ ২ দশমিক)।");
    const { categories, units, products } = await readSheet();
    if (!categories.some((c) => c.id === categoryId)) return fail("ক্যাটাগরি বেছে নিন।");
    if (!units.some((u) => u.id === unitId)) return fail("একক বেছে নিন।");
    const row = [categoryId, bn, en, unitId, price, today()];
    if (id) {
      if (!products.some((p) => p.id === id)) return fail("পণ্য পাওয়া যায়নি।");
      await updateRowById("products", id, row);
      return ok("সেভ হয়েছে।");
    }
    await appendRows("products", [[newId(), ...row]]);
    return ok("পণ্য যোগ হয়েছে।", true);
  });
}

export async function deleteProduct(_: ActionState, fd: FormData): Promise<ActionState> {
  return guarded(async () => {
    const id = String(fd.get("id") ?? "");
    return (await deleteRowById("products", id)) ? ok("মুছে ফেলা হয়েছে।") : fail("পণ্য পাওয়া যায়নি।");
  });
}
