# Earnix

**A multi-currency financial records engine and tax-readiness platform for cross-border contractors and freelancers.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2016-3ecf8e.svg)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

Earnix is a financial records management and tax-preparation platform designed for independent professionals, software consultants, and freelancers who receive income in foreign currencies (USD, EUR, GBP) and need to maintain accurate, dual-currency accounting records in their domestic currency (PKR, USD, GBP, EUR).

### The Problem

Cross-border contractors face specific accounting and tax-compliance challenges:

1. **Exchange Rate Drift & Currency Volatility:** Converting foreign revenue at month-end or year-end using arbitrary exchange rates creates distorted financial reporting and violates audit standards requiring historical transaction-date foreign exchange rates.
2. **Conflated Platform Statements:** Freelance platforms (e.g., Upwork) disburse net payouts that combine gross earnings, tiered service fees, contract milestone withholdings, and payment processing charges into single withdrawal transactions, making manual tax categorization error-prone.
3. **Statutory Tax Estimation & Audit Readiness:** Calculating estimated tax liabilities under specialized regimes (e.g., Pakistan Section 154A export tax benchmarks or US self-employment estimates) requires quarterly calendar breakdowns, deductible expense tracking, and documented receipt substantiation ratios.

### Primary Workflow

1. **Ingest & Reconcile:** Import transactions via Upwork CSV statements, generic bank CSV exports, or manual entry. The ingestion engine automatically parses line items, extracts platform fees into deductible expenses, excludes cash withdrawals, verifies duplicate references, and captures the exact conversion rate.
2. **Track Expenses & Substantiate Receipts:** Record business expenses, attach proof of purchase (PDF, PNG, JPEG, WEBP) to private, tenant-isolated storage, and tag tax deductibility categories.
3. **Analyze & Estimate:** View normalized earnings, monthly trends, client lifetime value (LTV), and real-time estimated tax reserves across calendar or fiscal cycles.
4. **Audit-Ready Export:** Generate formatted, formula-injection-neutralized CSV packages structured for formal accountant review and statutory tax filing.

> **Statutory Notice:** Earnix provides financial record organization and computational assistance for users and certified accountants. It does not provide legal tax advice or act as a certified tax authority.

---

## Core Features

- **Dual-Currency Ledger:** Immutably records `original_amount`, `original_currency`, historical `exchange_rate`, `converted_amount`, and `converted_currency` for every income transaction.
- **Cross-Currency Normalization:** Normalizes historical transactions and expenses into the user's active base currency using arbitrary-precision arithmetic without mutating historical rate records.
- **Statement Ingestion Engine:** RFC 4180 compliant CSV parser that extracts contract milestones, splits platform service fees into allowable deductions, excludes withdrawals, and detects duplicate reference IDs.
- **Tax Readiness Engine:** Computes allowable deductions, net taxable income, and estimated tax reserves across both Calendar Tax Cycles (Jan–Mar, Apr–Jun, Jul–Sep, Oct–Dec) and Fiscal Tax Cycles (Jul–Sep, Oct–Dec, Jan–Mar, Apr–Jun).
- **Substantiation Coverage Tracking:** Automatically calculates receipt coverage percentages across allowable deductions to assist in audit defense.
- **Isolated Document Vault:** Private document storage for receipts, invoices, and bank statements with MIME type enforcement, file-size guards, and time-limited signed download URLs.
- **Client Directory & Lifetime Value (LTV):** Tracks client billing totals, payment frequencies, platform affiliations, and contact notes.
- **Grounded AI Financial Copilot:** Read-only conversational assistant powered by Google Gemini, strictly grounded in pre-computed SQL aggregations with prompt boundary guards and zero database write permissions.
- **Automated Expense Categorizer:** Offline heuristic categorizer with optional Gemini OCR assistance for document data extraction.

---

## Architecture & Engineering Decisions

```text
[ Client (Browser) ]
       │
       ▼
[ Next.js App Router (Vercel) ]
  ├── Edge Middleware (CSP, HSTS, Session Check, Rate Limiter)
  ├── Server Components (RSC) & Error Boundaries
  └── Server Actions (Zod Validation, Business Invariants)
       │
       ├──► [ Supabase (PostgreSQL 16) ]
       │      ├── Row Level Security (RLS via (select auth.uid()))
       │      ├── Composite B-Tree Indexes
       │      └── Encrypted Storage Bucket (documents/{user_id}/*)
       │
       ├──► [ Currency Provider (Frankfurter / ECB / SBP Benchmarks) ]
       │      └── In-Memory Rate Cache & Cross-Rate Engine
       │
       └──► [ Google Gemini API ] (Read-Only Grounded RAG & Document OCR)
```

### Full-Stack Architecture
- **Rendering & Server Actions:** Built with Next.js App Router (RSC) and React 19. Data fetching occurs on the server using per-request authenticated Supabase clients (`@supabase/ssr`). Mutations are handled exclusively through Server Actions protected by Zod schemas.
- **Crash Resilience:** Implements App Router error boundaries (`error.tsx`, `(dashboard)/error.tsx`, `global-error.tsx`) to catch server and rendering exceptions gracefully, displaying safe incident IDs without exposing stack traces.

