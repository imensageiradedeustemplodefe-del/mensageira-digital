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

  const togglePlay = async () => {
    if (!gospelRadio) return;

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
      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (isPlaying) {
        setIsPlaying(false);
        audioRef.current?.pause();
        return;
      }

      setError(null);
      const audio = new Audio();
      audioRef.current = audio;
      
      // Set up error handling
      audio.onerror = (e) => {
        console.error('Erro ao reproduzir mídia:', e);
        setError('Não foi possível reproduzir esta mídia. Verifique se a URL está correta e acessível.');
        setIsPlaying(false);
      };
      
      audio.onloadstart = () => setError(null);
      audio.onplay = () => {
        setIsPlaying(true);
        setError(null);
      };
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => setIsPlaying(false);
      
      // Set volume and source
      audio.volume = isMuted ? 0 : volume[0] / 100;
      audio.crossOrigin = "anonymous"; // Try to handle CORS
      audio.src = gospelRadio.media_url;
      
      // Load and play
      audio.load();
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
          {isYoutube ? (
            <Youtube className="w-5 h-5 mr-2" />
          ) : (
            <Radio className="w-5 h-5 mr-2" />
          )}
          {isSpotify ? 'Playlist Gospel' : isYoutube ? 'Rádio YouTube' : 'Rádio Gospel'}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="bg-muted rounded-lg p-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              {isSpotify ? (
                <div className="text-primary font-bold text-2xl">♪</div>
              ) : isYoutube ? (
                <Youtube className="w-10 h-10 text-primary" />
              ) : (
                <Radio className="w-10 h-10 text-primary" />
              )}
            </div>
            
            <div>
              <h4 className="font-semibold text-lg">{gospelRadio.title}</h4>
              {gospelRadio.artist && (
                <p className="text-sm text-muted-foreground mt-1">{gospelRadio.artist}</p>
              )}
              {!isSpotify && !isYoutube && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-muted-foreground'}`} />
                  <span className="text-sm text-muted-foreground">
                    {isPlaying ? 'AO VIVO' : 'FORA DO AR'}
                  </span>
                </div>
              )}
              {isYoutube && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-muted-foreground'}`} />
                  <span className="text-sm text-muted-foreground">
                    {isPlaying ? 'REPRODUZINDO' : 'PAUSADO'}
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