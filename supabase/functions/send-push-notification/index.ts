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

    // Send notifications to all subscriptions
    const notificationPromises = subscriptions.map(async (subscription: any) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        }

        // Use web-push library functionality via fetch to send notification
        const webPushResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${vapidPrivateKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: subscription.endpoint.split('/').pop(),
            notification: notificationPayload
          })
        })

        if (!webPushResponse.ok) {
          console.error(`Failed to send notification to ${subscription.endpoint}:`, webPushResponse.statusText)
          
          // If subscription is invalid, mark as inactive
          if (webPushResponse.status === 410) {
            await fetch(`${supabaseUrl}/rest/v1/push_subscriptions?id=eq.${subscription.id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ is_active: false })
            })
          }
        }

        return { success: true, subscriptionId: subscription.id }
      } catch (error) {
        console.error(`Error sending notification to subscription ${subscription.id}:`, error)
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
      failed: failureCount
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