# Earnix

**AI-Powered Freelancer Income Management, Financial Recordkeeping and Tax Preparation Platform**

---

## 1. Overview

Earnix is a specialized web-based financial management platform designed specifically for freelancers, consultants, and independent contractors. Freelancers receive payments across disparate platforms (Upwork, direct client contracts) in foreign currencies (USD, EUR, GBP) and need to maintain accurate, audit-ready records to simplify income tracking, expense management, and annual tax preparation.

> **Disclaimer:** Earnix provides financial record organization, expense deduplication, and tax estimation assistance for the user and their qualified tax accountant. It does not act as an official tax authority and does not provide certified legal counsel.

---

## 2. Core Architectural Pillars

- **Financial Precision:** Absolute rejection of binary floating-point calculations for monetary values. Powered by PostgreSQL `NUMERIC(14, 4)` and TypeScript `decimal.js`.
- **Ledger Immutability:** Dual-value ledger architecture preserving original amounts, original currencies, historical exchange rates, and converted amounts.
- **Multi-Tenant Security:** PostgreSQL Row Level Security (RLS) ensures complete data isolation (`user_id = auth.uid()`).
- **Grounded AI Assistance:** AI models never invent numbers or tax rules. Aggregations are calculated deterministically via database queries; AI provides natural language summaries and suggestions that require explicit user review.

---

## 3. Technology Stack

- **Frontend:** Next.js 16 (App Router, React 19, Server Components)
- **Language:** TypeScript (strict mode, zero `any`)
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React
- **Precision Arithmetic:** `decimal.js`
- **Data Validation:** Zod
- **Backend / Database:** Supabase (PostgreSQL 16, Supabase Auth, Supabase Storage)
- **AI Engine:** Gemini API (Structured Outputs)
- **Deployment:** Vercel

---

## 4. Development Setup

### Prerequisites
- Node.js `v20+` (Tested on `v24.22.1`)
- npm `v10+`

### Installation
1. Clone the repository and navigate into the project directory:
   ```bash
   cd Earnix
   ```

2. Copy the environment variables template:
   ```bash
   cp .env.example .env.local
   ```

3. Install project dependencies:
   ```bash
   npm install
   ```

4. Run the local development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Implementation Roadmap (100% Complete)

- [x] **Phase 1:** Project Architecture, Tailwind CSS v4, Design Tokens & Base Configuration
- [x] **Phase 2:** Design System & Application Shell (Collapsible Sidebar, Header, Breadcrumbs, Responsive AppShell)
- [x] **Phase 3:** Supabase Authentication & Route Protection Middleware (`/login`, `/signup`, `/forgot-password`)
- [x] **Phase 4:** Database Schema, PostgreSQL Migrations & Multi-Tenant Row Level Security Policies
- [x] **Phase 5:** Financial Dashboard, Metric Cards & Recharts Income Velocity Visualizations
- [x] **Phase 6:** Client Directory & CRM-lite (`/clients`) with Lifetime Value Aggregations
- [x] **Phase 7:** Transactions & Income Ledger (`/transactions`) with Multi-Filter Support
- [x] **Phase 8:** Multi-Currency Engine (USD, EUR, GBP, PKR) with Frankfurter + SBP Exchange Sync
- [x] **Phase 9:** Business Expense Tracker (`/expenses`) & Supabase Document Vault (`/documents`)
- [x] **Phase 10:** Ingestion Wizard (`/transactions/import`) with RFC 4180 Upwork CSV Statement Parser
- [x] **Phase 11:** AI Transaction & Expense Categorization (Gemini 2.5 Flash + Human-in-the-Loop Review Stage)
- [x] **Phase 12:** AI Financial Assistant — Earnix Copilot (`/copilot`) with Deterministic RAG Grounding
- [x] **Phase 13:** Tax Preparation Center (`/tax`) with FBR Section 154A IT Benchmark & 1-Click Accountant CSV Export
- [x] **Phase 14:** Real-time Notifications & Quarterly Tax Reminders Flyout
- [x] **Phase 15:** Multi-Tenant Security Audits, Row Level Security Verification & 35-Point Automated Test Suite
- [x] **Phase 16:** Commercialization, Security Hardening & Production Operations Suite

---

## 6. Testing & Quality Verification

Run the automated test verification suite covering financial precision, currency conversion, tax engine edge cases, statement parsers, and security boundaries:

```bash
npm test
```

Build the production application:

```bash
npm run build
npm run lint
```


