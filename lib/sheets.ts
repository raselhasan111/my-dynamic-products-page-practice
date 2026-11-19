import "server-only";
import { randomUUID } from "node:crypto";
import { JWT } from "google-auth-library";
import type { Category, ProductRow, SheetData, Unit } from "./types";

// Google Sheet used as the database. Three tabs, row 1 = headers.
export const TABS = {
  categories: { name: "categories", headers: ["id", "name_bn", "name_en", "sort"] },
  units: { name: "units", headers: ["id", "name_bn", "name_en"] },
  products: {
    name: "products",
    headers: ["id", "category_id", "name_bn", "name_en", "unit_id", "price", "updated_at"],
  },
} as const;
export type TabKey = keyof typeof TABS;

const DEFAULT_UNITS = [
  ["কেজি", "kg"],
  ["গ্রাম", "gm"],
  ["লিটার", "L"],
  ["মিলি", "ml"],
  ["পিস", "pcs"],
  ["প্যাকেট", "packet"],
  ["ডজন", "dozen"],
  ["হালি", "4 pcs"],
  ["বস্তা", "sack"],
];

type Cell = string | number;
type Grid = Cell[][];

function config() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!sheetId || !email || !key) throw new SheetConfigError();
  return { sheetId, email, key };
}

export class SheetConfigError extends Error {
  constructor() {
    super("Google Sheet environment variables are missing");
  }
}

let client: JWT | undefined;
function auth() {
  const { email, key } = config();
  client ??= new JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  return client;
}

async function api<T = unknown>(path: string, init: { method?: string; data?: unknown } = {}): Promise<T> {
  const { sheetId } = config();
  const res = await auth().request<T>({
    url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}${path}`,
    method: (init.method ?? "GET") as "GET" | "POST" | "PUT",
    data: init.data,
  });
  return res.data;
}

export const newId = () => randomUUID().replace(/-/g, "").slice(0, 10);

const range = (tab: TabKey, a1: string) => encodeURIComponent(`${TABS[tab].name}!${a1}`);
const lastCol = (tab: TabKey) => String.fromCharCode(64 + TABS[tab].headers.length);

// ---------- parsing (pure) ----------
const str = (v: unknown) => (v === undefined || v === null ? "" : String(v).trim());

export function parseCategories(rows: Grid): Category[] {
  return rows
    .map((r) => ({ id: str(r[0]), name_bn: str(r[1]), name_en: str(r[2]), sort: Number(r[3]) || 0 }))
    .filter((c) => c.id && c.name_bn)
    .sort((a, b) => a.sort - b.sort);
}

export function parseUnits(rows: Grid): Unit[] {
  return rows
    .map((r) => ({ id: str(r[0]), name_bn: str(r[1]), name_en: str(r[2]) }))
    .filter((u) => u.id && u.name_bn);
}

export function parseProducts(rows: Grid): ProductRow[] {
  const out: ProductRow[] = [];
  for (const r of rows) {
    const price = typeof r[5] === "number" ? r[5] : Number(str(r[5]));
    const p = {
      id: str(r[0]),
      category_id: str(r[1]),
      name_bn: str(r[2]),
      name_en: str(r[3]),
      unit_id: str(r[4]),
      price,
      updated_at: str(r[6]),
    };
    if (p.id && p.name_bn && p.category_id && Number.isFinite(price)) out.push(p);
  }
  return out;
}

// ---------- reads ----------
type BatchGet = { valueRanges?: { values?: Grid }[] };

export async function readSheet(): Promise<SheetData> {
  const ranges = (Object.keys(TABS) as TabKey[])
    .map((t) => `ranges=${range(t, `A2:${lastCol(t)}`)}`)
    .join("&");
  let data: BatchGet;
  try {
    data = await api<BatchGet>(`/values:batchGet?${ranges}&valueRenderOption=UNFORMATTED_VALUE`);
  } catch (e) {
    // A missing tab (sheet not set up yet) is an HTTP 400: treat as empty.
    const err = e as { status?: number; response?: { status?: number } };
    if ((err.response?.status ?? err.status) === 400) {
      return { categories: [], units: [], products: [] };
    }
    throw e;
  }
  const v = data.valueRanges ?? [];
  return {
    categories: parseCategories(v[0]?.values ?? []),
    units: parseUnits(v[1]?.values ?? []),
    products: parseProducts(v[2]?.values ?? []),
  };
}

// ---------- setup ----------
type Meta = { sheets?: { properties: { sheetId: number; title: string } }[] };

async function tabIds(): Promise<Record<string, number>> {
  const meta = await api<Meta>("?fields=sheets.properties(sheetId,title)");
  return Object.fromEntries((meta.sheets ?? []).map((s) => [s.properties.title, s.properties.sheetId]));
}

// Creates missing tabs, headers, and the default units. Safe to run repeatedly.
export async function ensureTabs() {
  const ids = await tabIds();
  const missing = (Object.keys(TABS) as TabKey[]).filter((t) => !(TABS[t].name in ids));
  if (missing.length) {
    await api(":batchUpdate", {
      method: "POST",
      data: { requests: missing.map((t) => ({ addSheet: { properties: { title: TABS[t].name } } })) },
    });
  }
  const keys = Object.keys(TABS) as TabKey[];
  const got = await api<BatchGet>(`/values:batchGet?${keys.map((t) => `ranges=${range(t, "A1:A1")}`).join("&")}`);
  for (const [i, t] of keys.entries()) {
    if (got.valueRanges?.[i]?.values?.[0]?.[0]) continue; // header exists
    await api(`/values/${range(t, "A1")}?valueInputOption=RAW`, {
      method: "PUT",
      data: { values: [[...TABS[t].headers]] },
    });
    if (t === "units") {
      await appendRows("units", DEFAULT_UNITS.map(([bn, en]) => [newId(), bn, en]));
    }
  }
}

// ---------- writes (RAW: text such as "=SUM(A1)" is stored as plain text, never as a formula) ----------
export async function appendRows(tab: TabKey, rows: Grid) {
  await api(`/values/${range(tab, "A1")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    data: { values: rows },
  });
}

async function rowNumber(tab: TabKey, id: string): Promise<number | null> {
  const col = await api<{ values?: string[][] }>(`/values/${range(tab, "A2:A")}`);
  const idx = (col.values ?? []).findIndex((r) => r[0] === id);
  return idx === -1 ? null : idx + 2; // +1 header, +1 for 1-based rows
}

// Looks the row up by id right before writing, so a stale row number is never used.
export async function updateRowById(tab: TabKey, id: string, values: Cell[]): Promise<boolean> {
  const row = await rowNumber(tab, id);
  if (!row) return false;
  await api(`/values/${range(tab, `A${row}:${lastCol(tab)}${row}`)}?valueInputOption=RAW`, {
    method: "PUT",
    data: { values: [[id, ...values]] },
  });
  return true;
}

export async function deleteRowById(tab: TabKey, id: string): Promise<boolean> {
  const row = await rowNumber(tab, id);
  if (!row) return false;
  const sheetId = (await tabIds())[TABS[tab].name];
  await api(":batchUpdate", {
    method: "POST",
    data: {
      requests: [
        { deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: row - 1, endIndex: row } } },
      ],
    },
  });
  return true;
}
