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
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
    
    if (!vapidPublicKey) {
      console.error('VAPID_PUBLIC_KEY not found in environment')
      return new Response('Configuration error', { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ 
      vapidPublicKey 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in get-vapid-key function:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})