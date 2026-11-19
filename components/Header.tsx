import Link from "next/link";
import { business } from "@/config/business";
import { labels } from "@/lib/i18n";
import ReloadButton from "./ReloadButton";
import type { Lang } from "@/lib/types";

export default function Header({ lang }: { lang: Lang }) {
  const t = labels[lang];
  return (
    <header className="border-b border-gray-300">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 pb-3 pt-4">
        <div>
          <h1 className="text-2xl font-bold leading-tight">{business.name[lang]}</h1>
          <p className="text-sm text-gray-600">{business.type[lang]}</p>
        </div>
        <div className="flex items-center gap-2">
          <ReloadButton label={t.reload} />
          <Link
            href={lang === "bn" ? "/en" : "/"}
            className="flex min-h-11 items-center rounded border border-gray-400 px-3 text-sm"
          >
            {t.switchLang}
          </Link>
        </div>
      </div>
    </header>
  );
}