### Database Architecture & Indexing
- **Row Level Security (RLS):** All application tables (`profiles`, `clients`, `transactions`, `expenses`, `documents`, `tax_profiles`) have RLS enabled. Policies use `(select auth.uid()) = user_id` to evaluate authentication tokens as InitPlan subqueries rather than re-executing per row.
- **Composite Indexing:** High-frequency query paths utilize targeted composite B-tree indexes:
  - `transactions(user_id, payment_date DESC)`
  - `transactions(user_id, client_id)`
  - `expenses(user_id, expense_date DESC)`
  - `expenses(user_id, category)`
  - `transactions(user_id, source_type)`

### Financial Precision Model
JavaScript's native IEEE-754 floating-point math causes binary rounding inaccuracies (`0.1 + 0.2 === 0.30000000000000004`). In Earnix:
- All monetary operations are performed using `Decimal.js` with explicit `ROUND_HALF_UP` rounding.
- Database records use PostgreSQL `NUMERIC(14, 4)` for amounts and `NUMERIC(12, 6)` for exchange rates.
- Multi-currency aggregations evaluate transaction currency alignment before addition; mismatched currencies are cross-converted using benchmark rates before summation.

### AI Grounding & Prompt Defense
The AI Copilot uses Retrieval-Augmented Generation (RAG) designed to prevent hallucinations and data leakage:
- **Zero Database Write Access:** The Copilot action possesses read-only aggregation queries and cannot execute SQL updates or deletes.
- **Strict Data Grounding:** Aggregations are calculated directly in SQL first; the resulting deterministic figures are injected into the prompt context.
- **Boundary & Injection Defense:** User prompts are length-restricted (<= 500 characters) and sanitized to reject instructions attempting to override system prompts or dump schema information.

---

## Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.4 | App Router, Server Actions, Turbopack |
| **Frontend** | React 19.3 | React Server Components, Suspense, Hooks |
| **Language** | TypeScript 5.0 | Strict mode, full type-safety |
| **Styling** | Tailwind CSS v4 | CSS variables, OKLCH color palettes, dark mode |
| **Components** | Base UI / shadcn | Accessible UI primitives and dialog components |
| **Database** | PostgreSQL 16 | Relational store hosted on Supabase |
| **Authentication** | Supabase Auth | Cookie-based session tokens with PKCE flow |
| **Storage** | Supabase Storage | Private bucket with tenant-level folder isolation |
| **Arithmetic** | Decimal.js 10.6 | Arbitrary-precision financial mathematics |
| **Validation** | Zod 4.6 | Runtime schema parsing and input boundaries |
| **AI / Document OCR** | Google Gen AI SDK | Gemini 2.5 Flash for document OCR and grounded RAG |
| **Visualizations**| Recharts 3.10 | Income trends, currency distribution charts |

---

## Security & Data Integrity

Earnix implements defense-in-depth principles across the entire application stack:

- **Multi-Tenant Isolation:** Enforced at the database layer via PostgreSQL Row Level Security. Users cannot query, insert, update, or delete records belonging to another tenant.
- **Document Storage Isolation:** Receipt files are stored in a private bucket under `{user_id}/{timestamp}_{filename}`. Download access requires an authenticated session and generates short-lived signed URLs.
- **Production Origin Callback Guard:** OAuth and authentication callbacks dynamically verify the incoming request origin against remote host headers, preventing redirection to `localhost` in production environments.
- **Formula Injection Defense (CWE-1236):** CSV exports sanitize all user-controlled text cells by prefixing execution trigger characters (`=`, `+`, `-`, `@`, `\t`, `\r`) with a single quote.
- **Path Traversal Defense (CWE-22):** Document upload names are sanitized to strip relative traversal patterns (`../`, `..\\`) and special characters.
- **Open Redirect Defense (CWE-601):** The authentication flow validates redirect parameters (`?next=...`) to reject external URLs, protocol-relative links (`//`), and backslash bypasses.
- **HTTP Security Headers:** Every HTTP response includes:
  - `Content-Security-Policy` (`default-src 'self' ...`)
  - `Strict-Transport-Security` (`max-age=63072000; includeSubDomains; preload`)
  - `X-Frame-Options: DENY` (clickjacking defense)
  - `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
- **Rate Limiting:** Sliding-window in-memory rate limiters throttle authentication endpoints and password reset actions.

---

## Testing & Quality

Verification is automated through targeted test suites covering precision, multi-tenancy, and application security:

```bash
# Run automated verification suite
npm test

# Run ESLint checks
npm run lint

# Run TypeScript compiler checks
npx tsc --noEmit

