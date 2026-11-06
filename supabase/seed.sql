-- ==============================================================================
-- EARNIX — DATABASE SEED FIXTURES
-- ==============================================================================

-- 1. Standard Supported Platforms
INSERT INTO public.platforms (id, code, name, icon_name, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'upwork', 'Upwork', 'Briefcase', true),
    ('00000000-0000-0000-0000-000000000002', 'generic_csv', 'Generic CSV Import', 'FileSpreadsheet', true),
    ('00000000-0000-0000-0000-000000000003', 'manual', 'Manual Entry', 'PenTool', true),
    ('00000000-0000-0000-0000-000000000004', 'demo', 'Demo Fixture', 'Sparkles', true)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    icon_name = EXCLUDED.icon_name,
    is_active = EXCLUDED.is_active;

-- 2. Baseline Exchange Rates (Sample historical benchmarks for conversion testing)
INSERT INTO public.exchange_rates (base_currency, target_currency, rate, rate_date, source)
VALUES
    ('USD', 'PKR', 278.500000, CURRENT_DATE, 'seed_benchmark'),
    ('EUR', 'PKR', 302.250000, CURRENT_DATE, 'seed_benchmark'),
    ('GBP', 'PKR', 356.100000, CURRENT_DATE, 'seed_benchmark'),
    ('EUR', 'USD', 1.085000, CURRENT_DATE, 'seed_benchmark'),
    ('GBP', 'USD', 1.278000, CURRENT_DATE, 'seed_benchmark'),
    ('USD', 'USD', 1.000000, CURRENT_DATE, 'seed_benchmark'),
    ('PKR', 'PKR', 1.000000, CURRENT_DATE, 'seed_benchmark')
ON CONFLICT (base_currency, target_currency, rate_date) DO NOTHING;

