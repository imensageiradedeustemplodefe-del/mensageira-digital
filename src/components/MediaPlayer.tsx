import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Radio, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAudio } from '@/contexts/AudioContext';

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
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const {
    currentMedia,
    isPlaying,
    error,
    play,
    pause,
    loadMedia,
    clearError
  } = useAudio();

  // Retry logic with exponential backoff
  const scheduleRetry = useCallback((attemptNumber: number) => {
    if (attemptNumber >= 3) {
      setIsRetrying(false);
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, attemptNumber), 10000); // Max 10s
    setIsRetrying(true);
    
    setTimeout(() => {
      setRetryCount(attemptNumber + 1);
      togglePlay();
    }, delay);
  }, []);

  // Carregar mídia no contexto global quando encontrada
  useEffect(() => {
    if (gospelRadio && (!currentMedia || currentMedia.id !== gospelRadio.id)) {
      loadMedia(gospelRadio);
    }
  }, [gospelRadio, currentMedia, loadMedia]);

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
    } catch (error) {
      console.error('Erro ao buscar rádio gospel:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mídia",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  // Manual retry function
  const manualRetry = useCallback(() => {
    if (!gospelRadio) return;
    
    clearError();
    setIsRetrying(false);
    setRetryCount(0);
    togglePlay();
  }, [gospelRadio, clearError]);

  const togglePlay = useCallback(async () => {
    if (!gospelRadio) return;

    const mediaType = getMediaType(gospelRadio.media_url);
    
    // Handle external URLs differently - open externally  
    if (mediaType === 'spotify') {
      window.open(gospelRadio.media_url, '_blank');
      
      // Update play count for external links
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

    // For all other media types including YouTube streams, use the global audio context
    if (isPlaying) {
      pause();
    } else {
      try {
        await play();
        toast({
          title: "Reprodução Iniciada",
          description: `Tocando: ${gospelRadio.title}`,
          duration: 2000
        });
      } catch (error) {
        console.error('[MediaPlayer] Play error:', error);
        if (retryCount === 0) {
          scheduleRetry(0);
        }
      }
    }
  }, [gospelRadio, isPlaying, play, pause, retryCount, scheduleRetry]);


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
  const isExternalLink = mediaType === 'spotify';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-center">
          <Radio className="w-5 h-5 mr-2" />
          Rádio Gospel
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="bg-muted rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              {isExternalLink ? (
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
            {!isExternalLink && (
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
                {mediaType === 'youtube' && (
                  <div className="text-xs mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="font-medium mb-1">💡 Sugestão:</p>
                    <p>Para reproduzir áudio, use um link de rádio online (streaming) ao invés de vídeos do YouTube.</p>
                    <p className="mt-1">Exemplo: https://servidor.com/radio.mp3</p>
                  </div>
                )}
                {!isExternalLink && mediaType !== 'youtube' && (
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
              {isExternalLink ? (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Abrir no Spotify
                </>
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

            {isExternalLink && (
              <p className="text-xs text-muted-foreground">
                Este conteúdo será aberto no Spotify Web Player
              </p>
            )}
            
            {!isExternalLink && (
              <p className="text-xs text-muted-foreground">
                Use o player flutuante para controles em segundo plano
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}