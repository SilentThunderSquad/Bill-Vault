# Technology Stack: Security Hardening

**Analysis Date:** 2026-04-20

## Core Security Stack

### Authentication & Authorization
- **Supabase Auth (Native)** - Industry-standard JWT-based authentication.
  - *Confidence:* High
  - *Rationale:* Tight integration with RLS and existing project structure.
- **Supabase MFA** - Multi-factor authentication support (TOTP).
  - *Confidence:* High
  - *Rationale:* Essential for production-grade security on personal financial data.

### Database Layer
- **PostgreSQL RLS (Row Level Security)** - Mandatory for all tables.
  - *Confidence:* Critical
  - *Rationale:* Prevents unauthorized data access at the DB level, even if the client is compromised.
- **Database Vault / TDE (Transparent Data Encryption)** - Provided by Supabase (underlying AWS/GCP infrastructure).
  - *Confidence:* High
  - *Rationale:* Ensures data at rest is encrypted.

### Application Layer (Frontend)
- **React 19** - Native auto-escaping for XSS prevention.
  - *Confidence:* High
  - *Rationale:* Modern framework with built-in security features.
- **DOMPurify** - For sanitizing any potential HTML input/output.
  - *Confidence:* High
  - *Rationale:* Industry standard for client-side sanitization.
- **Zod** - Schema validation for all inputs and API responses.
  - *Confidence:* High
  - *Rationale:* Ensures data integrity and prevents injection or malformed data issues.

### Network & Environment
- **HTTPS/TLS 1.3** - Mandatory for all traffic.
  - *Confidence:* Critical
  - *Rationale:* Protection against Man-in-the-Middle (MitM) attacks.
- **HSTS (HTTP Strict Transport Security)** - Enforced via Vercel config.
  - *Confidence:* High
  - *Rationale:* Forces browsers to only use secure connections.
- **Strict Content Security Policy (CSP)** - Delivered via HTTP headers.
  - *Confidence:* High
  - *Rationale:* Mitigates XSS and data exfiltration risks.

## Build & Tooling
- **npm audit / Snyk** - Automated dependency vulnerability scanning.
- **Vite Build Optimization** - Console stripping and minification.

## What NOT to use
- **Custom Encryption Logic** - Don't roll your own; use browser Web Crypto API or Supabase built-ins.
- **Local Storage for Sensitive Tokens** - Stick to standard Supabase client behavior (session storage or secure cookies where possible).
- **Service Role Key in Client** - **CRITICAL:** Never expose this key in the frontend.

---
*Stack analysis: 2026-04-20*
*Update when introducing new infrastructure components*
