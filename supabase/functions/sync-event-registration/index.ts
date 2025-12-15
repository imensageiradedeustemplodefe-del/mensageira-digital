import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('[sync-event-registration] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Create client with anon key for user verification
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // 3. Verify user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      console.log('[sync-event-registration] Invalid authentication:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[sync-event-registration] User authenticated:', user.id);

    // 4. Check admin role using has_role RPC
    const { data: isAdmin, error: roleError } = await supabaseAuth
      .rpc('has_role', { _user_id: user.id, _role: 'admin' });

    if (roleError || !isAdmin) {
      console.log('[sync-event-registration] Admin check failed:', roleError?.message || 'User is not admin');
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[sync-event-registration] Admin verified, proceeding with sync');

    // 5. Create service client for data operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { eventId } = await req.json();
    console.log("Syncing registrations for event:", eventId);

    // Buscar evento
    const { data: event, error: eventError } = await supabaseClient
      .from("events")
      .select("title")
      .eq("id", eventId)
      .single();

    if (eventError) {
      throw new Error(`Event not found: ${eventError.message}`);
    }

    // Buscar campos do formulário
    const { data: fields, error: fieldsError } = await supabaseClient
      .from("event_registration_fields")
      .select("*")
      .eq("event_id", eventId)
      .order("field_order");

    if (fieldsError) {
      throw new Error(`Fields not found: ${fieldsError.message}`);
    }

    // Buscar inscrições não sincronizadas
    const { data: registrations, error: regsError } = await supabaseClient
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId)
      .eq("synced_to_sheets", false);

    if (regsError) {
      throw new Error(`Registrations not found: ${regsError.message}`);
    }

    if (!registrations || registrations.length === 0) {
      console.log("No registrations to sync");
      return new Response(
        JSON.stringify({ message: "No registrations to sync" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${registrations.length} registrations to sync`);

    // Buscar configuração do Apps Script
    const { data: settings, error: settingsError } = await supabaseClient
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "event_registration_script_url")
      .single();

    if (settingsError || !settings?.setting_value) {
      throw new Error("Google Apps Script URL não configurado. Configure em Configurações do Site.");
    }

    const scriptUrl = settings.setting_value;
    console.log("Using Apps Script URL:", scriptUrl);

    // Enviar dados para o Google Apps Script
    const scriptResponse = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventTitle: event.title,
        fields: fields,
        registrations: registrations,
      }),
    });

    if (!scriptResponse.ok) {
      const errorText = await scriptResponse.text();
      throw new Error(`Apps Script error: ${errorText}`);
    }

    const scriptResult = await scriptResponse.json();
    
    if (!scriptResult.success) {
      throw new Error(scriptResult.error || "Apps Script returned error");
    }

    const spreadsheetId = scriptResult.spreadsheetId;
    console.log(`Apps Script created/updated spreadsheet: ${spreadsheetId}`);

    // Marcar inscrições como sincronizadas
    const updatePromises = registrations.map((reg) =>
      supabaseClient
        .from("event_registrations")
        .update({
          spreadsheet_id: spreadsheetId,
          synced_to_sheets: true,
          synced_at: new Date().toISOString(),
        })
        .eq("id", reg.id)
    );

    await Promise.all(updatePromises);

    return new Response(
      JSON.stringify({
        success: true,
        spreadsheetId,
        syncedCount: registrations.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error syncing registrations:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
