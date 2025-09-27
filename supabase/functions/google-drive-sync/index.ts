import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  modifiedTime: string;
  webViewLink: string;
  thumbnailLink?: string;
  imageMediaMetadata?: any;
}

interface DriveFolder {
  id: string;
  name: string;
  files: DriveFile[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supabaseClient.auth.getUser(token)
    const user = data.user

    if (!user) {
      throw new Error('Not authenticated')
    }

    const body = await req.json()
    const { action, folderId, albumName, albumDescription } = body

    console.log('Google Drive sync action:', action, 'folderId:', folderId)
    
    // Get Google Drive credentials
    const CLIENT_ID = Deno.env.get('GOOGLE_DRIVE_CLIENT_ID')
    const CLIENT_SECRET = Deno.env.get('GOOGLE_DRIVE_CLIENT_SECRET')
    const REFRESH_TOKEN = Deno.env.get('GOOGLE_DRIVE_REFRESH_TOKEN')

    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      throw new Error('Google Drive credentials not configured')
    }

    // Get access token
    console.log('Attempting to refresh Google Drive token...')
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: 'refresh_token'
      })
    })

    const tokenData = await tokenResponse.json()
    console.log('Token response status:', tokenResponse.status)
    console.log('Token response data:', tokenData)
    
    if (!tokenData.access_token) {
      console.error('No access token in response:', tokenData)
      throw new Error(`Failed to get Google Drive access token: ${tokenData.error || 'Unknown error'}`)
    }

    const accessToken = tokenData.access_token

    switch (action) {
      case 'list_folders':
        return await listDriveFolders(accessToken)
      
      case 'list_photos':
        return await listFolderPhotos(accessToken, folderId)
      
      case 'import_album':
        return await importAlbumFromDrive(supabaseClient, accessToken, folderId, albumName, albumDescription)
      
      case 'sync_photos':
        return await syncPhotosFromDrive(supabaseClient, accessToken, folderId)
      
      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Error in google-drive-sync:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function listDriveFolders(accessToken: string) {
  console.log('Listing Google Drive folders...')
  
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder'&fields=files(id,name,parents,modifiedTime)&orderBy=name`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )

  const data = await response.json()
  console.log('Found folders:', data.files?.length || 0)

  return new Response(
    JSON.stringify({ folders: data.files || [] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function listFolderPhotos(accessToken: string, folderId: string) {
  console.log('Listing photos in folder:', folderId)
  
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and (mimeType contains 'image/')&fields=files(id,name,mimeType,parents,modifiedTime,webViewLink,thumbnailLink,imageMediaMetadata)&orderBy=modifiedTime desc`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )

  const data = await response.json()
  console.log('Found photos:', data.files?.length || 0)

  return new Response(
    JSON.stringify({ photos: data.files || [] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function importAlbumFromDrive(supabaseClient: any, accessToken: string, folderId: string, albumName: string, albumDescription?: string) {
  console.log('Importing album from Drive folder:', folderId)

  // Get folder info
  const folderResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,modifiedTime`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )
  const folderData = await folderResponse.json()
  
  // Create album in Supabase
  const { data: album, error: albumError } = await supabaseClient
    .from('gallery_albums')
    .insert({
      name: albumName || folderData.name,
      description: albumDescription || `Importado do Google Drive: ${folderData.name}`,
      event_date: new Date().toISOString().split('T')[0],
      is_published: false
    })
    .select()
    .single()

  if (albumError) throw albumError
  console.log('Created album:', album.id)

  // Get photos from folder
  const photosResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and (mimeType contains 'image/')&fields=files(id,name,mimeType,parents,modifiedTime,webViewLink,thumbnailLink,imageMediaMetadata)&orderBy=modifiedTime desc`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )
  const photosData = await photosResponse.json()
  const photos = photosData.files || []

  console.log('Importing', photos.length, 'photos...')

  // Import each photo
  let importedCount = 0
  for (const photo of photos) {
    try {
      // Get shareable link for the photo
      const shareableUrl = await getDriveImageUrl(accessToken, photo.id)
      
      // Create photo record
      const { data: galleryPhoto, error: photoError } = await supabaseClient
        .from('gallery_photos')
        .insert({
          title: photo.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          description: `Importado do Google Drive`,
          image_url: shareableUrl,
          album_id: album.id,
          category_id: null, // Will need to be set manually
          event_date: new Date(photo.modifiedTime).toISOString().split('T')[0],
          participants: 0,
          is_published: false
        })
        .select()
        .single()

      if (photoError) {
        console.error('Error creating photo:', photoError)
        continue
      }

      // Track the imported photo
      await supabaseClient
        .from('google_drive_photos')
        .insert({
          gallery_photo_id: galleryPhoto.id,
          drive_file_id: photo.id,
          drive_folder_id: folderId,
          drive_modified_time: photo.modifiedTime
        })

      importedCount++
    } catch (error) {
      console.error('Error importing photo:', photo.name, error)
    }
  }

  console.log('Imported', importedCount, 'photos successfully')

  return new Response(
    JSON.stringify({ 
      success: true, 
      album: album,
      imported_photos: importedCount,
      total_photos: photos.length
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function syncPhotosFromDrive(supabaseClient: any, accessToken: string, folderId: string) {
  console.log('Syncing photos from Drive folder:', folderId)

  // Get existing synced photos for this folder
  const { data: existingPhotos } = await supabaseClient
    .from('google_drive_photos')
    .select('drive_file_id, drive_modified_time, gallery_photo_id')
    .eq('drive_folder_id', folderId)

  const existingIds = new Set(existingPhotos?.map((p: any) => p.drive_file_id) || [])

  // Get current photos from Drive
  const photosResponse = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents and (mimeType contains 'image/')&fields=files(id,name,mimeType,parents,modifiedTime,webViewLink,thumbnailLink)&orderBy=modifiedTime desc`,
    {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }
  )
  const photosData = await photosResponse.json()
  const currentPhotos = photosData.files || []

  let newPhotos = 0
  let updatedPhotos = 0

  for (const photo of currentPhotos) {
    if (!existingIds.has(photo.id)) {
      // New photo - would need album context to import
      newPhotos++
    } else {
      // Check if photo was modified
      const existing = existingPhotos?.find((p: any) => p.drive_file_id === photo.id)
      if (existing && new Date(photo.modifiedTime) > new Date(existing.drive_modified_time)) {
        // Photo was updated in Drive
        updatedPhotos++
      }
    }
  }

  return new Response(
    JSON.stringify({ 
      success: true,
      stats: {
        total_in_drive: currentPhotos.length,
        already_synced: existingIds.size,
        new_photos: newPhotos,
        updated_photos: updatedPhotos
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function getDriveImageUrl(accessToken: string, fileId: string): Promise<string> {
  // Make the file public and get a shareable link
  try {
    // First, try to get the file's webContentLink
    const fileResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=webContentLink,webViewLink`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    )
    
    const fileData = await fileResponse.json()
    
    if (fileData.webContentLink) {
      return fileData.webContentLink
    }
    
    // Fallback to a viewable link format
    return `https://drive.google.com/uc?id=${fileId}&export=download`
    
  } catch (error) {
    console.error('Error getting Drive image URL:', error)
    // Final fallback
    return `https://drive.google.com/uc?id=${fileId}&export=download`
  }
}