# Run production build
npm run build
```

### Current Test & Quality Status

- **Automated Test Suite (`scripts/verify.ts`):** **44 PASSED, 0 FAILED**
  - Arbitrary-precision math & non-floating point operations (`0.1 + 0.2 === 0.3`)
  - Dual-currency preservation and multi-currency normalization (USD + PKR conversion)
  - Tax Engine quarterly partitioning for both Calendar and Fiscal cycles
  - Upwork and generic RFC 4180 CSV statement parsing and duplicate detection
  - Formula injection (CWE-1236), path traversal (CWE-22), and open redirect (CWE-601) sanitizers
  - Sliding-window rate limiting and callback origin security guards
  - AI categorization heuristic fallbacks
- **Live Supabase Multi-Tenant RLS Suite:** **23 PASSED, 0 FAILED** (executed against production database with isolated test actors).
- **TypeScript Static Analysis:** **0 errors** (`npx tsc --noEmit`).
- **ESLint Code Quality:** **0 errors, 0 warnings** (`eslint`).
- **Production Build:** Compiled successfully via Turbopack generating all 20 static and dynamic routes.

---

## Project Structure

```text
Earnix/
├── scripts/
│   └── verify.ts              # Automated regression and verification test suite
├── src/
│   ├── app/                   # App Router pages, layouts, and error boundaries
│   │   ├── (auth)/            # Login, signup, password reset routes
│   │   ├── (dashboard)/       # Authenticated routes (clients, tax, expenses, etc.)
│   │   │   ├── clients/       # Client directory and LTV tracking
│   │   │   ├── copilot/       # Grounded AI assistant chat
│   │   │   ├── dashboard/     # Financial overview and trend charts
│   │   │   ├── documents/     # Receipt and document vault
│   │   │   ├── expenses/      # Deductible expense tracking
│   │   │   ├── settings/      # Currency preferences and business metadata
│   │   │   ├── tax/           # Tax readiness center and CSV export
│   │   │   ├── transactions/  # Ledger view and CSV import wizard
│   │   │   └── error.tsx      # Dashboard error boundary
│   │   ├── auth/callback/     # OAuth and magic link callback handler
│   │   ├── error.tsx          # Root application error boundary
│   │   └── global-error.tsx   # Root layout error boundary
│   ├── components/            # Domain views, layout primitives, and UI widgets
│   ├── config/                # Navigation and system constants
│   └── lib/                   # Core business logic and server services
│       ├── ai/                # Gemini client, RAG pipeline, and categorization
│       ├── auth/              # Auth server actions, schemas, and session utilities
│       ├── clients/           # Client service and LTV calculations
│       ├── currency/          # Decimal.js utilities, FX rates, and normalization
│       ├── dashboard/         # Dashboard metrics and aggregation services
│       ├── documents/         # Document upload, MIME validation, and signed URLs
│       ├── expenses/          # Expense tracking services and tax categorization
│       ├── parsers/           # RFC 4180 Upwork and generic CSV parsers
│       ├── security/          # Origin guards, rate limiters, and sanitizers
│       ├── supabase/          # SSR client helpers and session middleware
│       ├── tax/               # Deterministic tax engine, quarterly calculations, CSV export
│       └── transactions/      # Transaction ledger actions and schemas
└── supabase/
    └── migrations/            # Version-controlled PostgreSQL schema, RLS, and indexes
```

---

## Environment Variables

Configure the following variables in `.env.local` for local execution or within your hosting provider's dashboard for production deployments:

| Variable | Required | Description | Example / Default |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical application URL | `https://earnix-project.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project REST API endpoint | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase client publishable anon key | `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side administrative key (never exposed to client) | `sb_secret_...` |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for OCR and Copilot | `AIzaSy...` |
| `EXCHANGE_RATE_API_KEY` | Optional | Foreign exchange API key (falls back to public ECB/Frankfurter) | Empty |

---

## Deployment & Production Setup

Earnix is configured for deployment on Vercel connected to a managed Supabase PostgreSQL database.

### 1. Database Provisioning
Run the version-controlled SQL migrations located in `supabase/migrations/` against your Supabase project in sequential order:
1. `20261106000001_initial_schema.sql` (Tables, constraints, foreign keys)
2. `20261106000002_rls_and_storage.sql` (Row Level Security and storage bucket setup)
3. `20261106000003_exchange_rates_cache_policy.sql` (Exchange rate cache RLS)
4. `20261108000001_optimize_rls_policies.sql` (InitPlan RLS performance optimizations)
5. `20261115000001_composite_user_client_index.sql` (User-client composite query indexes)

### 2. Vercel Deployment
1. Connect the GitHub repository to Vercel.
2. In **Project Settings > Environment Variables**, supply the production environment variables listed above.
3. Deploy branch `main`. Turbopack compiles the production build automatically.

---

## Local Development

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher
- A Supabase project (cloud or local via Supabase CLI)

### Installation
```bash
# Clone the repository
git clone https://github.com/umar778f/earnix-project.git
cd earnix-project

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Run automated verification suite
npm test

# Start the local development server
npm run dev
```

Navigate to `http://localhost:3000` to access the application.

---

## License

This project is licensed under the [MIT License](LICENSE) — Copyright (c) 2026 Umar Farooq.
