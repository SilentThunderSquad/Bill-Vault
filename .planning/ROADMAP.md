# Roadmap: Bill Vault Security Hardening

## Overview
This roadmap outlines the journey to a production-ready, secure environment for Bill Vault. We begin with the most critical layer—the database—and move upward through input validation, identity management, and network hardening, concluding with robust auditing and monitoring tools.

## Phases
- [ ] **Phase 1: DB & Storage Hardening** - Secure the data at rest and access layer.
- [ ] **Phase 2: Validation & Sanitization** - Harden the application against injection and malformed data.
- [ ] **Phase 3: Enhanced Authentication** - Implement MFA and secure session management.
- [ ] **Phase 4: Runtime & Network Security** - Implement CSP and secure transport configurations.
- [ ] **Phase 5: Auditing & Monitoring** - Build the security audit trail and error tracking.
- [ ] **Phase 6: Production Polish & Final Audit** - Secret scanning and performance-security balance.

## Phase Details

### Phase 1: DB & Storage Hardening
**Goal**: Secure user data and files at the infrastructure level.
**Depends on**: Project Initialization
**Requirements**: DBST-01, DBST-02, DBST-03, DBST-04
**Success Criteria**:
  1. Row Level Security is active on all tables.
  2. One user cannot see or modify another user's bills via API manipulation.
  3. Storage bucket rejects non-image/PDF files and files >5MB.
  4. DB changes are automatically logged to an internal audit table.
**Plans**: 2 plans

Plans:
- [ ] 01-01: Implement RLS policies for `bills`, `profiles`, and `settings`.
- [ ] 01-02: Configure Storage Bucket policies and DB audit triggers.

### Phase 2: Validation & Sanitization
**Goal**: Ensure all data entering the system is clean and valid.
**Depends on**: Phase 1
**Requirements**: APP-02, APP-03
**Success Criteria**:
  1. All form submissions are validated by Zod before being sent to Supabase.
  2. Malicious scripts in bill metadata or profile fields are sanitized by DOMPurify.
  3. API responses are validated against expected schemas.
**Plans**: 1 plan

Plans:
- [ ] 02-01: Integrate Zod and DOMPurify into the service layer and forms.

### Phase 3: Enhanced Authentication
**Goal**: Protect user accounts with MFA and better session control.
**Depends on**: Phase 2
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria**:
  1. User can set up TOTP-based MFA in their settings.
  2. Login flow requires an MFA code if enabled.
  3. Sessions expire after a period of inactivity and rotate correctly.
**Plans**: 2 plans

Plans:
- [ ] 03-01: Build MFA setup and challenge UI components.
- [ ] 03-02: Update AuthContext and session management logic.

### Phase 4: Runtime & Network Security
**Goal**: Harden the browser environment and transport layer.
**Depends on**: Phase 3
**Requirements**: APP-01, PWA-01, PWA-02, PWA-03
**Success Criteria**:
  1. Content Security Policy (CSP) blocks unauthorized external scripts.
  2. Service Worker cache does not contain sensitive user documents.
  3. Site only loads over HTTPS with active HSTS.
**Plans**: 1 plan

Plans:
- [ ] 04-01: Configure CSP headers and audit PWA caching strategy.

### Phase 5: Auditing & Monitoring
**Goal**: Provide transparency and catch security issues in real-time.
**Depends on**: Phase 4
**Requirements**: APP-04, MON-01, MON-02
**Success Criteria**:
  1. User can view a "Security Log" of their own account actions.
  2. Sensitive EXIF data is stripped from uploaded images.
  3. Frontend errors are tracked in Sentry without leaking PII.
**Plans**: 2 plans

Plans:
- [ ] 05-01: Implement image metadata scrubbing logic.
- [ ] 05-02: Build Audit Log UI and integrate error monitoring.

### Phase 6: Production Polish & Final Audit
**Goal**: Final security sweep and performance optimization.
**Depends on**: Phase 5
**Success Criteria**:
  1. Secret scanner finds zero leaked keys in the codebase or git history.
  2. Performance metrics remain stable despite increased security checks.
**Plans**: 1 plan

Plans:
- [ ] 06-01: Conduct final secret scan and security-performance audit.

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. DB & Storage Hardening | 0/2 | Not started | - |
| 2. Validation & Sanitization | 0/1 | Not started | - |
| 3. Enhanced Authentication | 0/2 | Not started | - |
| 4. Runtime & Network Security | 0/1 | Not started | - |
| 5. Auditing & Monitoring | 0/2 | Not started | - |
| 6. Production Polish | 0/1 | Not started | - |
