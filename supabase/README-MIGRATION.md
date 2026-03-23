# Provider Tracking Migration

This migration fixes the 403 Forbidden errors in the admin dashboard and adds proper provider tracking for users.

## What This Migration Does

1. **Adds Provider Tracking**: Adds a `provider` column to `user_profiles` table
2. **Updates Admin View**: Enhances `admin_user_overview` to include provider and avatar information
3. **Fixes Signup Flow**: Updates the `handle_new_user` function to capture provider during registration
4. **Updates Existing Data**: Intelligently detects providers for existing users based on avatar URLs

## How to Apply

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query and copy the contents of `provider-tracking-migration.sql`
4. Run the migration

### Option 2: Command Line (If you have psql)
```bash
psql "your-supabase-connection-string" -f provider-tracking-migration.sql
```

## Benefits After Migration

✅ **No more 403 Forbidden errors** in admin dashboard
✅ **Accurate provider display** for all users (Google, GitHub, Email/Password)
✅ **Enhanced user details** in admin modal
✅ **Future-proof signup tracking** for new users
✅ **Better user management** with complete user information

## Verification

After running the migration, check that:

1. Admin dashboard loads without console errors
2. User details modal shows provider information
3. New user signups automatically track provider information
4. Existing users have appropriate provider tags

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Remove provider column
ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS provider;

-- Restore original admin view (without provider column)
-- Note: This would require the original view definition
```

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify the migration ran successfully in Supabase logs
3. Ensure your admin user has the necessary permissions