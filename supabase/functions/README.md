# Supabase Edge Functions - Bill Vault

## Overview
This directory contains Edge Functions for the Bill Vault application, specifically for automated warranty notifications.

## Functions

### `check-warranties`
Automated function that checks for expiring warranties and creates notifications.

**Triggers:**
- Can be called manually via Supabase dashboard
- Should be set up as a cron job (daily at 9 AM UTC)
- Can be triggered via API call

**Environment Variables Required:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (admin access)

## Latest Dependencies (Updated 2024-03-25)

### Current Versions:
- **Deno std library**: `@0.224.0` (latest stable)
- **Supabase JS**: `@2.50.0` (latest stable)

### Import Patterns:
```typescript
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
```

## Configuration Files

### `deno.json`
- TypeScript compiler options
- Linting and formatting rules
- Import map reference

### `import_map.json`
- Dependency version mapping
- **IMPORTANT**: Keep versions in sync with function imports

### `types.d.ts`
- Database type definitions
- Shared across all functions
- Auto-generated from Supabase schema

## Development Best Practices

1. **Always use latest stable versions**
2. **Keep import_map.json in sync** with function imports
3. **Test functions** in Supabase dashboard before deployment
4. **Check logs** in Supabase Functions tab for debugging

## Common Issues & Fixes

### Import Errors
- **Cause**: Outdated dependency versions
- **Fix**: Update both function imports AND `import_map.json`

### TypeScript Errors
- **Cause**: Missing or outdated type definitions
- **Fix**: Update `types.d.ts` with latest database schema

### Environment Variable Errors
- **Cause**: Missing secrets in Supabase project
- **Fix**: Set via Supabase Dashboard > Settings > API > Environment Variables

## Deployment

Functions are automatically deployed when:
1. Code is pushed to main branch (if CI/CD enabled)
2. Manually deployed via Supabase CLI:
   ```bash
   supabase functions deploy check-warranties
   ```

## Testing

Test the warranty check function:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/check-warranties \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

## Maintenance

**Weekly**: Check for dependency updates
**Monthly**: Review function performance and logs
**Quarterly**: Update to latest stable dependency versions