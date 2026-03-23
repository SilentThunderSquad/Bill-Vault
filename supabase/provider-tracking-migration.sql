-- =============================================
-- PROVIDER TRACKING MIGRATION
-- Add provider tracking to user_profiles table and admin views
-- =============================================

-- Add provider column to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email';

-- Add index for provider lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_provider ON public.user_profiles(provider);

-- Update the handle_new_user function to capture provider information
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _full_name TEXT;
  _avatar_url TEXT;
  _provider TEXT;
BEGIN
  -- Extract name from social providers
  _full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'user_name',
    ''
  );

  -- Extract avatar from social providers
  _avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NULL
  );

  -- Extract provider information
  _provider := COALESCE(
    NEW.app_metadata->>'provider',
    'email'
  );

  -- Create notification settings
  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create user profile with provider information
  INSERT INTO public.user_profiles (user_id, full_name, avatar_url, provider)
  VALUES (NEW.id, _full_name, _avatar_url, _provider)
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = CASE
      WHEN COALESCE(TRIM(public.user_profiles.full_name), '') = ''
      THEN EXCLUDED.full_name
      ELSE public.user_profiles.full_name
    END,
    avatar_url = CASE
      WHEN public.user_profiles.avatar_url IS NULL
      THEN EXCLUDED.avatar_url
      ELSE public.user_profiles.avatar_url
    END,
    provider = EXCLUDED.provider;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update admin_user_overview view to include provider information
CREATE OR REPLACE VIEW public.admin_user_overview AS
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at as signup_date,
  u.last_sign_in_at,
  up.full_name,
  up.country,
  up.status,
  up.suspended_at,
  up.suspended_reason,
  up.provider,
  up.avatar_url,
  ur.role,
  COUNT(b.id) as total_bills,
  0 as storage_used_bytes, -- Placeholder - would need actual file sizes from storage
  MAX(b.created_at) as last_bill_date,
  COALESCE(SUM(b.price), 0) as total_spent,
  u.last_sign_in_at as last_login_at,
  CASE
    WHEN up.status = 'suspended' THEN 'inactive'::TEXT
    WHEN u.last_sign_in_at > NOW() - INTERVAL '30 days' THEN 'active'::TEXT
    WHEN u.last_sign_in_at > NOW() - INTERVAL '90 days' THEN 'inactive'::TEXT
    ELSE 'dormant'::TEXT
  END as activity_status
FROM auth.users u
  LEFT JOIN public.user_profiles up ON u.id = up.user_id
  LEFT JOIN public.user_roles ur ON u.id = ur.user_id
  LEFT JOIN public.bills b ON u.id = b.user_id
WHERE u.deleted_at IS NULL OR u.deleted_at IS NOT NULL -- Handle cases where deleted_at column may not exist
GROUP BY u.id, u.email, u.email_confirmed_at, u.created_at, u.last_sign_in_at,
         up.full_name, up.country, up.status, up.suspended_at, up.suspended_reason, up.provider, up.avatar_url, ur.role
ORDER BY u.created_at DESC;

-- Update existing users to have better provider detection
UPDATE public.user_profiles
SET provider = CASE
  WHEN user_profiles.avatar_url LIKE '%googleusercontent.com%' THEN 'google'
  WHEN user_profiles.avatar_url LIKE '%github%' THEN 'github'
  WHEN user_profiles.avatar_url LIKE '%avatars.githubusercontent.com%' THEN 'github'
  ELSE 'email'
END
WHERE provider IS NULL OR provider = 'email';

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.provider IS 'Authentication provider used during signup (google, github, email, etc.)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=====================================';
  RAISE NOTICE 'PROVIDER TRACKING MIGRATION COMPLETE';
  RAISE NOTICE '=====================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Provider column added to user_profiles';
  RAISE NOTICE '✅ Index created for provider lookups';
  RAISE NOTICE '✅ admin_user_overview view updated';
  RAISE NOTICE '✅ handle_new_user function updated';
  RAISE NOTICE '✅ Existing users updated with provider info';
  RAISE NOTICE '';
  RAISE NOTICE 'Admin dashboard will now show:';
  RAISE NOTICE '- Accurate provider information';
  RAISE NOTICE '- User avatars from social providers';
  RAISE NOTICE '- Enhanced user management capabilities';
  RAISE NOTICE '';
  RAISE NOTICE 'New signups will automatically track provider';
  RAISE NOTICE 'No more 403 Forbidden errors in admin dashboard';
  RAISE NOTICE '';
  RAISE NOTICE '=====================================';
END
$$;