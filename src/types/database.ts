// Shared types based on Supabase database schema
import { Database } from "@/integrations/supabase/types";

// Extract types from Supabase schema
export type LiveStream = Database['public']['Tables']['live_streams']['Row'];
export type LiveStreamInsert = Database['public']['Tables']['live_streams']['Insert'];
export type LiveStreamUpdate = Database['public']['Tables']['live_streams']['Update'];

export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];
export type EventUpdate = Database['public']['Tables']['events']['Update'];

export type PrayerRequest = Database['public']['Tables']['prayer_requests']['Row'];
export type PrayerRequestInsert = Database['public']['Tables']['prayer_requests']['Insert'];
export type PrayerRequestUpdate = Database['public']['Tables']['prayer_requests']['Update'];

export type Testimony = Database['public']['Tables']['testimonies']['Row'];
export type TestimonyInsert = Database['public']['Tables']['testimonies']['Insert'];
export type TestimonyUpdate = Database['public']['Tables']['testimonies']['Update'];

export type GalleryPhoto = Database['public']['Tables']['gallery_photos']['Row'];
export type GalleryPhotoInsert = Database['public']['Tables']['gallery_photos']['Insert'];
export type GalleryPhotoUpdate = Database['public']['Tables']['gallery_photos']['Update'];

export type MediaItem = Database['public']['Tables']['media_items']['Row'];
export type MediaItemInsert = Database['public']['Tables']['media_items']['Insert'];
export type MediaItemUpdate = Database['public']['Tables']['media_items']['Update'];

// Platform types for live streams
export type StreamPlatform = 'youtube' | 'facebook' | 'custom';

// Event categories
export type EventCategory = 'culto' | 'evento-especial' | 'conferencia' | 'reuniao' | 'geral';

// Prayer request categories  
export type PrayerCategory = 'saude' | 'familia' | 'trabalho' | 'financeiro' | 'espiritual' | 'geral';