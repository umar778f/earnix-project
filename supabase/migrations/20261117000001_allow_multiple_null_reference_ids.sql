-- Allow multiple manual transactions without an explicit reference_id
-- while still enforcing uniqueness when a non-null reference_id is provided.
ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS uq_user_platform_ref;

CREATE UNIQUE INDEX IF NOT EXISTS uq_user_platform_ref_non_null
  ON public.transactions (user_id, platform_id, reference_id)
  WHERE reference_id IS NOT NULL;
