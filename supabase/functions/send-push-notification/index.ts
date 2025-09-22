import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import webPush from 'npm:web-push@3.6.7'

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Push notification request received')
    
    const { title, body, icon = '/favicon.ico', badge = '/favicon.ico', url = '/' } = await req.json() as PushNotificationPayload

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!vapidPublicKey || !vapidPrivateKey || !supabaseUrl || !supabaseServiceKey) {
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
    const notificationPayload = {
      title,
      body,
      icon,
      badge,
      data: {
        url
      }
    }

    // Validate and configure web-push with VAPID keys
    console.log('VAPID Public Key length:', vapidPublicKey?.length)
    console.log('VAPID Private Key length:', vapidPrivateKey?.length)
    
    // Ensure keys are properly formatted
    const cleanPublicKey = vapidPublicKey?.trim()
    const cleanPrivateKey = vapidPrivateKey?.trim()
    
    if (!cleanPublicKey || !cleanPrivateKey) {
      console.error('Missing VAPID keys')
      return new Response('Missing VAPID configuration', { status: 500, headers: corsHeaders })
    }
    
    webPush.setVapidDetails(
      'mailto:admin@igreja.com',
      cleanPublicKey,
      cleanPrivateKey
    )

    // Send notifications to all subscriptions
    const notificationPromises = subscriptions.map(async (subscription: any) => {
      try {
        // Skip subscriptions without proper keys (native/FCM endpoints)
        if (!subscription.p256dh || !subscription.auth) {
          console.log(`Skipping subscription without keys: ${subscription.endpoint.substring(0, 50)}...`)
          return { success: false, subscriptionId: subscription.id, error: 'Missing subscription keys' }
        }
        
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        }

        console.log(`Sending notification to endpoint: ${subscription.endpoint.substring(0, 50)}...`)

        // Send push notification using web-push library
        await webPush.sendNotification(
          pushSubscription,
          JSON.stringify(notificationPayload),
          {
            TTL: 86400, // 24 hours
            urgency: 'normal',
            topic: 'igreja-notification'
          }
        )

        console.log(`Successfully sent notification to subscription ${subscription.id}`)
        return { success: true, subscriptionId: subscription.id }

      } catch (error) {
        console.error(`Error sending notification to subscription ${subscription.id}:`, error)
        
        // If subscription is invalid (410 error), mark as inactive
        if (error.statusCode === 410) {
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

        return { success: false, subscriptionId: subscription.id, error: error.message }
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
      total: subscriptions.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in send-push-notification function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})