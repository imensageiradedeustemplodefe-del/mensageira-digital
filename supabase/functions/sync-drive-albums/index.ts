import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DriveAlbum {
  id: string;
  name: string;
  coverUrl?: string;
  photoCount?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Iniciando sincronização de álbuns do Google Drive...');

    // Criar cliente Supabase com privilégios de admin
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar a URL do Apps Script das configurações
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'google_drive_script_url')
      .single();

    if (settingsError || !settings?.setting_value) {
      console.error('❌ URL do Google Drive Script não configurada');
      throw new Error('URL do Google Drive Script não configurada');
    }

    const scriptUrl = settings.setting_value;
    console.log('📍 URL do script:', scriptUrl.substring(0, 50) + '...');

    // Buscar álbuns do Google Drive
    console.log('📥 Buscando álbuns do Google Drive...');
    const driveResponse = await fetch(`${scriptUrl}?action=albums`);
    
    if (!driveResponse.ok) {
      throw new Error(`Erro ao buscar álbuns: ${driveResponse.status} ${driveResponse.statusText}`);
    }

    const driveData = await driveResponse.json();
    const albums: DriveAlbum[] = driveData.albums || [];
    
    console.log(`📊 ${albums.length} álbuns encontrados no Google Drive`);

    if (albums.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhum álbum encontrado no Google Drive',
          synced: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let syncedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;

    // Sincronizar cada álbum
    for (const album of albums) {
      console.log(`🔄 Processando álbum: ${album.name}`);
      
      // Extrair data do nome do álbum (formato: DD.MM.AAAA ou DD-MM-AAAA)
      const dateMatch = album.name.match(/(\d{2})[\.\-](\d{2})[\.\-](\d{4})/);
      let eventDate = null;
      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        eventDate = `${year}-${month}-${day}`;
      }

      // Verificar se o álbum já existe no Supabase
      const { data: existingAlbum, error: selectError } = await supabase
        .from('gallery_albums')
        .select('id, name, cover_photo_url, drive_folder_id')
        .eq('name', album.name)
        .maybeSingle();

      if (selectError) {
        console.error(`❌ Erro ao verificar álbum ${album.name}:`, selectError);
        continue;
      }

      const albumData = {
        name: album.name,
        cover_photo_url: album.coverUrl || null,
        event_date: eventDate,
        is_published: true,
        description: `Álbum sincronizado do Google Drive${dateMatch ? ` - ${dateMatch[0]}` : ''}`,
        drive_folder_id: album.id // Salva o ID da pasta do Google Drive
      };

      if (existingAlbum) {
        // Atualiza se a capa mudou OU se o drive_folder_id ainda não foi preenchido/mudou
        const shouldUpdate =
          existingAlbum.cover_photo_url !== (album.coverUrl || null) ||
          !existingAlbum.drive_folder_id ||
          existingAlbum.drive_folder_id !== album.id;

        if (shouldUpdate) {
          const { error: updateError } = await supabase
            .from('gallery_albums')
            .update(albumData)
            .eq('id', existingAlbum.id);

          if (updateError) {
            console.error(`❌ Erro ao atualizar álbum ${album.name}:`, updateError);
          } else {
            console.log(`✅ Álbum atualizado: ${album.name}`);
            updatedCount++;
            syncedCount++;
          }
        } else {
          console.log(`⏭️ Álbum já existe e está atualizado: ${album.name}`);
        }
      } else {
        // Criar novo álbum
        const { error: insertError } = await supabase
          .from('gallery_albums')
          .insert([albumData]);

        if (insertError) {
          console.error(`❌ Erro ao criar álbum ${album.name}:`, insertError);
        } else {
          console.log(`✅ Álbum criado: ${album.name}`);
          createdCount++;
          syncedCount++;
        }
      }
    }

    console.log(`🎉 Sincronização concluída: ${syncedCount} álbuns (${createdCount} novos, ${updatedCount} atualizados)`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sincronização concluída com sucesso`,
        total: albums.length,
        synced: syncedCount,
        created: createdCount,
        updated: updatedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Erro na sincronização:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
