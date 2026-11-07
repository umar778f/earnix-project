# Earnix

**Income records and tax-reserve estimates for freelancers paid in foreign currency.**

**Live Website:** [https://earnix-project.vercel.app](https://earnix-project.vercel.app)

Track Upwork and direct-client payments in USD, EUR, or GBP. Log deductible expenses with receipts. Estimate what to set aside for tax.

> **Disclaimer:** Earnix provides record organization and tax estimates for you and your accountant. It is not a tax authority and does not give legal or certified tax advice.

---

## Features

- **Dual-value ledger** — stores the original amount, currency, historical exchange rate, and converted value for every transaction
- **Multi-currency** — USD, EUR, GBP, PKR, with rates from Frankfurter and SBP
- **CSV import** — Upwork and bank statements, with duplicate detection
- **Expenses and receipts** — private document vault for deductible costs
- **Tax center** — FBR Section 154A estimate and one-click accountant CSV export
- **AI assist** — categorization and a Copilot, both grounded in your data and reviewed by you before saving
- **Dashboard and clients** — income trends, client breakdown, and lifetime value

---

## Design principles

- **Exact money math** — `decimal.js` and PostgreSQL `NUMERIC(14,4)`, never floating point
- **Immutable ledger** — past amounts and rates are preserved so reports are reproducible
- **Tenant isolation** — Row Level Security on every table (`user_id = auth.uid()`)
- **Grounded AI** — totals come from database queries; the model only summarizes and suggests

---

## Tech stack

Next.js 16 · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn/ui · Supabase (PostgreSQL 16, Auth, Storage) · Gemini API · Zod · Recharts · Vercel

---

## Getting started

**Requires:** Node.js 20+, npm 10+, a Supabase project, and a Gemini API key (optional, for AI features).

```bash
git clone https://github.com/umar778f/earnix-project.git
cd Earnix
cp .env.example .env.local   # fill in the values below
npm install
npm run dev                  # http://localhost:3000
```

Apply the database migrations to your Supabase project:

```bash
npx supabase db push
```

### Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_APP_URL` | App base URL (`https://earnix-project.vercel.app` or `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key — never expose to the client |
| `GEMINI_API_KEY` | Enables AI categorization and Copilot |
| `EXCHANGE_RATE_API_KEY` | Optional — leave blank to use public Frankfurter/ECB endpoints |

---

## Testing

```bash
npm test        # 35-point suite: money precision, currency, tax engine, CSV, RLS
npm run lint
npm run build
```

---

## Routes

| Path | Description |
|---|---|
| `/` | Landing page |
| `/dashboard` | Income summary, trends, and tax reserve widget |
| `/transactions` | Full ledger with multi-currency filter |
| `/transactions/import` | Upwork / bank CSV ingestion wizard |
| `/expenses` | Deductible expense tracker |
| `/documents` | Encrypted receipt and invoice vault |
| `/clients` | Client directory with lifetime value |
| `/tax` | FBR Section 154A estimate and CSV export |
| `/copilot` | AI financial assistant grounded in your ledger |
| `/settings` | Account and currency preferences |

---

## License

[MIT](LICENSE) — Copyright (c) 2026 Umar Farooq

