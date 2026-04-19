# Feature Requirements: Production Security

**Analysis Date:** 2026-04-20

## Table Stakes (Must Have)

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Multi-Factor Auth (MFA)** | Support for TOTP (Google Authenticator, etc.) during login. | Medium |
| **Strict RLS Policies** | Every DB query is scoped to the `auth.uid()`. | High |
| **Secure File Upload** | Validation of file size, magic bytes (mime-type), and owner-only storage access. | Medium |
| **Input Sanitization** | Zod schemas for all forms; stripping scripts/HTML. | Low |
| **CSP Headers** | Strict policy blocking unauthorized scripts and data connections. | Medium |
| **Rate Limiting** | Prevent brute-force on login/OTP endpoints. | Low (Native) |
| **Session Expiry** | Automatic logout after period of inactivity. | Low |

## Differentiators (Advanced Security)

| Feature | Description | Complexity |
|---------|-------------|------------|
| **Audit Logs** | User-visible log of security events (logins, file downloads, settings changes). | Medium |
| **Anomaly Detection** | Alerts for logins from new devices/locations (Supabase native where possible). | Medium |
| **PDF/Image Scrubbing** | Removing metadata (EXIF) from uploaded bills to prevent location leaking. | High |

## Anti-Features (Deliberately Not Building)

- **Third-Party Analytic Scripts** - Minimizing external JS execution to reduce XSS surface area.
- **"Stay Logged In" indefinitely** - Security risk for financial documents; sessions will have finite lifespans.
- **Client-Side Secret Storage** - No API keys or sensitive project secrets will ever touch the client bundle.

## Dependencies between Features
- **MFA** requires an updated **Auth Flow** in the UI.
- **Audit Logs** require a dedicated DB table protected by **RLS**.
- **Secure File Upload** relies on **Storage Bucket Policies**.

---
*Features analysis: 2026-04-20*
