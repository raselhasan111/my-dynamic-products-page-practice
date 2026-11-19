export type Contact = { type: "whatsapp" | "phone"; number: string }; // international format, digits only, e.g. "8801712345678"

export const business = {
  name: { bn: "মায়ের দোয়া স্টোর", en: "Mayer Doa Store" },
  type: { bn: "মুদি দোকান", en: "Grocery Shop" },
  contacts: [
    { type: "whatsapp", number: "8801700000000" },
    { type: "phone", number: "8801800000000" },
  ] satisfies Contact[],
};
