-- Fix function search path for generate_referral_code
CREATE OR REPLACE FUNCTION public.generate_referral_code(first_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN UPPER(LEFT(COALESCE(first_name, 'USER'), 4)) || FLOOR(1000 + RANDOM() * 9000)::TEXT;
END;
$$;