# Architecture: Security Hardening

**Analysis Date:** 2026-04-20

## Security Layers

### 1. Perimeter (Hosting & Network)
- **Vercel Edge Config:** Used for delivering HTTP Security Headers (CSP, HSTS, X-Frame-Options).
- **HTTPS Enforcement:** Redirect all HTTP traffic to HTTPS at the edge.

### 2. Identity & Access (Supabase Auth)
- **JWT Protection:** All requests to Supabase carry a user-specific JWT.
- **MFA Challenge:** Integrated into the `AuthContext` to gate sensitive actions.

### 3. Data Integrity (PostgreSQL)
- **RLS (Row Level Security):** The bedrock of the system.
  - *Pattern:* `CREATE POLICY "User can view own bills" ON bills FOR SELECT USING (auth.uid() = user_id);`
- **Audit Triggers:** Automated DB triggers to log changes to the `audit_logs` table.

### 4. Application Logic (React Hooks/Services)
- **Validation Middleware:** All service calls pass through a validation layer (`validators.ts`) using Zod.
- **Secure Storage Service:** Wraps Supabase Storage calls with additional client-side checks for file integrity.

### 5. Service Worker (PWA)
- **Scoped Execution:** Service worker restricted to the root path.
- **Encrypted Cache (Conceptual):** Investigating if sensitive bill metadata can be encrypted before being placed in the `CacheStorage`.

## Data Flow (Secure Upload)

1. **Client:** `AddBill.tsx` validates file size and type using `validators.ts`.
2. **Client:** File metadata is sanitized.
3. **API (Supabase Storage):** Request includes JWT. Supabase Bucket Policy verifies the user owns the folder.
4. **API (Supabase DB):** `bills` table RLS verifies `user_id` matches JWT `auth.uid()`.
5. **System:** `Audit Log` entry is automatically created via DB trigger.

## Suggested Build Order
1. **DB Hardening:** Implement RLS and Storage Policies (high impact, low UI change).
2. **Sanitization & Validation:** Update `validators.ts` and integrate into all forms.
3. **MFA & Auth Logic:** Update `AuthContext` and create MFA UI components.
4. **CSP & Headers:** Configure `vercel.json` for security headers.
5. **Auditing:** Implement `audit_logs` and monitoring.

---
*Architecture analysis: 2026-04-20*
