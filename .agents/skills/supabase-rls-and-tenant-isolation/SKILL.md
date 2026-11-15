---
name: supabase-rls-and-tenant-isolation
description: >-
  Use this skill whenever authoring or modifying Supabase database tables, migrations, storage buckets,
  or server actions in Earnix. Enforces strict multi-tenant Row Level Security (RLS), user_id = auth.uid()
  scoping, and secure server-side client instantiation.
---

# Supabase RLS & Multi-Tenant Isolation

This skill enforces strict tenant isolation across all database queries, mutations, and storage interactions in Earnix. No user must ever be able to query, update, or delete records belonging to another freelancer.

---

## Core Invariants

1. **Mandatory Row Level Security (RLS):**
   - Every table in PostgreSQL must execute `ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`.
   - Never disable RLS on public schema tables.

2. **Strict User Scoping Policies:**
   - Every select, insert, update, and delete policy must enforce `user_id = auth.uid()`:
     ```sql
     CREATE POLICY "Users can only access their own records"
       ON public.transactions
       FOR ALL
       USING (auth.uid() = user_id)
       WITH CHECK (auth.uid() = user_id);
     ```

3. **Storage Bucket Tenant Isolation:**
   - The `documents` storage bucket must use prefix-based RLS:
     `storage.foldername(name)[1] = auth.uid()::text`
   - File uploads must always be saved under the path pattern:
     `${user.id}/${timestamp}_${sanitizedFileName}`

4. **Service Role Key Containment:**
   - The `SUPABASE_SERVICE_ROLE_KEY` must only be accessed within secure Server Actions or background administrative jobs.
   - Never expose `SUPABASE_SERVICE_ROLE_KEY` to client components or public bundles (it must never carry `NEXT_PUBLIC_`).

5. **Authentication Guard in Server Actions:**
   - Server Actions must always retrieve and verify the active user via `await supabase.auth.getUser()`. Never trust client-supplied user IDs.

---

## Implementation Reference in Earnix

- **Database Migrations:** [`supabase/migrations/20261106000002_rls_and_storage.sql`](file:///d:/Earnix/supabase/migrations/20261106000002_rls_and_storage.sql)
- **RLS Optimizations:** [`supabase/migrations/20261108000001_optimize_rls_policies.sql`](file:///d:/Earnix/supabase/migrations/20261108000001_optimize_rls_policies.sql)
- **Server Client Factory:** [`src/lib/supabase/server.ts`](file:///d:/Earnix/src/lib/supabase/server.ts)
- **Session Middleware & Proxy:** [`src/lib/supabase/middleware.ts`](file:///d:/Earnix/src/lib/supabase/middleware.ts)

---

## Verification Runbook

```bash
# Verify database policies in migration files
npx supabase db lint
# Run production verification tests
npm test
```
