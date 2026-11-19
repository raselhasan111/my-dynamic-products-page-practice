export type Contact = {
  type: "whatsapp" | "phone" | "bkash" | "nagad"; // whatsapp/phone are tappable; bkash/nagad are agent numbers shown as text
  number: string; // international format, digits only, e.g. "8801712345678"
};

export const business = {
  name: { bn: "মাতাব্বর এন্টারপ্রাইজ", en: "Matabbar Enterprise" },
  type: { bn: "মুদির দোকান এন্ড সেনেটারী", en: "Grocery & Sanitary Shop" },
  owner: { bn: "কাওছার মাতাব্বর", en: "Kawser Matabbar" },
  contacts: [
    { type: "whatsapp", number: "8801623382863" },
    { type: "phone", number: "8801623382863" },
    { type: "bkash", number: "8801300883150" },
    { type: "nagad", number: "8801300883150" },
  ] satisfies Contact[],
};
