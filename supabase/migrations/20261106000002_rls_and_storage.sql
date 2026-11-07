-- ==============================================================================
-- EARNIX — ROW LEVEL SECURITY (RLS) & STORAGE POLICIES
-- ==============================================================================
-- Enforces absolute multi-tenant isolation so users can ONLY access their own data.

-- 1. Enable Row Level Security on all application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 3. PLATFORMS POLICIES (Catalog is read-only for all sessions)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view active platforms"
    ON public.platforms FOR SELECT
    USING (is_active = true);

-- ------------------------------------------------------------------------------
-- 4. CLIENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own clients"
    ON public.clients FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients"
    ON public.clients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients"
    ON public.clients FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients"
    ON public.clients FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. DOCUMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own documents"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
    ON public.documents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
    ON public.documents FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 6. TRANSACTIONS POLICIES (Immutable Ledger Isolation)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
    ON public.transactions FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 7. EXPENSES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own expenses"
    ON public.expenses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
    ON public.expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
    ON public.expenses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
    ON public.expenses FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 8. TAX PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own tax profile"
    ON public.tax_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tax profile"
    ON public.tax_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tax profile"
    ON public.tax_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tax profile"
    ON public.tax_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 9. EXCHANGE RATES POLICIES (Global cache for authenticated sessions)
-- ------------------------------------------------------------------------------
CREATE POLICY "Authenticated users can view exchange rates"
    ON public.exchange_rates FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert exchange rate snapshots"
    ON public.exchange_rates FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update exchange rate snapshots"
    ON public.exchange_rates FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 10. NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 11. SUPABASE STORAGE BUCKET & OBJECT POLICIES
-- ------------------------------------------------------------------------------
-- Initialize private bucket for freelancer documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    10485760, -- 10MB limit per file
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/csv']
)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage Objects: Path pattern: {user_id}/{document_id}.{ext}
CREATE POLICY "Freelancers can access own document files"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'documents' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Freelancers can upload own document files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'documents' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Freelancers can update own document files"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'documents' AND
        (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'documents' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Freelancers can delete own document files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'documents' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

