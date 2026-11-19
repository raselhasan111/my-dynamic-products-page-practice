# আজকের বাজারদর — daily price page

A very simple, mobile-first price board for a grocery shop (mudi dokan). No cart, no orders, no login. Installable as an app on Android and iPhone.

## Update prices
Edit `data/products.json` (change `price`, and `updatedAt` to today's date `YYYY-MM-DD`). Later this file is replaced by a read-only Google Sheet in `lib/products.ts`.

## Change shop info
Edit `config/business.ts`: shop name, type, and `contacts` (array of `{ type: "whatsapp" | "phone", number }`, number in international format like `8801712345678`).

## Install on phone (needs HTTPS after deploy)
- Android (Chrome): tap "অ্যাপ ইনস্টল করুন" or menu → Install app.
- iPhone (Safari): Share → Add to Home Screen.

## Develop
```bash
npm run dev
```
