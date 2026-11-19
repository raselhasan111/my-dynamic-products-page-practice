import { getProductData } from "@/lib/products";
import { formatDate, labels } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import Header from "./Header";
import Footer from "./Footer";
import ProductList from "./ProductList";

export default async function ProductsPage({ lang }: { lang: Lang }) {
  const t = labels[lang];
  const data = await getProductData();
  return (
    <>
      <Header lang={lang} />
      <main className="flex-1">
        <div className="mx-auto max-w-xl px-4 pb-3 pt-4">
          <h2 className="text-xl font-bold">{t.title}</h2>
          {data.updatedAt && (
            <p className="text-sm text-gray-600">
              {t.updatedOn}: {formatDate(data.updatedAt, lang)}
            </p>
          )}
        </div>
        <ProductList
          products={data.products}
          lang={lang}
          placeholder={t.searchPlaceholder}
          clearLabel={t.clear}
          noResults={t.noResults}
        />
      </main>
      <Footer lang={lang} />
    </>
  );
}
