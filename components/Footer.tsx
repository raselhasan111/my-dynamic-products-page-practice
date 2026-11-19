import { business } from "@/config/business";
import { labels, toBanglaDigits } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import InstallHint from "./InstallHint";

export default function Footer({ lang }: { lang: Lang }) {
  const t = labels[lang];
  return (
    <footer className="mt-8 border-t border-gray-300">
      <div className="mx-auto max-w-xl px-4 py-5">
        <h2 className="mb-3 text-lg font-bold">{t.contact}</h2>
        <div className="flex flex-col gap-3">
          {business.contacts.map((c) => {
            const digits = c.number.replace(/\D/g, "");
            const shown = toBanglaDigits(`+${digits}`);
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
                {isWa ? t.whatsapp : t.call}: {shown}
              </a>
            );
          })}
        </div>
        <InstallHint androidLabel={t.installAndroid} iosLabel={t.installIos} />
        <p className="mt-5 text-center text-sm text-gray-600">
          © {business.name[lang]}
        </p>
      </div>
    </footer>
  );
}
