-- ==============================================================================
-- EARNIX — OPTIMIZE ROW LEVEL SECURITY (RLS) POLICIES FOR HIGH-SPEED LIVE QUERIES
-- ==============================================================================
-- In PostgreSQL, calling auth.uid() directly in RLS policies forces PostgreSQL to
-- re-evaluate the function on EVERY evaluated row, turning indexed user queries
-- into slow sequential scans.
--
-- Wrapping with `(select auth.uid())` forces PostgreSQL to evaluate the function
-- once as an InitPlan subquery, allowing full B-Tree index scans on user_id columns.
-- Reference: https://supabase.com/docs/guides/database/postgres/row-level-security

-- 1. PROFILES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);

-- 2. CLIENTS
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients"
    ON public.clients FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own clients" ON public.clients;
CREATE POLICY "Users can insert own clients"
    ON public.clients FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
CREATE POLICY "Users can update own clients"
    ON public.clients FOR UPDATE
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
CREATE POLICY "Users can delete own clients"
    ON public.clients FOR DELETE
    USING ((select auth.uid()) = user_id);

-- 3. DOCUMENTS
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Users can view own documents"
    ON public.documents FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
CREATE POLICY "Users can insert own documents"
    ON public.documents FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
CREATE POLICY "Users can update own documents"
    ON public.documents FOR UPDATE
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents"
    ON public.documents FOR DELETE
    USING ((select auth.uid()) = user_id);

-- 4. TRANSACTIONS
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions"
    ON public.transactions FOR UPDATE
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions"
    ON public.transactions FOR DELETE
    USING ((select auth.uid()) = user_id);

-- 5. EXPENSES
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
CREATE POLICY "Users can view own expenses"
    ON public.expenses FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
CREATE POLICY "Users can insert own expenses"
    ON public.expenses FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
CREATE POLICY "Users can update own expenses"
    ON public.expenses FOR UPDATE
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;
CREATE POLICY "Users can delete own expenses"
    ON public.expenses FOR DELETE
    USING ((select auth.uid()) = user_id);

-- 6. TAX PROFILES
DROP POLICY IF EXISTS "Users can view own tax profile" ON public.tax_profiles;
CREATE POLICY "Users can view own tax profile"
    ON public.tax_profiles FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own tax profile" ON public.tax_profiles;
CREATE POLICY "Users can insert own tax profile"
    ON public.tax_profiles FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own tax profile" ON public.tax_profiles;
CREATE POLICY "Users can update own tax profile"
    ON public.tax_profiles FOR UPDATE
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own tax profile" ON public.tax_profiles;
CREATE POLICY "Users can delete own tax profile"
    ON public.tax_profiles FOR DELETE
    USING ((select auth.uid()) = user_id);

-- 7. NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
    ON public.notifications FOR INSERT
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING ((select auth.uid()) = user_id);

