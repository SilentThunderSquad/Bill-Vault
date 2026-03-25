import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'
import type { Database } from '../types.d.ts'

interface WarrantyThreshold {
  days: number
  type: string
}

interface ApiResponse {
  success: boolean
  notificationsCreated: number
}

interface ApiError {
  error: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
} as const

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Environment variables validation
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    // Create typed Supabase client
    const supabase = createClient<Database>(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const today = new Date()
    const thresholds: WarrantyThreshold[] = [
      { days: 30, type: 'warranty_expiry_30d' },
      { days: 7, type: 'warranty_expiry_7d' },
      { days: 1, type: 'warranty_expiry_1d' },
    ]

    let notificationsCreated = 0

    // Process each warranty threshold
    for (const { days, type } of thresholds) {
      try {
        const targetDate = new Date(today)
        targetDate.setDate(targetDate.getDate() + days)
        const targetDateStr = targetDate.toISOString().split('T')[0]

        // Find bills expiring on exactly this date
        const { data: bills, error: billsError } = await supabase
          .from('bills')
          .select('id, user_id, product_name, warranty_expiry')
          .eq('warranty_expiry', targetDateStr)

        if (billsError) {
          console.error(`Error fetching bills for ${days} days:`, billsError)
          continue
        }

        if (!bills || bills.length === 0) {
          console.log(`No bills expiring in ${days} days`)
          continue
        }

        console.log(`Found ${bills.length} bills expiring in ${days} days`)

        // Process each bill
        for (const bill of bills) {
          try {
            // Check user's notification settings
            const { data: settings, error: settingsError } = await supabase
              .from('notification_settings')
              .select('*')
              .eq('user_id', bill.user_id)
              .maybeSingle()

            if (settingsError) {
              console.error(`Error fetching notification settings for user ${bill.user_id}:`, settingsError)
              continue
            }

            // Skip if user disabled this notification tier
            if (settings) {
              if (days === 30 && !settings.notify_30_days) {
                console.log(`User ${bill.user_id} disabled 30-day notifications`)
                continue
              }
              if (days === 7 && !settings.notify_7_days) {
                console.log(`User ${bill.user_id} disabled 7-day notifications`)
                continue
              }
              if (days === 1 && !settings.notify_1_day) {
                console.log(`User ${bill.user_id} disabled 1-day notifications`)
                continue
              }
            } else {
              // Default to enabled if no settings found
              console.log(`No notification settings found for user ${bill.user_id}, using defaults`)
            }

            // Check if notification already sent for this bill + type
            const { data: existing, error: existingError } = await supabase
              .from('notifications')
              .select('id')
              .eq('bill_id', bill.id)
              .eq('type', type)
              .limit(1)

            if (existingError) {
              console.error(`Error checking existing notifications for bill ${bill.id}:`, existingError)
              continue
            }

            if (existing && existing.length > 0) {
              console.log(`Notification already exists for bill ${bill.id} and type ${type}`)
              continue
            }

            // Create in-app notification
            const message = `Warranty for "${bill.product_name}" expires in ${days} day${days !== 1 ? 's' : ''}.`

            const { error: insertError } = await supabase
              .from('notifications')
              .insert({
                user_id: bill.user_id,
                bill_id: bill.id,
                type,
                message,
                is_read: false,
                metadata: {
                  warranty_expiry: bill.warranty_expiry,
                  days_remaining: days,
                  created_by: 'system'
                }
              })

            if (insertError) {
              console.error(`Error creating notification for bill ${bill.id}:`, insertError)
              continue
            }

            notificationsCreated++
            console.log(`Created ${type} notification for bill ${bill.id}`)

            // TODO: Add email notification here if settings.email_enabled
            // Example with Resend or SendGrid integration

          } catch (billError) {
            console.error(`Error processing bill ${bill.id}:`, billError)
            continue
          }
        }
      } catch (thresholdError) {
        console.error(`Error processing threshold ${days} days:`, thresholdError)
        continue
      }
    }

    const response: ApiResponse = {
      success: true,
      notificationsCreated
    }

    console.log(`Warranty check completed. Created ${notificationsCreated} notifications.`)

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200
      }
    )
  } catch (error) {
    console.error('Function error:', error)

    const errorMessage = error instanceof Error
      ? error.message
      : 'An unknown error occurred during warranty check'

    const errorResponse: ApiError = {
      error: errorMessage
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        }
      }
    )
  }
})
