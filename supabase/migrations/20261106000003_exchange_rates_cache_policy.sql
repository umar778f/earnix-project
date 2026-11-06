-- ==============================================================================
-- EARNIX — EXCHANGE RATES CACHE RLS POLICY EXTENSION
-- ==============================================================================
-- Target: public.exchange_rates
-- Purpose: Allows authenticated sessions to cache verified foreign exchange rate
--          snapshots from public sources (Frankfurter/ECB/SBP).

CREATE POLICY "Authenticated users can insert exchange rate snapshots"
    ON public.exchange_rates FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update exchange rate snapshots"
    ON public.exchange_rates FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

