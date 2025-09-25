import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Test push notification request received')
    
    // Call the send-push-notification function
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: '🔔 Teste de Notificação',
        body: 'Esta é uma notificação de teste. Se você recebeu esta mensagem, as notificações estão funcionando!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        url: '/'
      })
    })

    const result = await response.text()
    console.log('Send notification response:', result)

    return new Response(JSON.stringify({
      message: 'Test notification sent',
      response: result,
      status: response.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in test-push-notification function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})