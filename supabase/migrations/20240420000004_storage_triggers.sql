-- Storage Triggers for Malware Scanning
-- Decision: D-04 (Malware Scanning via Edge Function)

-- 1. Create a function to invoke the virus-scan edge function
CREATE OR REPLACE FUNCTION storage.on_object_inserted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  -- Invoke the edge function asynchronously via database webhook logic
  -- Note: In Supabase Dashboard, it's better to use "Database Webhooks" UI
  -- but we can use the 'net' extension if available.
  -- For v1, we'll assume the webhook is configured in Dashboard.
  -- This function serves as a placeholder/log for the trigger.
  
  PERFORM net.http_post(
    url := 'https://' || current_setting('request.headers')::json->>'host' || '/functions/v1/virus-scan',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('request.headers')::json->>'authorization'
    ),
    body := jsonb_build_object('record', to_jsonb(NEW))
  );
  
  RETURN NEW;
END;
$$;

-- 2. Attach the trigger (Commented out by default - requires 'net' extension)
-- CREATE TRIGGER on_bill_upload
--   AFTER INSERT ON storage.objects
--   FOR EACH ROW
--   WHEN (NEW.bucket_id = 'bills')
--   EXECUTE FUNCTION storage.on_object_inserted();
