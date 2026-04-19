-- Tamper-Proof Audit Logging System
-- Decision: D-06 (DB-Level Audit Triggers)

-- 1. Create Audit Schema
CREATE SCHEMA IF NOT EXISTS audit;

-- 2. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit.logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID DEFAULT auth.uid(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Security Hardening for Audit Table
-- Only the superuser (postgres) can manage the audit schema
ALTER TABLE audit.logs ENABLE ROW LEVEL SECURITY;

-- No one can read/write directly to audit logs except via the security definer function
REVOKE ALL ON TABLE audit.logs FROM authenticated, anon, service_role;

-- 4. Audit Trigger Function
CREATE OR REPLACE FUNCTION audit.if_modified_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with creator privileges (postgres)
SET search_path = public, audit
AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit.logs (table_name, record_id, action, old_data, new_data)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit.logs (table_name, record_id, action, old_data)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit.logs (table_name, record_id, action, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

-- 5. Attach Triggers to Sensitive Tables
-- bills
DROP TRIGGER IF EXISTS audit_bills_trigger ON public.bills;
CREATE TRIGGER audit_bills_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.bills
    FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();

-- user_profiles
DROP TRIGGER IF EXISTS audit_profiles_trigger ON public.user_profiles;
CREATE TRIGGER audit_profiles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();

-- user_roles (from admin system)
DROP TRIGGER IF EXISTS audit_roles_trigger ON public.user_roles;
CREATE TRIGGER audit_roles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func();
