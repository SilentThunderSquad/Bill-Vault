-- Hardening RLS Policies for Bill Vault
-- Decision: D-01 (Strict Owner-Only Isolation)

-- 1. Clean up existing permissive policies
DROP POLICY IF EXISTS "Admin access to all bills" ON public.bills;
DROP POLICY IF EXISTS "Admin access to all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin access to all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admin access to all settings" ON public.notification_settings;
DROP POLICY IF EXISTS "Admin access to all activities" ON public.user_activities;
DROP POLICY IF EXISTS "Anyone can view bill images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;

-- 2. Enforce Strict Owner-Only on Core Tables
-- bills
DROP POLICY IF EXISTS "Users can select own bills" ON public.bills;
CREATE POLICY "Users can select own bills"
  ON public.bills FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bills" ON public.bills;
CREATE POLICY "Users can insert own bills"
  ON public.bills FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bills" ON public.bills;
CREATE POLICY "Users can update own bills"
  ON public.bills FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bills" ON public.bills;
CREATE POLICY "Users can delete own bills"
  ON public.bills FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- user_profiles
DROP POLICY IF EXISTS "Users can select own profile" ON public.user_profiles;
CREATE POLICY "Users can select own profile"
  ON public.user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- notification_settings
DROP POLICY IF EXISTS "Users can select own settings" ON public.notification_settings;
CREATE POLICY "Users can select own settings"
  ON public.notification_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON public.notification_settings;
CREATE POLICY "Users can update own settings"
  ON public.notification_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Ensure Default Deny for Public/Anon
-- (Supabase default is deny if RLS is enabled and no policies match)
-- We explicitly revoke all on public tables from anon
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT ON public.system_settings TO anon WHERE is_public = true;
