# Bill Vault: Security Hardening & Production Readiness

## What This Is
A comprehensive security overhaul for the Bill Vault PWA to achieve production-grade protection. The project focuses on hardening the entire stack—from Supabase database policies to client-side runtime security—ensuring that user documents, financial data, and personal information are protected against unauthorized access, data theft, and common web vulnerabilities.

## Core Value
**"Privacy by design, security by default."** Users can trust Bill Vault with their sensitive financial documents knowing that the platform is resilient against modern attack vectors and strictly adheres to zero-trust principles.

## Requirements

### Validated
- ✓ **Core Supabase Integration** — Existing DB, Auth, and Storage connectivity.
- ✓ **PWA Foundation** — Service Worker and manifest configured for offline access.
- ✓ **Client-Side Document Processing** — OCR and PDF parsing implemented without server-side data exposure.
- ✓ **Basic Authentication Flow** — Functional login/register using Supabase Auth.

### Active
- [ ] **Hardened Row Level Security (RLS)** — Audit and implement strict isolation for all tables (`bills`, `profiles`, `settings`).
- [ ] **Secure Storage Policies** — Restrict file uploads to valid mime-types/sizes and enforce ownership at the storage level.
- [ ] **Content Security Policy (CSP)** — Implement strict CSP headers to prevent XSS and unauthorized data exfiltration.
- [ ] **Enhanced Authentication** — Implement Multi-Factor Authentication (MFA) support and secure session management.
- [ ] **Input Validation & Sanitization** — Systematic use of Zod or equivalent for all API interactions and form inputs.
- [ ] **PWA Cache Security** — Audit and harden local storage/cache to prevent "side-channel" data access.
- [ ] **Production Audit** — Scan for leaked secrets, insecure environment configurations, and dependency vulnerabilities.

### Out of Scope
- **Payment Gateway Integration** — Focusing purely on document/data security for now.
- **Backend Infrastructure Migration** — Remaining on Supabase.
- **UI/UX Redesign** — Changes will be restricted to security-related feedback (e.g., MFA screens).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| **Supabase Native Security** | Leveraging built-in RLS and Auth instead of third-party wrappers to minimize attack surface. | — Pending |
| **Client-Side Heavy OCR** | Keeping document processing on the client avoids "Data in Flight" risks to external servers. | — Existing |
| **Strict CSP** | Blocking all non-essential scripts and domains (e.g., GTM restricted to known IDs). | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-20 after initialization*
