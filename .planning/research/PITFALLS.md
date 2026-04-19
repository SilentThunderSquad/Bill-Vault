# Security Pitfalls & Prevention

**Analysis Date:** 2026-04-20

## Critical Mistakes to Avoid

### 1. Incomplete RLS Coverage
- **Pitfall:** Creating a new table but forgetting to enable RLS or write a policy.
- **Impact:** Entire table becomes public via the `anon` key.
- **Warning Sign:** Table appears in API responses without an `Authorization` header during testing.
- **Prevention:** Standardized "Security Audit" script that checks `pg_tables` for `rowsecurity = true`.
- **Phase:** DB Hardening.

### 2. Leaking service_role Key
- **Pitfall:** Accidentally committing the `service_role` key to Git or including it in a client-side environment variable (`VITE_`).
- **Impact:** Attacker gains full admin access to the database, bypassing all RLS.
- **Warning Sign:** Secrets found in build artifacts or Git history.
- **Prevention:** Use `.env.example` strictly; run `gsd-map-codebase` or secret scanners regularly.
- **Phase:** Initial Setup & Continuous Audit.

### 3. Permissive CSP
- **Pitfall:** Using `unsafe-inline` or `*` in CSP directives to "make things work."
- **Impact:** Effectively disables CSP protection, allowing XSS.
- **Warning Sign:** CSP reports in console showing broad permissions.
- **Prevention:** Use nonces or hashes for essential inline scripts; whitelist specific Supabase and GTM domains only.
- **Phase:** Headers & Production Polish.

### 4. Service Worker Cache Pollution
- **Pitfall:** Caching sensitive user data (like bill PDFs) in the PWA `CacheStorage` without encryption.
- **Impact:** Another user or process on the same device could potentially access the files.
- **Warning Sign:** Large PDFs visible in Application tab → Cache Storage.
- **Prevention:** Only cache static app assets (JS/CSS); fetch private data from network/secure storage on demand.
- **Phase:** PWA Audit.

### 5. Insecure Password Resets
- **Pitfall:** Allowing password resets without proper email verification or rate limiting.
- **Impact:** Account takeover via brute force or email spoofing.
- **Warning Sign:** High volume of reset requests in Supabase logs.
- **Prevention:** Use Supabase's built-in secure reset flow with mandatory email confirmation.
- **Phase:** Enhanced Auth.

---
*Pitfalls analysis: 2026-04-20*
