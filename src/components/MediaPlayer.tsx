import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Radio, Volume2, VolumeX, Youtube } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface MediaItem {
  id: string;
  title: string;
  media_url: string;
  is_radio: boolean;
  is_published: boolean;
  artist?: string;
  description?: string;
}

export function MediaPlayer() {
  const [gospelRadio, setGospelRadio] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Initialize audio element once
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      
      // Configure audio for background playback
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      
      // Critical: Set audio to continue playing in background
      audio.setAttribute('data-no-pause', 'true');
      
      // Add event listeners for background playback
      audio.addEventListener('play', () => {
        setIsPlaying(true);
        setError(null);
        updateMediaSession();
      });
      
      audio.addEventListener('pause', () => {
        setIsPlaying(false);
        updateMediaSession();
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        updateMediaSession();
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Erro ao reproduzir mídia:', e);
        setError('Não foi possível reproduzir esta mídia. Verifique se a URL está correta e acessível.');
        setIsPlaying(false);
        updateMediaSession();
      });
      
      audio.addEventListener('loadstart', () => setError(null));
      
      // Handle visibility change to prevent auto-pause
      audio.addEventListener('loadstart', () => {
        // Prevent browser from pausing on visibility change
        document.addEventListener('visibilitychange', () => {
          if (document.hidden && audio.paused && isPlaying) {
            audio.play().catch(console.error);
          }
        });
      });
      
      audioRef.current = audio;
    }
  }, []);

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

  // Prevent browser from auto-pausing on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && audioRef.current && !audioRef.current.paused) {
        // Audio should continue playing in background
        console.log('[MediaPlayer] App went to background, audio continues');
      } else if (!document.hidden && audioRef.current && isPlaying && audioRef.current.paused) {
        // Resume if needed when coming back to foreground
        audioRef.current.play().catch(console.error);
        console.log('[MediaPlayer] App returned to foreground, resuming audio');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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

  const togglePlay = async () => {
    if (!gospelRadio || !audioRef.current) return;

    const mediaType = getMediaType(gospelRadio.media_url);
    
    // Handle Spotify URLs differently
    if (mediaType === 'spotify') {
      window.open(gospelRadio.media_url, '_blank');
      
      // Update play count for Spotify
      await supabase
        .from('media_items')
        .update({ play_count: ((gospelRadio as any).play_count || 0) + 1 })
        .eq('id', gospelRadio.id);
      
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
      await supabase
        .from('media_items')
        .update({ play_count: ((gospelRadio as any).play_count || 0) + 1 })
        .eq('id', gospelRadio.id);
      
      return;
    }

    try {
      const audio = audioRef.current;
      
      if (isPlaying) {
        audio.pause();
        return;
      }

      setError(null);
      
      // Only change source if it's different
      if (audio.src !== gospelRadio.media_url) {
        audio.src = gospelRadio.media_url;
        audio.load();
      }
      
      // Set volume
      audio.volume = isMuted ? 0 : volume[0] / 100;
      
      // Play audio
      await audio.play();

      // Update play count
      await supabase
        .from('media_items')
        .update({ play_count: ((gospelRadio as any).play_count || 0) + 1 })
        .eq('id', gospelRadio.id);

    } catch (error) {
      console.error('Erro ao reproduzir mídia:', error);
      setError('Não foi possível reproduzir esta mídia. Tente novamente ou verifique sua conexão.');
      setIsPlaying(false);
    }
  };

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
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
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