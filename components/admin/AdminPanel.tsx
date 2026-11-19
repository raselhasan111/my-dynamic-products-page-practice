import Link from "next/link";
import {
  logout,
  deleteCategory,
  deleteProduct,
  deleteUnit,
  saveCategory,
  saveProduct,
  saveUnit,
} from "@/app/admin/actions";
import type { SheetData } from "@/lib/types";
import AdminForm from "./AdminForm";
import AdminTabs from "./AdminTabs";
import ProductBrowser from "./ProductBrowser";

const input = "h-11 w-full rounded border border-gray-400 px-3 text-base";
const cell = "h-11 rounded border border-gray-400 px-2 text-base";
const label = "mb-1 block text-xs text-gray-600";
const sectionTitle = "border-b-2 border-black pb-1 text-lg font-bold";

export default function AdminPanel({ data }: { data: SheetData }) {
  const { categories, units, products } = data;
  const catOptions = categories.map((c) => (
    <option key={c.id} value={c.id}>
      {c.name_bn}
    </option>
  ));
  const unitOptions = units.map((u) => (
    <option key={u.id} value={u.id}>
      {u.name_bn}
    </option>
  ));
  const orphans = products.filter(
    (p) => !categories.some((c) => c.id === p.category_id),
  );

  const productRow = (p: (typeof products)[number]) => ({
    key: `${p.id}-${p.updated_at}-${p.price}`,
    search: `${p.name_bn} ${p.name_en} ${categories.find((c) => c.id === p.category_id)?.name_bn ?? ""}`.toLowerCase(),
    node: (
      <AdminForm
        id={p.id}
        saveAction={saveProduct}
        deleteAction={deleteProduct}
        confirmText={`“${p.name_bn}” মুছে ফেলবেন?`}
        fields={
          <>
            <span aria-hidden>৳</span>
            <input
              name="price"
              inputMode="decimal"
              defaultValue={p.price}
              required
              aria-label="দাম (৳)"
              className={`${cell} w-24 shrink-0`}
            />
            <select name="unit_id" defaultValue={p.unit_id} aria-label="একক" className={`${cell} min-w-0 flex-1`}>
              {unitOptions}
            </select>
          </>
        }
        more={
          <>
            <label className={label}>বাংলা নাম</label>
            <input name="name_bn" defaultValue={p.name_bn} required className={input} />
            <label className={`${label} mt-2`}>ইংরেজি নাম</label>
            <input name="name_en" defaultValue={p.name_en} className={input} />
            <label className={`${label} mt-2`}>ক্যাটাগরি</label>
            <select name="category_id" defaultValue={p.category_id} className={input}>
              {catOptions}
            </select>
          </>
        }
      >
        <div className="mb-1 font-bold">{p.name_bn}</div>
      </AdminForm>
    ),
  });

  const groups = [
    ...categories.map((c) => ({
      id: c.id,
      title: c.name_bn,
      items: products.filter((p) => p.category_id === c.id).map(productRow),
    })),
    ...(orphans.length
      ? [{ id: "orphans", title: "ক্যাটাগরি ছাড়া (সাইটে দেখাচ্ছে না)", warn: true, items: orphans.map(productRow) }]
      : []),
  ].filter((g) => g.items.length > 0);

  const newProductForm =
    categories.length === 0 || units.length === 0 ? null : (
      <AdminForm saveAction={saveProduct} saveLabel="পণ্য যোগ করুন">
        <label className={label}>ক্যাটাগরি</label>
        <select name="category_id" required className={input}>
          {catOptions}
        </select>
        <label className={`${label} mt-2`}>বাংলা নাম</label>
        <input name="name_bn" required className={input} />
        <label className={`${label} mt-2`}>ইংরেজি নাম (ঐচ্ছিক)</label>
        <input name="name_en" className={input} />
        <div className="mt-2 flex gap-2">
          <div className="w-32">
            <label className={label}>দাম (৳)</label>
            <input name="price" inputMode="decimal" required className={input} />
          </div>
          <div className="flex-1">
            <label className={label}>একক</label>
            <select name="unit_id" required className={input}>
              {unitOptions}
            </select>
          </div>
        </div>
      </AdminForm>
    );

  return (
    <div className="mx-auto max-w-xl px-4 pb-12">
      <div className="flex items-center justify-between gap-3 py-4">
        <h1 className="text-xl font-bold">অ্যাডমিন</h1>
        <div className="flex gap-2">
          <Link
            href="/"
            className="flex min-h-11 items-center rounded border border-gray-400 px-3 text-sm"
          >
            সাইট দেখুন
          </Link>
          <form action={logout}>
            <button className="min-h-11 rounded border border-gray-400 px-3 text-sm">
              লগ আউট
            </button>
          </form>
        </div>
      </div>

      <AdminTabs
        panels={{
          products: (
            <section className="mt-2">
              {newProductForm ? (
                <ProductBrowser groups={groups} newForm={newProductForm} />
              ) : (
                <p className="py-3 text-sm text-gray-600">
                  পণ্য যোগ করতে আগে “ক্যাটাগরি” ও “একক” ট্যাবে অন্তত একটা করে যোগ করুন।
                </p>
              )}
            </section>
          ),
          categories: (
            <section className="mt-6">
              <h2 className={sectionTitle}>ক্যাটাগরি</h2>
              <div className="divide-y divide-gray-200">
                {categories.map((c) => (
                  <AdminForm
                    key={`${c.id}-${c.name_bn}-${c.name_en}-${c.sort}`}
                    id={c.id}
                    saveAction={saveCategory}
                    deleteAction={deleteCategory}
                    confirmText={`“${c.name_bn}” ক্যাটাগরি মুছে ফেলবেন?`}
                  >
                    <label className={label}>বাংলা নাম</label>
                    <input
                      name="name_bn"
                      defaultValue={c.name_bn}
                      required
                      className={input}
                    />
                    <label className={`${label} mt-2`}>ইংরেজি নাম</label>
                    <input
                      name="name_en"
                      defaultValue={c.name_en}
                      className={input}
                    />
                    <label className={`${label} mt-2`}>
                      ক্রম (ছোট সংখ্যা আগে দেখাবে)
                    </label>
                    <input
                      name="sort"
                      inputMode="numeric"
                      defaultValue={c.sort}
                      className={input}
                    />
                  </AdminForm>
                ))}
              </div>
              <h3 className="mt-3 font-semibold">নতুন ক্যাটাগরি</h3>
              <AdminForm saveAction={saveCategory} saveLabel="ক্যাটাগরি যোগ করুন">
                <label className={label}>বাংলা নাম</label>
                <input name="name_bn" required className={input} />
                <label className={`${label} mt-2`}>ইংরেজি নাম (ঐচ্ছিক)</label>
                <input name="name_en" className={input} />
              </AdminForm>
            </section>
          ),
          units: (
            <section className="mt-6">
              <h2 className={sectionTitle}>একক (কেজি, গ্রাম, লিটার …)</h2>
              <div className="divide-y divide-gray-200">
                {units.map((u) => (
                  <AdminForm
                    key={`${u.id}-${u.name_bn}-${u.name_en}`}
                    id={u.id}
                    saveAction={saveUnit}
                    deleteAction={deleteUnit}
                    confirmText={`“${u.name_bn}” একক মুছে ফেলবেন?`}
                  >
                    <label className={label}>বাংলা নাম</label>
                    <input
                      name="name_bn"
                      defaultValue={u.name_bn}
                      required
                      className={input}
                    />
                    <label className={`${label} mt-2`}>ইংরেজি নাম</label>
                    <input
                      name="name_en"
                      defaultValue={u.name_en}
                      className={input}
                    />
                  </AdminForm>
                ))}
              </div>
              <h3 className="mt-3 font-semibold">নতুন একক</h3>
              <AdminForm saveAction={saveUnit} saveLabel="একক যোগ করুন">
                <label className={label}>বাংলা নাম</label>
                <input name="name_bn" required className={input} />
                <label className={`${label} mt-2`}>ইংরেজি নাম (ঐচ্ছিক)</label>
                <input name="name_en" className={input} />
              </AdminForm>
            </section>
          ),
        }}
      />
    </div>
  );
}
