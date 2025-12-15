import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple encryption function using Web Crypto API
async function encryptData(data: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32)); // Ensure 32 bytes
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  const encodedData = encoder.encode(data);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    cryptoKey,
    encodedData
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

// Simple decryption function
async function decryptData(encryptedData: string, key: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32)); // Ensure 32 bytes
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Decode from base64
    const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      encrypted
    );
    
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Dados criptografados - erro na descriptografia]';
  }
}

// Generate hash for key verification
async function generateKeyHash(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return btoa(String.fromCharCode(...hashArray)).slice(0, 16); // Short hash for verification
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin access
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin using has_role RPC function
    const { data: isAdmin, error: roleError } = await supabaseClient
      .rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

    if (roleError || !isAdmin) {
      console.log('[encrypt-contact-data] Admin check failed:', roleError?.message || 'User is not admin');
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, prayer_request_id, email, phone } = await req.json();
    
    // CRITICAL: Use ONLY the secure encryption key from environment
    // Never use fallback keys - fail fast if not configured properly
    const encryptionKey = Deno.env.get('CONTACT_ENCRYPTION_KEY');
    
    if (!encryptionKey) {
      console.error('[encrypt-contact-data] SECURITY ERROR: CONTACT_ENCRYPTION_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Encryption key not configured. Contact system administrator.',
          code: 'ENCRYPTION_KEY_MISSING'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate encryption key strength (minimum 32 characters)
    if (encryptionKey.length < 32) {
      console.error('[encrypt-contact-data] SECURITY ERROR: Weak encryption key');
      return new Response(
        JSON.stringify({ 
          error: 'Encryption key does not meet security requirements',
          code: 'WEAK_ENCRYPTION_KEY'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'encrypt_and_store') {
      console.log(`[encrypt-contact-data] Encrypting data for prayer request: ${prayer_request_id}`);
      
      let encryptedEmail = null;
      let encryptedPhone = null;
      
      if (email) {
        encryptedEmail = await encryptData(email, encryptionKey);
      }
      
      if (phone) {
        encryptedPhone = await encryptData(phone, encryptionKey);
      }
      
      const keyHash = await generateKeyHash(encryptionKey);
      
      // Store encrypted data using the secure function
      const { data, error } = await supabaseClient.rpc('store_encrypted_contact', {
        p_prayer_request_id: prayer_request_id,
        p_encrypted_email: encryptedEmail,
        p_encrypted_phone: encryptedPhone,
        p_key_hash: keyHash
      });
      
      if (error) {
        console.error('[encrypt-contact-data] Storage error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to store encrypted data', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`[encrypt-contact-data] Successfully stored encrypted contact for request: ${prayer_request_id}`);
      
      return new Response(
        JSON.stringify({ success: true, encrypted_contact_id: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } else if (action === 'decrypt_and_retrieve') {
      console.log(`[encrypt-contact-data] Decrypting data for prayer request: ${prayer_request_id}`);
      
      // Retrieve encrypted data using the secure function
      const { data, error } = await supabaseClient.rpc('get_encrypted_contact', {
        p_prayer_request_id: prayer_request_id
      });
      
      if (error) {
        console.error('[encrypt-contact-data] Retrieval error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to retrieve encrypted data', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({ email: null, phone: null }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const contactData = data[0];
      let decryptedEmail = null;
      let decryptedPhone = null;
      
      if (contactData.encrypted_email) {
        decryptedEmail = await decryptData(contactData.encrypted_email, encryptionKey);
      }
      
      if (contactData.encrypted_phone) {
        decryptedPhone = await decryptData(contactData.encrypted_phone, encryptionKey);
      }
      
      console.log(`[encrypt-contact-data] Successfully decrypted contact for request: ${prayer_request_id}`);
      
      return new Response(
        JSON.stringify({ 
          email: decryptedEmail, 
          phone: decryptedPhone,
          key_hash: contactData.encryption_key_hash 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "encrypt_and_store" or "decrypt_and_retrieve"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
  } catch (error) {
    console.error('[encrypt-contact-data] Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});