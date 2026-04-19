# Requirements: Bill Vault Security Hardening

**Defined:** 2026-04-20
**Core Value:** Privacy by design, security by default.

## v1 Requirements

Requirements for production-grade security.

### Database & Storage (DBST)
- [ ] **DBST-01**: Enable Row Level Security (RLS) on all user-facing tables (`bills`, `profiles`, `settings`).
- [ ] **DBST-02**: Implement "Owner-Only" access policies for all CRUD operations.
- [ ] **DBST-03**: Configure Storage Bucket policies to restrict file uploads by size (<5MB) and type (PDF, PNG, JPG).
- [ ] **DBST-04**: Implement DB-level audit triggers for sensitive table changes.

### Authentication (AUTH)
- [ ] **AUTH-01**: Implement Multi-Factor Authentication (MFA) setup flow using TOTP.
- [ ] **AUTH-02**: Implement MFA challenge during login for users with MFA enabled.
- [ ] **AUTH-03**: Secure session management with finite expiry and rotation.
- [ ] **AUTH-04**: Implement rate limiting on all auth-related endpoints.

### Application Security (APP)
- [ ] **APP-01**: Implement strict Content Security Policy (CSP) headers via `vercel.json`.
- [ ] **APP-02**: Systematic Zod validation for all form inputs and API interactions.
- [ ] **APP-03**: Implement input sanitization using `DOMPurify` for any dynamic content.
- [ ] **APP-04**: Strip sensitive metadata (EXIF) from uploaded images.

### PWA & Runtime (PWA)
- [ ] **PWA-01**: Audit and restrict Service Worker caching to non-sensitive static assets only.
- [ ] **PWA-02**: Enforce HTTPS and HSTS across all environments.
- [ ] **PWA-03**: Implement secure environment variable handling (no `VITE_` prefix for secrets).

### Monitoring (MON)
- [ ] **MON-01**: Implement user-visible Security Audit Log in the Profile/Settings page.
- [ ] **MON-02**: Integrate error tracking (e.g., Sentry) with sanitized PII.

## v2 Requirements
- **MON-03**: Anomaly detection for unusual login patterns.
- **AUTH-05**: Biometric authentication (FaceID/TouchID) via WebAuthn.
- **APP-05**: End-to-end encryption for document metadata.

## Out of Scope
| Feature | Reason |
|---------|--------|
| Payment Security | No payments implemented in v1. |
| Third-Party Auth | Sticking to Supabase Native Auth for simplicity and reduced surface area. |
| Physical Security | Managed by cloud provider (Supabase/AWS). |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DBST-01 | Phase 1 | Pending |
| DBST-02 | Phase 1 | Pending |
| DBST-03 | Phase 1 | Pending |
| DBST-04 | Phase 1 | Pending |
| APP-02 | Phase 2 | Pending |
| APP-03 | Phase 2 | Pending |
| AUTH-01 | Phase 3 | Pending |
| AUTH-02 | Phase 3 | Pending |
| AUTH-03 | Phase 3 | Pending |
| AUTH-04 | Phase 3 | Pending |
| APP-01 | Phase 4 | Pending |
| PWA-01 | Phase 4 | Pending |
| PWA-02 | Phase 4 | Pending |
| PWA-03 | Phase 4 | Pending |
| APP-04 | Phase 5 | Pending |
| MON-01 | Phase 5 | Pending |
| MON-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-20*
*Last updated: 2026-04-20 after initial definition*
