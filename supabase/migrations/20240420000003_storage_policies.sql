-- Hardening Storage Policies for Bill Vault
-- Decision: D-03 (Hierarchical Storage Structure)

-- 1. Create the bills bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('bills', 'bills', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Clean up existing permissive policies for 'bills' and 'bill-images'
DROP POLICY IF EXISTS "Users can upload own bill images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view bill images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own bill images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own bill images" ON storage.objects;

-- 4. Enforce Hierarchical Owner-Only Access (user_id/file_id) with strict checks
-- bills bucket
CREATE POLICY "Users can only access their own folder in bills bucket"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'bills' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'bills' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  (octet_length(content) <= 5242880) AND -- 5MB limit
  (metadata->>'mimetype' ~ '^image/' OR metadata->>'mimetype' = 'application/pdf')
);

-- bill-images bucket (Legacy support/Hardened)
CREATE POLICY "Users can only access their own folder in bill-images bucket"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'bill-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'bill-images' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  (octet_length(content) <= 5242880) AND -- 5MB limit
  (metadata->>'mimetype' ~ '^image/' OR metadata->>'mimetype' = 'application/pdf')
);

-- 5. Revoke Public Access
UPDATE storage.buckets SET public = false WHERE id IN ('bills', 'bill-images');
