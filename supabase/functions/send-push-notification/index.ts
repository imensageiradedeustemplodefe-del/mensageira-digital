import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
}

// Simple push notification sender using FCM format
async function sendPushNotification(
  endpoint: string,
  payload: string,
  auth: string,
  p256dh: string
): Promise<boolean> {
  try {
    // For FCM endpoints, we can send directly
    if (endpoint.includes('fcm.googleapis.com')) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'TTL': '86400',
        },
        body: payload
      })
      return response.ok
    }
    
    // For other endpoints, try a simple POST
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
      },
      body: payload
    })
    
    return response.ok
  } catch (error) {
    console.error('Push notification failed:', error)
    return false
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Push notification request received')
    
    const { title, body, icon = '/favicon.ico', badge = '/favicon.ico', url = '/' } = await req.json() as PushNotificationPayload

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables')
      return new Response('Missing configuration', { status: 500, headers: corsHeaders })
    }

    // Get all active push subscriptions from database
    const subscriptionsResponse = await fetch(`${supabaseUrl}/rest/v1/push_subscriptions?is_active=eq.true&select=*`, {
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json'
      }
    })

    if (!subscriptionsResponse.ok) {
      console.error('Failed to fetch subscriptions:', subscriptionsResponse.statusText)
      return new Response('Failed to fetch subscriptions', { status: 500, headers: corsHeaders })
    }

    const subscriptions = await subscriptionsResponse.json()
    console.log(`Found ${subscriptions.length} active subscriptions`)

    if (subscriptions.length === 0) {
      console.log('No active subscriptions found')
      return new Response(JSON.stringify({ message: 'No active subscriptions' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title,
      body,
      icon,
      badge,
      data: {
        url
      }
    })

    // Send notifications to all subscriptions
    const notificationPromises = subscriptions.map(async (subscription: any) => {
      try {
        console.log(`Sending notification to endpoint: ${subscription.endpoint.substring(0, 50)}...`)

        const success = await sendPushNotification(
          subscription.endpoint,
          notificationPayload,
          subscription.auth || '',
          subscription.p256dh || ''
        )

        if (success) {
          console.log(`Successfully sent notification to subscription ${subscription.id}`)
          return { success: true, subscriptionId: subscription.id }
        } else {
          console.log(`Failed to send notification to subscription ${subscription.id}`)
          return { success: false, subscriptionId: subscription.id, error: 'Push service error' }
        }

      } catch (error) {
        console.error(`Error sending notification to subscription ${subscription.id}:`, error)
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        // If subscription is invalid (410 error), mark as inactive
        if (errorMessage.includes('410')) {
          console.log(`Marking subscription ${subscription.id} as inactive due to 410 error`)
          try {
            await fetch(`${supabaseUrl}/rest/v1/push_subscriptions?id=eq.${subscription.id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ is_active: false })
            })
          } catch (dbError) {
            console.error(`Failed to mark subscription as inactive:`, dbError)
          }
        }

        return { success: false, subscriptionId: subscription.id, error: errorMessage }
      }
    })

    const results = await Promise.all(notificationPromises)
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    console.log(`Notifications sent - Success: ${successCount}, Failures: ${failureCount}`)

    return new Response(JSON.stringify({
      message: 'Push notifications processed',
      successful: successCount,
      failed: failureCount,
      total: subscriptions.length,
      results: results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in send-push-notification function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})