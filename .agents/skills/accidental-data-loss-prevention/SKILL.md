---
name: accidental-data-loss-prevention
description: >-
  Use this skill whenever running commands, applying migrations, or executing actions that could modify
  or delete data, records, or storage objects in Earnix. Enforces confirmation workflows before destructive
  operations.
---

# Accidental Data Loss Prevention

This skill protects Earnix user financial data, historical audit ledgers, and document receipts from accidental destruction, truncations, or irrecoverable schema mutations.

---

## Core Invariants

1. **Destructive SQL Guard:**
   - Never execute unconstrained `DROP TABLE`, `DROP SCHEMA`, `TRUNCATE`, or `DELETE FROM ...` without explicit `WHERE user_id = ...` scoping.
   - For irreversible database operations, always obtain explicit user confirmation.

2. **Immutable Historical Records:**
   - Previous fiscal year and quarter transaction records must be preserved to guarantee reproducible tax returns.
   - Updates to historical entries must generate an audit trail.

3. **Safe Storage Deletion:**
   - Deleting a document from the receipt vault must only soft-delete or remove the user-scoped path `${user.id}/*`.
   - Never run bucket-level purging commands.

4. **Environment Isolation:**
   - Never run seed scripts (`supabase/seed.sql`) against production databases.
   - Keep `.env.local` strictly git-ignored to prevent credential leakage.

---

## Implementation Reference in Earnix

- **Seed Data Guard:** [`supabase/seed.sql`](file:///d:/Earnix/supabase/seed.sql)
- **Git Ignore Security:** [`.gitignore`](file:///d:/Earnix/.gitignore)
- **Database Schema Migrations:** [`supabase/migrations/`](file:///d:/Earnix/supabase/migrations/)
