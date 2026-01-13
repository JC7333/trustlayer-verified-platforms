-- Fix 1: Add database constraints and validation trigger for contact_requests table

-- Add length constraints to columns
ALTER TABLE public.contact_requests
  ALTER COLUMN name TYPE VARCHAR(100),
  ALTER COLUMN email TYPE VARCHAR(255),
  ALTER COLUMN company TYPE VARCHAR(100),
  ALTER COLUMN message TYPE VARCHAR(2000);

-- Create validation function for contact_requests
CREATE OR REPLACE FUNCTION public.validate_contact_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Trim whitespace
  NEW.name := TRIM(NEW.name);
  NEW.email := LOWER(TRIM(NEW.email));
  NEW.company := TRIM(COALESCE(NEW.company, ''));
  NEW.message := TRIM(NEW.message);
  
  -- Validate name
  IF LENGTH(NEW.name) < 2 THEN
    RAISE EXCEPTION 'Name must be at least 2 characters';
  END IF;
  
  -- Validate email format
  IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Validate message length
  IF LENGTH(NEW.message) < 10 THEN
    RAISE EXCEPTION 'Message must be at least 10 characters';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for validation
DROP TRIGGER IF EXISTS validate_contact_request_trigger ON public.contact_requests;
CREATE TRIGGER validate_contact_request_trigger
  BEFORE INSERT OR UPDATE ON public.contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_contact_request();

-- Fix 2: Update storage policy to restrict uploads to reviewers+ only
DROP POLICY IF EXISTS "Reviewers can upload evidences" ON storage.objects;

CREATE POLICY "Reviewers+ can upload evidences" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'evidences' AND
    (storage.foldername(name))[1]::uuid IN (
      SELECT platform_id FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('platform_owner', 'platform_admin', 'reviewer')
    )
  );