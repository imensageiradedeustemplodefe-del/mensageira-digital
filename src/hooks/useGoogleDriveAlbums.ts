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

const CACHE_KEY = 'google_drive_albums_cache';
const CACHE_TIMESTAMP_KEY = 'google_drive_albums_cache_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas em ms

export const useGoogleDriveAlbums = (scriptUrl: string | null) => {
  const [albums, setAlbums] = useState<DriveAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega álbuns do cache
  const loadFromCache = (): DriveAlbum[] | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      const timestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cached && timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age < CACHE_DURATION) {
          return JSON.parse(cached);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar cache:', err);
    }
    return null;
  };

  // Salva álbuns no cache
  const saveToCache = (data: DriveAlbum[]) => {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
      sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (err) {
      console.error('Erro ao salvar cache:', err);
    }
  };

  const fetchAlbums = async (forceRefresh = false) => {
    if (!scriptUrl) {
      setError('URL do script não configurada');
      return;
    }

    // Se não for refresh forçado, tenta carregar do cache primeiro
    if (!forceRefresh) {
      const cachedAlbums = loadFromCache();
      if (cachedAlbums && cachedAlbums.length > 0) {
        setAlbums(cachedAlbums);
        return;
      }
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
      const albumsData = data.albums || [];
      
      setAlbums(albumsData);
      saveToCache(albumsData);
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
    refetch: () => fetchAlbums(true)
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
