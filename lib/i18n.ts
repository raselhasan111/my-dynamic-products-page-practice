import type { Lang } from "./types";

export const labels = {
  bn: {
    title: "আজকের বাজারদর",
    updatedOn: "হালনাগাদ",
    searchPlaceholder: "পণ্য বা ক্যাটাগরি খুঁজুন…",
    clear: "মুছুন",
    noResults: "কোনো পণ্য পাওয়া যায়নি",
    contact: "যোগাযোগ",
    whatsapp: "হোয়াটসঅ্যাপ",
    call: "ফোন",
    bkash: "বিকাশ এজেন্ট",
    nagad: "নগদ এজেন্ট",
    owner: "মালিক",
    installAndroid: "অ্যাপ ইনস্টল করুন",
    installIos: "ইনস্টল করতে Safari-তে শেয়ার (⬆) চেপে “Add to Home Screen” দিন",
    switchLang: "English",
    reload: "পেজ রিফ্রেশ করুন",
  },
  en: {
    title: "Today's Prices",
    updatedOn: "Updated",
    searchPlaceholder: "Search product or category…",
    clear: "Clear",
    noResults: "No products found",
    contact: "Contact",
    whatsapp: "WhatsApp",
    call: "Phone",
    bkash: "bKash Agent",
    nagad: "Nagad Agent",
    owner: "Owner",
    installAndroid: "Install app",
    installIos: "To install, tap Share (⬆) in Safari, then “Add to Home Screen”",
    switchLang: "বাংলা",
    reload: "Reload page",
  },
} satisfies Record<Lang, Record<string, string>>;

const bnNumber = new Intl.NumberFormat("bn-BD");

export function toBanglaDigits(s: string): string {
  return s.replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
}

export function formatPrice(n: number): string {
  return `৳ ${bnNumber.format(n)}`;
}

export function formatDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat(lang === "bn" ? "bn-BD" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
