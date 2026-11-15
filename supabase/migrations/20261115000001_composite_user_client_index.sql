-- ==============================================================================
-- EARNIX — COMPOSITE PERFORMANCE INDEXES FOR USER CLIENT LEDGER QUERIES
-- ==============================================================================
-- Justification:
-- High-frequency queries in client details drawer filter by both `user_id` and `client_id`:
-- `SELECT ... FROM public.transactions WHERE user_id = $1 AND client_id = $2`
-- A composite B-tree index on (user_id, client_id) optimizes multi-tenant client queries.

CREATE INDEX IF NOT EXISTS idx_transactions_user_client
    ON public.transactions(user_id, client_id);
