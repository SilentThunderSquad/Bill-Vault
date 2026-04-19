# Phase 01: DB & Storage Hardening - Context

**Gathered:** 2026-04-20
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase secures the core data and file storage layers of Bill Vault. It implements strict access controls at the database and storage levels, ensuring that user data is isolated, changes are audited, and uploaded files are verified for safety.

</domain>

<decisions>
## Implementation Decisions

### Row Level Security (RLS)
- **D-01:** **Strict Owner-Only Isolation.** Every query to `bills`, `profiles`, and `settings` tables must be gated by `auth.uid() = user_id`. No shared access or admin overrides in v1.
- **D-02:** **Default Deny.** RLS will be enabled on all new tables by default, with no "catch-all" policies that allow public access.

### Storage Security
- **D-03:** **Hierarchical Storage Structure.** Files in the `bills` bucket will be stored under `user_id/filename` paths to allow for simple and robust RLS policies on the storage layer.
- **D-04:** **Malware Scanning.** Implement a Supabase Edge Function to scan uploaded files (PDF/Images) for malware or suspicious scripts before they are fully committed to storage.
- **D-05:** **Strict MIME-Type Enforcement.** Storage policies will reject any file that does not match `image/*` or `application/pdf`.

### Auditing & Errors
- **D-06:** **DB-Level Audit Triggers.** Use PostgreSQL triggers to log all INSERT/UPDATE/DELETE operations on sensitive tables to a secure `audit_logs` table. This prevents logging bypasses even if the application layer is compromised.
- **D-07:** **Generic Security Errors.** The application will return generic error messages (e.g., "Unauthorized or secure action blocked") for RLS violations to avoid leaking database schema information to potential attackers.

### the agent's Discretion
- **Implementation of Audit Table Schema:** The agent may decide the specific columns for the `audit_logs` table (e.g., `old_data`, `new_data`, `changed_at`, `changed_by`).
- **Edge Function Trigger Logic:** The agent can decide whether to use a webhook or a direct storage trigger for the malware scan.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Infrastructure
- `src/services/supabase.ts` — Existing Supabase client initialization.
- `supabase/admin.sql` — Existing database schema and initial setup.

### Security Standards
- `src/utils/validators.ts` — Existing validation logic for extension.

</canonical_refs>

<specifics>
## Specific Ideas
- "Hacker-proof" foundation: Prioritize DB-level protection over client-side checks where possible.
</specifics>

<deferred>
## Deferred Ideas
- **Family/Shared Access:** Policies for multi-user bill access are deferred to a future milestone.
- **Biometric Storage Encryption:** Local encryption of cached files is deferred to Phase 4+.

</deferred>

---

*Phase: 01-db-storage-hardening*
*Context gathered: 2026-04-20 via adaptive discussion*
