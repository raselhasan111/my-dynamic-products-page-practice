# আজকের বাজারদর — daily price page

A very simple, mobile-first price board for a grocery shop (mudi dokan). No cart, no orders. Installable as an app on Android and iPhone. Products live in a **Google Sheet** and the shop admin manages them from `/admin` with a security code.

## How it works
- The public page (`/`, `/en`) reads categories, units and products from the Google Sheet.
- `/admin` (reached from the small lock icon at the bottom of the page) lets the admin add, edit and delete categories, units and products, and update prices. Changes show on the public page immediately.
- There are no user accounts. Anyone who knows the security code (`ADMIN_CODE`) can use `/admin`, so share it only with the shop owner.

## One-time setup

### 1. Google service account (lets the site write to the sheet)
1. Open https://console.cloud.google.com, create a project, and enable **Google Sheets API**.
2. **IAM & Admin → Service Accounts → Create**. Open it → **Keys → Add key → JSON**, and download the file.
3. Open your Google Sheet → **Share** → paste the service account's email (`...@...iam.gserviceaccount.com`) → **Editor**.
   The sheet itself can stay private.

### 2. Environment variables
Copy `.env.example` to `.env.local` (never commit it) and fill in:

| Name | Value |
| --- | --- |
| `GOOGLE_SHEET_ID` | The long id in the sheet's URL (`/d/<this part>/edit`) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `client_email` from the JSON key |
| `GOOGLE_PRIVATE_KEY` | `private_key` from the JSON key, in double quotes, keeping the `\n` sequences |
| `ADMIN_CODE` | The security code for `/admin` (8+ characters) |

When deployed (for example on Vercel), put the same four values in the project's environment variables. Share `ADMIN_CODE` with the shop admin directly, never in the repo.

### 3. First run
Open `/admin`, enter the code. The site creates the `categories`, `units` and `products` tabs (with headers and default units like কেজি, গ্রাম, লিটার) if they don't exist yet. Then add categories and products.

## Sheet layout (you can also edit it by hand; row 1 = headers)
- `categories`: `id | name_bn | name_en | sort`
- `units`: `id | name_bn | name_en`
- `products`: `id | category_id | name_bn | name_en | unit_id | price | updated_at`

Edits made directly in the sheet show on the site within about a minute. Don't change the `id` columns.

## Change shop info
Edit `config/business.ts`: shop name, type, owner, and `contacts` (array of `{ type, number }`; `type` is `whatsapp`, `phone`, `bkash` or `nagad`; number in international format like `8801712345678`).

## Install on phone (needs HTTPS after deploy)
- Android (Chrome): tap the install button in the footer, or menu → Install app.
- iPhone (Safari): Share → Add to Home Screen.

## Develop
```bash
npm run dev
```
