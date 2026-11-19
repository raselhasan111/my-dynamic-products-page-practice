import Link from "next/link";
import { business } from "@/config/business";
import { labels, toBanglaDigits } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import InstallHint from "./InstallHint";

const digitsOf = (n: string) => n.replace(/\D/g, "");
const show = (n: string) => toBanglaDigits(`+${digitsOf(n)}`);

export default function Footer({ lang }: { lang: Lang }) {
  const t = labels[lang];
  const links = business.contacts.filter((c) => c.type === "whatsapp" || c.type === "phone");
  const texts = business.contacts.filter((c) => c.type === "bkash" || c.type === "nagad");
  return (
    <footer className="mt-8 border-t border-gray-300">
      <div className="mx-auto max-w-xl px-4 py-5">
        <h2 className="mb-3 text-lg font-bold">{t.contact}</h2>
        <div className="flex flex-col gap-3">
          {links.map((c) => {
            const digits = digitsOf(c.number);
            const isWa = c.type === "whatsapp";
            return (
              <a
                key={`${c.type}-${digits}`}
                href={isWa ? `https://wa.me/${digits}` : `tel:+${digits}`}
                {...(isWa ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={`flex min-h-12 items-center justify-center rounded px-4 text-base font-semibold ${
                  isWa ? "bg-green-700 text-white" : "border border-gray-400"
                }`}
              >
                {isWa ? t.whatsapp : t.call}: {show(c.number)}
              </a>
            );
          })}
        </div>
        {texts.length > 0 && (
          <ul className="mt-4 border-t border-gray-200">
            {texts.map((c) => (
              <li
                key={`${c.type}-${c.number}`}
                className="flex min-h-11 items-center justify-between border-b border-gray-200 text-base"
              >
                <span>{c.type === "bkash" ? t.bkash : t.nagad}</span>
                <span className="font-semibold">{show(c.number)}</span>
              </li>
            ))}
          </ul>
        )}
        <InstallHint androidLabel={t.installAndroid} iosLabel={t.installIos} />
        <div className="mt-5 flex items-center justify-center gap-1">
          <p className="text-center text-sm text-gray-600">
            {t.owner}: {business.owner[lang]}
            <br />© {business.name[lang]}
          </p>
          <Link
            href="/admin"
            prefetch={false}
            aria-label="অ্যাডমিন লগইন"
            className="flex h-11 w-11 items-center justify-center text-gray-400"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}
