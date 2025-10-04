import { useState, useEffect } from 'react';

export interface DrivePhoto {
  id: string;
  name: string;
  createdTime: string;
  mimeType: string;
  thumbUrl: string;
  viewUrl: string;
}

export interface DriveAlbum {
  id: string;
  name: string;
  coverUrl?: string;
  photoCount?: number;
}

export interface DriveGalleryData {
  folderId: string;
  order: string;
  pageSize: number;
  nextPageToken: string | null;
  items: DrivePhoto[];
}

export const useGoogleDriveAlbums = (scriptUrl: string | null) => {
  const [albums, setAlbums] = useState<DriveAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbums = async () => {
    if (!scriptUrl) {
      setError('URL do script não configurada');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Chama o endpoint /albums do Apps Script
      const response = await fetch(`${scriptUrl}?action=albums`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar álbuns do Google Drive');
      }

      const data = await response.json();
      setAlbums(data.albums || []);
    } catch (err) {
      console.error('Erro ao buscar álbuns:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scriptUrl) {
      fetchAlbums();
    }
  }, [scriptUrl]);

  return {
    albums,
    loading,
    error,
    refetch: fetchAlbums
  };
};

export const useGoogleDrivePhotos = (
  scriptUrl: string | null,
  albumId?: string,
  pageSize: number = 24,
  order: 'newest' | 'oldest' | 'name' = 'newest'
) => {
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = async (pageToken?: string) => {
    if (!scriptUrl) {
      setError('URL do script não configurada');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
        order,
        ...(albumId && { album: albumId }),
        ...(pageToken && { pageToken })
      });

      const response = await fetch(`${scriptUrl}?${params}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar fotos do Google Drive');
      }

      const data: DriveGalleryData = await response.json();
      
      if (pageToken) {
        // Adiciona mais fotos (paginação)
        setPhotos(prev => [...prev, ...data.items]);
      } else {
        // Primeira carga
        setPhotos(data.items);
      }
      
      setNextPageToken(data.nextPageToken);
    } catch (err) {
      console.error('Erro ao buscar fotos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (nextPageToken && !loading) {
      fetchPhotos(nextPageToken);
    }
  };

  useEffect(() => {
    if (scriptUrl) {
      // Limpa as fotos imediatamente ao mudar de álbum
      setPhotos([]);
      setNextPageToken(null);
      fetchPhotos();
    }
  }, [scriptUrl, albumId, order]);

  return {
    photos,
    loading,
    error,
    hasMore: !!nextPageToken,
    loadMore,
    refetch: () => fetchPhotos()
  };
};
