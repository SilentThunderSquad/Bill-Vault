# Phase 1: DB & Storage Hardening - Research

## Overview
This research defines the technical implementation patterns for creating a "tamper-proof" database and storage layer for Bill Vault. It focuses on Supabase-native PostgreSQL features and external security integrations.

## 1. Tamper-Proof Audit Log Schema
The recommended approach for Supabase is a dedicated `audit` schema to prevent accidental modification and ensure separation of concerns.

### Canonical Schema (`audit.record_version`)
- **Schema**: `audit`
- **Table**: `record_version`
- **Columns**:
    - `id`: `bigint` (Primary Key)
    - `record_id`: `uuid` (ID of the row being changed)
    - `op`: `audit.operation` (Enum: INSERT, UPDATE, DELETE, TRUNCATE)
    - `ts`: `timestamptz` (Event timestamp)
    - `table_name`: `text`
    - `schema_name`: `text`
    - `record`: `jsonb` (Current state of the row)
    - `old_record`: `jsonb` (Previous state of the row)
    - `auth_uid`: `uuid` (Captured via `auth.uid()`)
    - `auth_role`: `text` (Captured via `auth.role()`)

### Security Features
- Set `audit` schema to `USAGE` only for the `postgres` role.
- Use a `SECURITY DEFINER` function to insert into the audit table, ensuring users cannot bypass the log.
- Revoke all permissions on the `audit` table from the `authenticated` and `anon` roles.

## 2. Hierarchical Storage RLS Policies
Supabase Storage represents "folders" as path prefixes. To enforce owner-only access in a structure like `user_id/file_id`, use the following policies.

### SQL Policies
```sql
-- Allow users to upload to their own folder
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'bills' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'bills' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'bills' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## 3. Generic Secure Error Responses
To mask database structure and RLS details, we should normalize errors.

### Implementation Pattern
- **Database Level**: Use a trigger `BEFORE INSERT OR UPDATE` that validates ownership and calls `RAISE EXCEPTION 'Access Denied' USING ERRCODE = 'P0001'`.
- **Application Level**: The Supabase client will receive a 400/500 error with the message "Access Denied". The UI should catch any error from the database layer and display a generic "Security policy violation or invalid request" message.

## 4. Malware Scanning Integration
Since Supabase Edge Functions run Deno, direct execution of ClamAV is not possible.

### Recommended Integration: Cloudmersive Virus Scan API
- **Workflow**:
    1. The Edge Function receives the file via a `POST` request or a Storage Webhook.
    2. The function forwards the file buffer to `https://api.cloudmersive.com/virus/scan/file`.
    3. The API returns a JSON response: `{ "CleanResult": true, "FoundViruses": null }`.
    4. If `CleanResult` is `false`, the Edge Function aborts the upload or deletes the file from storage.

## Validation Architecture
- **Automated Tests**: Use a Node.js test suite to attempt cross-user access and verify 403/Access Denied errors.
- **Audit Verification**: Manually perform an update and verify the `audit.record_version` table contains the expected diff.
- **Storage Boundary Test**: Attempt to upload a file to `other_user_id/test.pdf` and verify it is rejected by RLS.
- **Payload Test**: Attempt to upload a 6MB file and verify rejection.

---
*Research completed: 2026-04-20*
