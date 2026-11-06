# Earnix — Database Architecture & Migrations

This directory contains the versioned PostgreSQL migrations, Row Level Security (RLS) policies, and seed fixtures for **Earnix**.

---

## 1. Schema Architecture Overview

| Table | Ownership | Multi-Tenant Key | Primary Purpose |
| :--- | :--- | :--- | :--- |
| `profiles` | 1:1 with `auth.users` | `id = auth.uid()` | Freelancer user settings, base display currency, tax jurisdiction. |
| `platforms` | Global Catalog | Read-only for authenticated | Platform identifiers (`upwork`, `generic_csv`, `manual`, `demo`). |
| `clients` | Owned by profile | `user_id = auth.uid()` | Directory of clients, billing currency, default platform. |
| `documents` | Owned by profile | `user_id = auth.uid()` | Storage metadata for invoices, receipts, and bank statements. |
| `transactions` | Owned by profile | `user_id = auth.uid()` | Immutable income ledger. Dual-value fields (`original_amount`, `converted_amount`). Unique constraint `(user_id, platform_id, reference_id)` prevents duplicate CSV imports. |
| `expenses` | Owned by profile | `user_id = auth.uid()` | Categorized operational costs, receipt attachments, and tax deductibility. |
| `tax_profiles` | Owned by profile | `user_id = auth.uid()` | User tax year settings, jurisdiction, and configurable estimation rates. |
| `exchange_rates` | Global Catalog | Read-only for authenticated | Historical exchange rate snapshot cache (USD, EUR, GBP, PKR). |
| `notifications` | Owned by profile | `user_id = auth.uid()` | User alerts, transaction import logs, and tax reminders. |

---

## 2. Row Level Security (RLS)

All tables have `ENABLE ROW LEVEL SECURITY` active. Users can **never** query or mutate rows belonging to another freelancer:
- `USING (auth.uid() = user_id)`
- `WITH CHECK (auth.uid() = user_id)`

### Storage Security
Document uploads are stored in the private `documents` bucket. Access is secured at the storage engine level using:
```sql
bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text
```

---

## 3. Applying Migrations

### To Remote Supabase Project:
1. Link your Supabase project using the Supabase CLI:
   ```bash
   npx supabase link --project-ref your-project-id
   ```
2. Push migrations:
   ```bash
   npx supabase db push
   ```
3. Apply seed data:
   ```bash
   npx supabase db reset
   ```

### Via Supabase SQL Editor:
Alternatively, you can run `supabase/migrations/20261106000001_initial_schema.sql`, `supabase/migrations/20261106000002_rls_and_storage.sql`, and `supabase/seed.sql` directly inside the Supabase Web Dashboard SQL Editor.

