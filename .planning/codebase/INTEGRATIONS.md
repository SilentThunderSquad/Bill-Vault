# External Integrations

**Analysis Date:** 2026-04-20

## APIs & External Services

**OCR & Document Processing:**
- Tesseract.js - Client-side OCR for bill text extraction
  - SDK/Client: `tesseract.js` npm package v7.0
  - Auth: None (runs entirely in browser)
- PDF.js - Client-side PDF rendering and text extraction
  - SDK/Client: `pdfjs-dist` npm package v4.0
  - Auth: None (runs entirely in browser)

## Data Storage

**Databases:**
- PostgreSQL on Supabase - Primary data store for bills, profiles, and settings
  - Connection: via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  - Client: `@supabase/supabase-js` v2.x
  - Migrations: `supabase/admin.sql` and `supabase/user.sql`

**File Storage:**
- Supabase Storage - Storage for uploaded bill images and PDF files
  - SDK/Client: `@supabase/supabase-js` v2.x
  - Auth: Standard Supabase client auth
  - Buckets: `bills` (implied for bill storage)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Email/password authentication
  - Implementation: Supabase client SDK with `AuthContext`
  - Token storage: `localStorage` (default Supabase client behavior)
  - Session management: Handled by `@supabase/supabase-js`

## Monitoring & Observability

**Analytics:**
- None currently visible (manual mentions of GTM in conversation history suggest potential future or manual integration)
- Google Tag Manager (mentioned in metadata/history as `GTM-T68PB6VF`)

## CI/CD & Deployment

**Hosting:**
- Vercel - Frontend hosting
  - Deployment: Automatic via GitHub integration (implied by `vercel.json` and project structure)
  - Environment vars: Configured in Vercel dashboard

## Environment Configuration

**Development:**
- Required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Secrets location: `.env` (gitignored)

**Production:**
- Secrets management: Vercel environment variables

## Webhooks & Callbacks

**Incoming:**
- None currently visible in codebase (standard SPA architecture)

**Outgoing:**
- Push Notifications - Browser Push API managed via Service Workers
  - Implementation: `pwaNotificationService.ts`, `sw-warranty-handler.js`

---

*Integration audit: 2026-04-20*
*Update when adding/removing external services*
