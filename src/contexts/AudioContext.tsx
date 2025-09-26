import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MediaItem {
  id: string;
  title: string;
  media_url: string;
  is_radio: boolean;
  is_published: boolean;
  artist?: string;
  description?: string;
  fallback_urls?: string[];
}

interface AudioContextType {
  // Estado do áudio
  currentMedia: MediaItem | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  error: string | null;
  loading: boolean;
  
  // Controles do áudio
  play: () => Promise<void>;
  pause: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  
  // Gerenciamento de mídia
  loadMedia: (media: MediaItem) => void;
  clearError: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar áudio global
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      
      // Configurações críticas para background playback
      audio.preload = 'none';
      audio.crossOrigin = 'anonymous';
      audio.setAttribute('data-no-pause', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.setAttribute('playsinline', 'true');
      
      // Event listeners
      audio.addEventListener('play', () => {
        setIsPlaying(true);
        setError(null);
        setRetryCount(0);
        updateMediaSession();
        console.log('[AudioContext] Audio started playing');
      });
      
      audio.addEventListener('pause', () => {
        setIsPlaying(false);
        updateMediaSession();
        console.log('[AudioContext] Audio paused');
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        updateMediaSession();
        console.log('[AudioContext] Audio ended');
      });
      
      audio.addEventListener('error', (e) => {
        console.error('[AudioContext] Audio error:', e, audio.error);
        setIsPlaying(false);
        handleAudioError();
      });
      
      audio.addEventListener('loadstart', () => {
        setLoading(true);
        setError(null);
      });
      
      audio.addEventListener('canplay', () => {
        setLoading(false);
      });
      
      audio.addEventListener('waiting', () => {
        console.log('[AudioContext] Buffering...');
      });
      
      audio.addEventListener('stalled', () => {
        console.log('[AudioContext] Stream stalled');
      });
      
      audioRef.current = audio;
    }
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Configurar Media Session API
  const setupMediaSession = useCallback(() => {
    if ('mediaSession' in navigator && currentMedia) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentMedia.title || 'Rádio Gospel',
        artist: currentMedia.artist || 'Mensageira de Deus',
        album: 'Transmissão ao vivo',
        artwork: [
          { src: '/lovable-uploads/a66b8df0-078f-4966-91ac-e6ead39aced4.png', sizes: '96x96', type: 'image/png' },
          { src: '/lovable-uploads/a66b8df0-078f-4966-91ac-e6ead39aced4.png', sizes: '128x128', type: 'image/png' },
          { src: '/lovable-uploads/a66b8df0-078f-4966-91ac-e6ead39aced4.png', sizes: '192x192', type: 'image/png' },
          { src: '/lovable-uploads/a66b8df0-078f-4966-91ac-e6ead39aced4.png', sizes: '256x256', type: 'image/png' },
          { src: '/lovable-uploads/a66b8df0-078f-4966-91ac-e6ead39aced4.png', sizes: '384x384', type: 'image/png' },
          { src: '/lovable-uploads/a66b8df0-078f-4966-91ac-e6ead39aced4.png', sizes: '512x512', type: 'image/png' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        play();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        pause();
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        pause();
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      });
    }
  }, [currentMedia]);

  // Atualizar estado da Media Session
  const updateMediaSession = useCallback(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      
      // Notificar service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller && currentMedia) {
        navigator.serviceWorker.controller.postMessage({
          type: 'MEDIA_SESSION_UPDATE',
          title: currentMedia.title || 'Rádio Gospel',
          artist: currentMedia.artist || 'Mensageira de Deus',
          artwork: [
            { src: '/lovable-uploads/a66b8df0-078f-4966-91ac-e6ead39aced4.png', sizes: '192x192', type: 'image/png' }
          ]
        });
      }
    }
  }, [isPlaying, currentMedia]);

  // Gerenciar erros de áudio com retry
  const handleAudioError = useCallback(() => {
    if (retryCount < 3) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      retryTimeoutRef.current = setTimeout(() => {
        console.log(`[AudioContext] Retrying... attempt ${retryCount + 1}/3`);
        setRetryCount(prev => prev + 1);
        if (audioRef.current && currentMedia) {
          audioRef.current.src = currentMedia.media_url;
          audioRef.current.load();
          audioRef.current.play().catch(console.error);
        }
      }, delay);
    } else {
      setError('Falha ao reproduzir mídia. Verifique sua conexão.');
      setLoading(false);
    }
  }, [retryCount, currentMedia]);

  // Helper function to detect media type
  const getMediaType = useCallback((url: string): 'spotify' | 'youtube' | 'radio' | 'audio' => {
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('stream.') || url.includes('radio') || url.includes('.fm')) return 'radio';
    return 'audio';
  }, []);

  // Controle de volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Configurar Media Session quando mídia carrega
  useEffect(() => {
    if (currentMedia) {
      setupMediaSession();
    }
  }, [currentMedia, setupMediaSession]);

  // Gerenciar mudanças de visibilidade para background playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!audioRef.current) return;

      if (document.hidden) {
        console.log('[AudioContext] App backgrounded, maintaining playback');
        // Garantir que o áudio continue em background
        if (isPlaying && audioRef.current.paused) {
          audioRef.current.play().catch(console.error);
        }
      } else {
        console.log('[AudioContext] App foregrounded');
        // Sincronizar estado quando volta ao foreground
        if (isPlaying && audioRef.current.paused) {
          audioRef.current.play().catch(console.error);
        }
      }
    };

    const handleBeforeUnload = () => {
      console.log('[AudioContext] Page unloading, audio will continue');
      // O áudio global deve continuar rodando
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isPlaying]);

  // Funções de controle
  const play = useCallback(async () => {
    if (!audioRef.current || !currentMedia) return;

    const mediaType = getMediaType(currentMedia.media_url);
    
    // Verificar se é um URL válido para reprodução
    if (mediaType === 'spotify') {
      setError('Este tipo de mídia deve ser aberto em aplicativo externo');
      setLoading(false);
      return;
    }

    // Para YouTube URLs, abrir externamente como Spotify
    if (mediaType === 'youtube') {
      setError('Este tipo de mídia deve ser aberto em aplicativo externo');
      setLoading(false);
      return;
    }

    // Validar se a URL parece ser um stream válido
    const isValidStreamUrl = currentMedia.media_url.match(/\.(mp3|aac|m3u8|pls|m3u)$/i) || 
                            currentMedia.media_url.includes('stream') ||
                            currentMedia.media_url.includes('radio') ||
                            currentMedia.media_url.includes('.fm') ||
                            currentMedia.is_radio; // Allow URLs marked as radio

    if (!isValidStreamUrl && mediaType !== 'radio') {
      setError('URL de mídia inválida para reprodução');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      
      // Configurar fonte se necessário
      if (audioRef.current.src !== currentMedia.media_url) {
        audioRef.current.src = currentMedia.media_url;
        audioRef.current.load();
      }
      
      // Definir volume
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      
      // Reproduzir
      await audioRef.current.play();
      
      // Atualizar contadores de play
      await supabase
        .from('media_items')
        .update({ play_count: ((currentMedia as any).play_count || 0) + 1 })
        .eq('id', currentMedia.id);
        
    } catch (error) {
      console.error('[AudioContext] Play error:', error);
      setLoading(false);
      handleAudioError();
    }
  }, [currentMedia, isMuted, volume, handleAudioError, getMediaType]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const loadMedia = useCallback((media: MediaItem) => {
    // Pausar áudio atual se estiver tocando
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
    
    const mediaType = getMediaType(media.media_url);
    
    // Não carregar no contexto de áudio se for Spotify ou YouTube
    if (mediaType === 'spotify' || mediaType === 'youtube') {
      console.log(`[AudioContext] ${mediaType} URL detected, skipping audio context load`);
      setCurrentMedia(null);
      setError(null);
      setRetryCount(0);
      setLoading(false);
      return;
    }
    
    setCurrentMedia(media);
    setError(null);
    setRetryCount(0);
    setLoading(false);
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, [getMediaType]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AudioContextType = {
    currentMedia,
    isPlaying,
    volume,
    isMuted,
    error,
    loading,
    play,
    pause,
    setVolume,
    toggleMute,
    loadMedia,
    clearError,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};