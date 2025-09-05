import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GalleryAlbum {
  id: string;
  name: string;
  description?: string;
  cover_photo_url?: string;
  event_date?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  photos?: any[];
}

export interface CreateAlbumData {
  name: string;
  description?: string;
  cover_photo_url?: string;
  event_date?: string;
  is_published?: boolean;
}

export interface UpdateAlbumData {
  name?: string;
  description?: string;
  cover_photo_url?: string;
  event_date?: string;
  is_published?: boolean;
}

export const useGalleryAlbums = (publishedOnly: boolean = false) => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('gallery_albums')
        .select(`
          *,
          gallery_photos (
            id,
            title,
            image_url,
            is_published
          )
        `)
        .order('created_at', { ascending: false });

      if (publishedOnly) {
        query = query.eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      const albumsWithPhotos = (data || []).map(album => ({
        ...album,
        photos: album.gallery_photos || []
      }));

      setAlbums(albumsWithPhotos);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar álbuns:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAlbum = async (albumData: CreateAlbumData) => {
    try {
      const { data, error } = await supabase
        .from('gallery_albums')
        .insert([albumData])
        .select()
        .single();

      if (error) throw error;

      await fetchAlbums();
      return data;
    } catch (err) {
      console.error('Erro ao criar álbum:', err);
      throw err;
    }
  };

  const updateAlbum = async (id: string, albumData: UpdateAlbumData) => {
    try {
      const { data, error } = await supabase
        .from('gallery_albums')
        .update(albumData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchAlbums();
      return data;
    } catch (err) {
      console.error('Erro ao atualizar álbum:', err);
      throw err;
    }
  };

  const deleteAlbum = async (id: string) => {
    try {
      const { error } = await supabase
        .from('gallery_albums')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchAlbums();
    } catch (err) {
      console.error('Erro ao deletar álbum:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, [publishedOnly]);

  return {
    albums,
    loading,
    error,
    fetchAlbums,
    createAlbum,
    updateAlbum,
    deleteAlbum
  };
};