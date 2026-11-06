# Earnix

**AI-powered Freelancer Income Management, Financial Recordkeeping and Tax Preparation Platform**  
*Final Year Project (FYP)*

---

## 1. Overview

Earnix is a specialized web-based financial management platform designed specifically for freelancers. Online freelancers often receive payments across disparate platforms (Upwork, direct clients) in foreign currencies (USD, EUR, GBP) and need to maintain accurate, audit-ready records to simplify income tracking, expense management, and annual tax preparation.

> **Disclaimer:** Earnix provides financial record organization, expense deduplication, and tax estimation assistance for the user and their qualified tax accountant. It does not act as an official tax authority and does not provide certified legal counsel.

---

## 2. Core Architectural Pillars

- **Financial Precision:** Absolute rejection of binary floating-point calculations for monetary values. Powered by PostgreSQL `NUMERIC(14, 4)` and TypeScript `decimal.js`.
- **Ledger Immutability:** Dual-value ledger architecture preserving original amounts, original currencies, historical exchange rates, and converted amounts.
- **Multi-Tenant Security:** PostgreSQL Row Level Security (RLS) ensures complete data isolation (`user_id = auth.uid()`).
- **Grounded AI Assistance:** AI models never invent numbers or tax rules. Aggregations are calculated deterministically via database queries; AI provides natural language summaries and suggestions that require explicit user review.

---

## 3. Technology Stack

- **Frontend:** Next.js 15 (App Router, React 19, Server Components)
- **Language:** TypeScript (strict mode, zero `any`)
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React
- **Precision Arithmetic:** `decimal.js`
- **Data Validation:** Zod
- **Backend / Database:** Supabase (PostgreSQL 16, Supabase Auth, Supabase Storage)
- **AI Engine (Phases 11–12):** Gemini API (Structured Outputs)
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

## 5. Implementation Roadmap

- [x] **Phase 1:** Project Architecture, Design System Tokens & Base Configuration
- [ ] **Phase 2:** Design System & Application Shell (Sidebar, Header, Layouts)
- [ ] **Phase 3:** Supabase Authentication & Route Protection Middleware
- [ ] **Phase 4:** Database Schema, Migrations & Row-Level Security Policies
- [ ] **Phase 5:** Dashboard Overview & Financial KPI Cards
- [ ] **Phase 6:** Client Management (CRM-lite)
- [ ] **Phase 7:** Transactions & Income Ledger
- [ ] **Phase 8:** Multi-Currency Engine (USD, EUR, GBP, PKR) & FX Snapshot Sync
- [ ] **Phase 9:** Expenses Management & Secure Document Vault
- [ ] **Phase 10:** Ingestion Wizard (Official Upwork CSV Parser & Reconciliation)
- [ ] **Phase 11:** AI Transaction & Expense Categorization (with User Review Stage)
- [ ] **Phase 12:** AI Financial Assistant (Deterministic Grounded Copilot)
- [ ] **Phase 13:** Tax Preparation Workspace & Downloadable Reports
- [ ] **Phase 14:** Notifications & Recordkeeping Reminders
- [ ] **Phase 15:** Security Audits & Testing Suite
- [ ] **Phase 16:** Vercel Production Deployment & FYP Defense Suite
