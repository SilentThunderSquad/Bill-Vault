import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Bill Vault: Virus Scan Edge Function
 * Scans uploaded files for malware using Cloudmersive API.
 */

const CLOUDMERSIVE_API_KEY = Deno.env.get('CLOUDMERSIVE_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    const { record } = await req.json()
    const { bucket_id, name, id: object_id } = record

    if (!bucket_id || !name) {
      return new Response("Missing bucket_id or name", { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // 1. Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket_id)
      .download(name)

    if (downloadError) {
      console.error(`Download error for ${name}:`, downloadError)
      return new Response(JSON.stringify({ error: downloadError.message }), { status: 500 })
    }

    // 2. Scan with Cloudmersive Virus Scan API
    const formData = new FormData()
    formData.append('file', fileData, name)

    const scanResponse = await fetch('https://api.cloudmersive.com/virus/scan/file', {
      method: 'POST',
      headers: { 
        'Apikey': CLOUDMERSIVE_API_KEY || '' 
      },
      body: formData
    })

    if (!scanResponse.ok) {
      const errorText = await scanResponse.text()
      console.error('Cloudmersive API error:', errorText)
      return new Response("Malware scan service unavailable", { status: 503 })
    }

    const scanResult = await scanResponse.json()
    console.log(`Scan result for ${name}:`, scanResult)

    // 3. Handle result: CleanResult (boolean)
    if (scanResult.CleanResult === false) {
      console.warn(`MALWARE DETECTED in ${name}! Deleting...`)
      
      // Delete infected file
      await supabase.storage.from(bucket_id).remove([name])
      
      // Log to audit system
      await supabase.from('audit_logs').insert({
        table_name: 'storage.objects',
        record_id: object_id,
        action: 'DELETE',
        new_data: { 
          reason: 'MALWARE_DETECTED', 
          scan_result: scanResult,
          file_name: name 
        }
      })

      return new Response(JSON.stringify({ 
        status: 'malware_deleted', 
        scan_result: scanResult 
      }), { status: 200 })
    }

    return new Response(JSON.stringify({ 
      status: 'clean', 
      scan_result: scanResult 
    }), { status: 200 })

  } catch (err) {
    console.error('Unexpected error in virus-scan function:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 })
  }
})
