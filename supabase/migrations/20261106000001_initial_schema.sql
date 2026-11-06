-- ==============================================================================
-- EARNIX — INITIAL DATABASE SCHEMA MIGRATION
-- ==============================================================================
-- Precision Financial Ledger, Multi-Currency Tracking & Tax Preparation Platform
-- Target Database: PostgreSQL 15+ (Supabase)

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. PROFILES TABLE (User Profile linked to Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    default_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    tax_jurisdiction VARCHAR(10) NOT NULL DEFAULT 'PK',
    business_name TEXT,
    tax_identifier TEXT, -- e.g. NTN (Pakistan) or local Tax Registration Number
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to automatically create profile record when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, default_currency, tax_jurisdiction)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        'USD',
        'PK'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 3. PLATFORMS TABLE (Platform catalog: Upwork, Generic CSV, Manual, Demo)
-- ------------------------------------------------------------------------------
CREATE TABLE public.platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'Briefcase',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. CLIENTS TABLE (Client directory per freelancer)
-- ------------------------------------------------------------------------------
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    country VARCHAR(100),
    default_platform_id UUID REFERENCES public.platforms(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_client_name UNIQUE (user_id, name)
);

CREATE INDEX idx_clients_user ON public.clients(user_id);

-- ------------------------------------------------------------------------------
-- 5. DOCUMENTS TABLE (Vault for invoices, receipts, and bank statements)
-- ------------------------------------------------------------------------------
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    document_type VARCHAR(50) NOT NULL DEFAULT 'receipt', -- 'invoice', 'receipt', 'bank_statement', 'tax_certificate'
    ocr_status VARCHAR(20) NOT NULL DEFAULT 'unprocessed', -- 'unprocessed', 'processing', 'completed', 'failed'
    ocr_extracted_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_documents_user ON public.documents(user_id);

-- ------------------------------------------------------------------------------
-- 6. TRANSACTIONS TABLE (Immutable Income Ledger with Multi-Currency Preservation)
-- ------------------------------------------------------------------------------
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE RESTRICT,
    platform_id UUID NOT NULL REFERENCES public.platforms(id) ON DELETE RESTRICT,
    reference_id TEXT, -- e.g. Upwork Ref ID / invoice ID
    original_amount NUMERIC(14, 4) NOT NULL,
    original_currency VARCHAR(3) NOT NULL,
    exchange_rate NUMERIC(12, 6) NOT NULL DEFAULT 1.000000,
    converted_amount NUMERIC(14, 4) NOT NULL,
    converted_currency VARCHAR(3) NOT NULL,
    conversion_date DATE NOT NULL DEFAULT CURRENT_DATE,
    conversion_source VARCHAR(50) DEFAULT 'ecb_frankfurter',
    payment_date TIMESTAMPTZ NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'completed', -- 'completed', 'pending', 'refunded'
    source_type VARCHAR(20) NOT NULL DEFAULT 'manual', -- 'csv_upwork', 'csv_generic', 'manual', 'demo'
    category VARCHAR(100) NOT NULL DEFAULT 'Freelance Income',
    ai_review_status VARCHAR(20) NOT NULL DEFAULT 'unassigned', -- 'unassigned', 'pending_review', 'confirmed', 'rejected'
    ai_confidence NUMERIC(3, 2),
    metadata JSONB DEFAULT '{}'::jsonb, -- holds platform fee breakdown, raw import lines, contract types
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_platform_ref UNIQUE NULLS NOT DISTINCT (user_id, platform_id, reference_id)
);

CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, payment_date DESC);
CREATE INDEX idx_transactions_client ON public.transactions(client_id);
CREATE INDEX idx_transactions_platform ON public.transactions(platform_id);
CREATE INDEX idx_transactions_source ON public.transactions(user_id, source_type);

-- ------------------------------------------------------------------------------
-- 7. EXPENSES TABLE (Categorized Business Expenses & Tax Deductibility)
-- ------------------------------------------------------------------------------
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    original_amount NUMERIC(14, 4) NOT NULL,
    original_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    exchange_rate NUMERIC(12, 6) NOT NULL DEFAULT 1.000000,
    converted_amount NUMERIC(14, 4) NOT NULL,
    converted_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    category VARCHAR(100) NOT NULL, -- e.g. 'Software & Subscriptions', 'Hardware', 'Internet & Utilities', 'Platform Fees'
    is_tax_deductible BOOLEAN NOT NULL DEFAULT true,
    tax_category VARCHAR(100),
    expense_date DATE NOT NULL,
    ai_review_status VARCHAR(20) NOT NULL DEFAULT 'unassigned', -- 'unassigned', 'pending_review', 'confirmed'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, expense_date DESC);
CREATE INDEX idx_expenses_category ON public.expenses(user_id, category);

-- ------------------------------------------------------------------------------
-- 8. TAX PROFILES TABLE (Configurable Tax Estimation & Recordkeeping Settings)
-- ------------------------------------------------------------------------------
CREATE TABLE public.tax_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tax_year VARCHAR(9) NOT NULL, -- e.g. '2024-2025'
    jurisdiction_code VARCHAR(10) NOT NULL DEFAULT 'PK',
    estimated_tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 1.00, -- User configurable percentage estimate (e.g. 1.00%)
    withholding_tax_suffered NUMERIC(14, 4) NOT NULL DEFAULT 0.0000,
    custom_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_tax_year UNIQUE (user_id, tax_year)
);

CREATE INDEX idx_tax_profiles_user ON public.tax_profiles(user_id);

-- ------------------------------------------------------------------------------
-- 9. EXCHANGE RATES TABLE (Historical Multi-Currency Snapshot Cache)
-- ------------------------------------------------------------------------------
CREATE TABLE public.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_currency VARCHAR(3) NOT NULL,
    target_currency VARCHAR(3) NOT NULL,
    rate NUMERIC(12, 6) NOT NULL,
    rate_date DATE NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'ecb_frankfurter',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_rate_pair_date UNIQUE (base_currency, target_currency, rate_date)
);

CREATE INDEX idx_exchange_rates_pair ON public.exchange_rates(base_currency, target_currency, rate_date DESC);

-- ------------------------------------------------------------------------------
-- 10. NOTIFICATIONS TABLE (Reminders, Import Status, Review Alerts)
-- ------------------------------------------------------------------------------
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'info', -- 'info', 'warning', 'reminder', 'action_required'
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

