import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Radio, Volume2, VolumeX, Youtube, RefreshCw, AlertTriangle } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

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

export function MediaPlayer() {
  const [gospelRadio, setGospelRadio] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get all available URLs (main + fallbacks)
  const getAvailableUrls = useCallback((): string[] => {
    if (!gospelRadio) return [];
    const urls = [gospelRadio.media_url];
    if (gospelRadio.fallback_urls?.length) {
      urls.push(...gospelRadio.fallback_urls);
    }
    return urls.filter(Boolean);
  }, [gospelRadio]);

  // Retry logic with exponential backoff
  const scheduleRetry = useCallback((attemptNumber: number) => {
    if (attemptNumber >= 3) {
      setError('Não foi possível conectar ao servidor de mídia após várias tentativas.');
      setIsRetrying(false);
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, attemptNumber), 10000); // Max 10s
    setIsRetrying(true);
    
    retryTimeoutRef.current = setTimeout(() => {
      setRetryCount(attemptNumber + 1);
      tryNextUrl();
    }, delay);
  }, []);

  // Try next available URL
  const tryNextUrl = useCallback(() => {
    const urls = getAvailableUrls();
    if (currentUrlIndex < urls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setError(null);
      return true;
    }
    return false;
  }, [getAvailableUrls, currentUrlIndex]);

  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      
      // Configure audio for background playbook
      audio.preload = 'metadata';
      audio.crossOrigin = 'anonymous';
      
      // Critical: Configure for background playback
      audio.setAttribute('data-no-pause', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.setAttribute('playsinline', 'true');
      
      // Success handlers
      audio.addEventListener('play', () => {
        setIsPlaying(true);
        setError(null);
        setRetryCount(0);
        setIsRetrying(false);
        updateMediaSession();
        console.log('[MediaPlayer] Audio started playing');
      });
      
      audio.addEventListener('pause', () => {
        setIsPlaying(false);
        updateMediaSession();
        console.log('[MediaPlayer] Audio paused');
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        updateMediaSession();
        console.log('[MediaPlayer] Audio ended');
      });

      // Loading progress handlers
      audio.addEventListener('loadstart', () => {
        setError(null);
        console.log('[MediaPlayer] Loading started');
      });

      audio.addEventListener('canplay', () => {
        console.log('[MediaPlayer] Can start playing');
      });

      audio.addEventListener('canplaythrough', () => {
        console.log('[MediaPlayer] Can play through without buffering');
      });
      
      // Error handler with retry logic
      audio.addEventListener('error', (e) => {
        const errorEvent = e as ErrorEvent;
        console.error('[MediaPlayer] Audio error:', errorEvent, audio.error);
        
        setIsPlaying(false);
        
        // Try next URL if available
        if (!tryNextUrl()) {
          // If no more URLs, try retry with current URL
          if (retryCount < 3) {
            scheduleRetry(retryCount);
          } else {
            setError('Falha ao reproduzir mídia. Verifique sua conexão com a internet.');
            setIsRetrying(false);
          }
        }
      });

      // Network state handlers
      audio.addEventListener('waiting', () => {
        console.log('[MediaPlayer] Buffering...');
      });

      audio.addEventListener('stalled', () => {
        console.log('[MediaPlayer] Download stalled');
        if (isPlaying) {
          toast({
            title: "Conexão Instável",
            description: "A conexão com o servidor de mídia está instável.",
            variant: "destructive"
          });
        }
      });
      
      audioRef.current = audio;
    }

    // Cleanup function
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [tryNextUrl, retryCount, scheduleRetry, isPlaying]);

  // Helper function to detect media type
  const getMediaType = (url: string): 'spotify' | 'youtube' | 'radio' | 'audio' => {
    if (url.includes('spotify.com')) return 'spotify';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('stream.') || url.includes('radio') || url.includes('.fm')) return 'radio';
    return 'audio';
  };

  // Helper function to get YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    fetchGospelRadio();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  // Update Media Session when playing state changes
  useEffect(() => {
    updateMediaSession();
  }, [isPlaying, gospelRadio]);

  const fetchGospelRadio = async () => {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select('id, title, media_url, is_radio, is_published, artist, description')
        .eq('is_published', true)
        .eq('is_radio', true)
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setGospelRadio(data);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar rádio gospel:', error);
      setError('Erro ao carregar mídia');
    } finally {
      setLoading(false);
    }
  };

  // Handle page visibility changes for background playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!audioRef.current) return;

      if (document.hidden) {
        // App went to background - ensure audio continues
        console.log('[MediaPlayer] App backgrounded, maintaining audio playback');
        
        // Force continue playback if it was playing
        if (isPlaying && audioRef.current.paused) {
          audioRef.current.play().catch((error) => {
            console.warn('[MediaPlayer] Could not resume playback in background:', error);
          });
        }
      } else {
        // App returned to foreground
        console.log('[MediaPlayer] App foregrounded');
        
        // Sync state if needed
        if (isPlaying && audioRef.current.paused) {
          audioRef.current.play().catch((error) => {
            console.warn('[MediaPlayer] Could not resume playback on foreground:', error);
          });
        }
      }
    };

    const handleBeforeUnload = () => {
      // Keep playing even if user navigates away
      if (audioRef.current && isPlaying) {
        console.log('[MediaPlayer] Page unloading, keeping audio alive');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isPlaying]);

  // Setup Media Session API for background playback
  const setupMediaSession = () => {
    if ('mediaSession' in navigator && gospelRadio) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: gospelRadio.title || 'Rádio Gospel',
        artist: gospelRadio.artist || 'Mensageira de Deus',
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

      // Set up action handlers for system media controls
      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current && audioRef.current.paused) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
            console.log('[MediaPlayer] Media Session: Play triggered');
          }).catch(console.error);
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause();
          setIsPlaying(false);
          console.log('[MediaPlayer] Media Session: Pause triggered');
        }
      });

      navigator.mediaSession.setActionHandler('stop', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setIsPlaying(false);
          console.log('[MediaPlayer] Media Session: Stop triggered');
        }
      });

      console.log('[MediaPlayer] Media Session configured');
    }
  };

  // Update Media Session playback state
  const updateMediaSession = () => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      
      // Notify service worker about media session changes
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller && gospelRadio) {
        navigator.serviceWorker.controller.postMessage({
          type: 'MEDIA_SESSION_UPDATE',
          title: gospelRadio.title || 'Rádio Gospel',
          artist: gospelRadio.artist || 'Mensageira de Deus',
          artwork: [
            { src: '/lovable-uploads/a66b8df0-078f-4966-91ac-e6ead39aced4.png', sizes: '192x192', type: 'image/png' }
          ]
        });
      }
    }
  };

  // Setup Media Session when gospelRadio loads
  useEffect(() => {
    if (gospelRadio) {
      setupMediaSession();
    }
  }, [gospelRadio]);

  // Manual retry function
  const manualRetry = useCallback(() => {
    if (!gospelRadio) return;
    
    setError(null);
    setIsRetrying(false);
    setRetryCount(0);
    setCurrentUrlIndex(0);
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    togglePlay();
  }, [gospelRadio]);

  const togglePlay = useCallback(async () => {
    if (!gospelRadio || !audioRef.current) return;

    const mediaType = getMediaType(gospelRadio.media_url);
    
    // Handle Spotify URLs differently
    if (mediaType === 'spotify') {
      window.open(gospelRadio.media_url, '_blank');
      
      // Update play count for Spotify
      try {
        await supabase
          .from('media_items')
          .update({ play_count: ((gospelRadio as any).play_count || 0) + 1 })
          .eq('id', gospelRadio.id);
      } catch (error) {
        console.warn('Failed to update play count:', error);
      }
      
      return;
    }

    // Handle YouTube URLs
    if (mediaType === 'youtube') {
      const videoId = getYouTubeVideoId(gospelRadio.media_url);
      if (!videoId) {
        setError('URL do YouTube inválida');
        return;
      }

      if (isPlaying) {
        setIsPlaying(false);
        if (iframeRef.current) {
          iframeRef.current.style.display = 'none';
        }
        return;
      }

      setIsPlaying(true);
      setError(null);
      
      // Update play count for YouTube
      try {
        await supabase
          .from('media_items')
          .update({ play_count: ((gospelRadio as any).play_count || 0) + 1 })
          .eq('id', gospelRadio.id);
      } catch (error) {
        console.warn('Failed to update play count:', error);
      }
      
      return;
    }

    try {
      const audio = audioRef.current;
      
      if (isPlaying) {
        audio.pause();
        return;
      }

      setError(null);
      setIsRetrying(false);
      
      // Get current URL to try
      const urls = getAvailableUrls();
      const currentUrl = urls[currentUrlIndex] || gospelRadio.media_url;
      
      // Only change source if it's different
      if (audio.src !== currentUrl) {
        console.log(`[MediaPlayer] Loading URL: ${currentUrl}`);
        audio.src = currentUrl;
        audio.load();
      }
      
      // Set volume
      audio.volume = isMuted ? 0 : volume[0] / 100;
      
      // Play audio with better error handling
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        
        // Update play count only on successful play
        await supabase
          .from('media_items')
          .update({ play_count: ((gospelRadio as any).play_count || 0) + 1 })
          .eq('id', gospelRadio.id);
          
        toast({
          title: "Reprodução Iniciada",
          description: `Tocando: ${gospelRadio.title}`,
          duration: 2000
        });
      }

    } catch (error) {
      console.error('[MediaPlayer] Play error:', error);
      
      // Don't set error immediately, let the audio error handler deal with it
      if (retryCount === 0) {
        scheduleRetry(0);
      }
    }
  }, [gospelRadio, isPlaying, currentUrlIndex, getAvailableUrls, isMuted, volume, retryCount, scheduleRetry]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Radio className="w-6 h-6 text-muted-foreground mr-2 animate-pulse" />
            <span className="text-muted-foreground">Carregando rádio gospel...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gospelRadio) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Mídia Indisponível
            </h3>
            <p className="text-muted-foreground">
              Nenhuma mídia gospel foi configurada ainda
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mediaType = getMediaType(gospelRadio.media_url);
  const isSpotify = mediaType === 'spotify';
  const isYoutube = mediaType === 'youtube';
  const videoId = isYoutube ? getYouTubeVideoId(gospelRadio.media_url) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-center">
          <Radio className="w-5 h-5 mr-2" />
          {isSpotify ? 'Playlist Gospel' : 'Rádio Gospel'}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="bg-muted rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              {isSpotify ? (
                <div className="text-primary font-bold text-2xl">♪</div>
              ) : (
                <Radio className="w-10 h-10 text-primary" />
              )}
            </div>
            
            <div>
              <h4 className="font-semibold text-lg">{gospelRadio.title}</h4>
              {gospelRadio.artist && (
                <p className="text-sm text-muted-foreground mt-1">{gospelRadio.artist}</p>
              )}
              {!isSpotify && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-muted-foreground'}`} />
                  <span className="text-sm text-muted-foreground">
                    {isPlaying ? 'NO AR' : 'FORA DO AR'}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-medium">ERRO DE REPRODUÇÃO</span>
                </div>
                <p>{error}</p>
                {!isSpotify && !isYoutube && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={manualRetry}
                    className="w-full mt-2"
                    disabled={isRetrying}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Tentando...' : 'Tentar Novamente'}
                  </Button>
                )}
              </div>
            )}
            
            {isRetrying && !error && (
              <div className="bg-muted text-muted-foreground text-sm p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Reconectando... (Tentativa {retryCount + 1}/3)</span>
                </div>
              </div>
            )}

            <Button 
              size="lg" 
              onClick={togglePlay}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSpotify ? (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Abrir no Spotify
                </>
              ) : isYoutube ? (
                isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Reproduzir Áudio
                  </>
                )
              ) : isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Ouvir
                </>
              )}
            </Button>

            {/* Volume Control - Only show for non-Spotify content */}
            {!isSpotify && !isYoutube && (
              <div className="flex items-center gap-3 justify-center max-w-xs mx-auto">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            )}

            {/* YouTube Audio Player - Hidden iframe for audio-only playback */}
            {isYoutube && videoId && (
              <div className="mt-4">
                <iframe
                  ref={iframeRef}
                  width="0"
                  height="0"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0`}
                  title={gospelRadio.title}
                  frameBorder="0"
                  style={{ display: isPlaying ? 'block' : 'none', opacity: 0, position: 'absolute', left: '-9999px' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <p className="text-xs text-muted-foreground text-center">
                  Reprodução apenas de áudio do YouTube
                </p>
              </div>
            )}

            {isSpotify && (
              <p className="text-xs text-muted-foreground">
                Este conteúdo será aberto no Spotify Web Player
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}