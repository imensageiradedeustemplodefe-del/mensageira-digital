import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GoogleSheetsRow {
  values: any[][];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Obter token de acesso do Google
    const clientId = Deno.env.get("GOOGLE_DRIVE_CLIENT_ID");
    const clientSecret = Deno.env.get("GOOGLE_DRIVE_CLIENT_SECRET");
    const refreshToken = Deno.env.get("GOOGLE_DRIVE_REFRESH_TOKEN");

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error("Google Drive credentials not configured");
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to refresh Google access token");
    }

    const { access_token } = await tokenResponse.json();

    // Criar ou buscar planilha
    let spreadsheetId = registrations[0].spreadsheet_id;

    if (!spreadsheetId) {
      // Criar nova planilha
      const createResponse = await fetch(
        "https://sheets.googleapis.com/v4/spreadsheets",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            properties: {
              title: `Inscrições - ${event.title} - ${new Date().toLocaleDateString("pt-BR")}`,
            },
            sheets: [
              {
                properties: {
                  title: "Inscrições",
                },
              },
            ],
          }),
        }
      );

      if (!createResponse.ok) {
        throw new Error("Failed to create spreadsheet");
      }

      const spreadsheet = await createResponse.json();
      spreadsheetId = spreadsheet.spreadsheetId;
      console.log("Created new spreadsheet:", spreadsheetId);

      // Adicionar cabeçalho
      const headers = fields.map((f) => f.field_label);
      headers.push("Data de Inscrição");

      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inscrições!A1:append?valueInputOption=RAW`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: [headers],
          }),
        }
      );
    }

    // Preparar dados para inserir
    const rows = registrations.map((reg) => {
      const row = fields.map((field) => reg.registration_data[field.field_name] || "");
      row.push(new Date(reg.created_at).toLocaleString("pt-BR"));
      return row;
    });

    // Inserir dados na planilha
    const appendResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Inscrições!A2:append?valueInputOption=RAW`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: rows,
        }),
      }
    );

    if (!appendResponse.ok) {
      throw new Error("Failed to append data to spreadsheet");
    }

    console.log(`Appended ${rows.length} rows to spreadsheet`);

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