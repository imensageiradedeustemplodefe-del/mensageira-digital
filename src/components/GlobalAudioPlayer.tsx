import React, { useEffect } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Radio, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

interface GlobalAudioPlayerProps {
  onClose?: () => void;
}

// Helper function to detect media type
const getMediaType = (url: string): 'spotify' | 'youtube' | 'radio' | 'audio' => {
  if (url.includes('spotify.com')) return 'spotify';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('stream.') || url.includes('radio') || url.includes('.fm')) return 'radio';
  return 'audio';
};

export const GlobalAudioPlayer: React.FC<GlobalAudioPlayerProps> = ({ onClose }) => {
  const {
    currentMedia,
    isPlaying,
    volume,
    isMuted,
    error,
    loading,
    hasStartedPlayback,
    play,
    pause,
    setVolume,
    toggleMute,
    clearError
  } = useAudio();

  // Mostrar toast quando há erro
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro de Reprodução",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  // Se não há mídia carregada OU não iniciou reprodução ainda, não mostrar o player
  if (!currentMedia || !hasStartedPlayback) {
    return null;
  }

  const mediaType = getMediaType(currentMedia.media_url);
  const isYouTube = mediaType === 'youtube';

  const handlePlayPause = async () => {
    try {
      console.log('[GlobalAudioPlayer] Play/Pause clicked, isPlaying:', isPlaying, 'loading:', loading);
      
      if (isPlaying) {
        pause();
      } else {
        await play();
      }
    } catch (error) {
      console.error('[GlobalAudioPlayer] Play/Pause error:', error);
      // Reset loading state if there's an error
      if (loading) {
        setTimeout(() => {
          if (error) {
            // Force clear loading state after error
            console.log('[GlobalAudioPlayer] Forcing loading state reset');
          }
        }, 2000);
      }
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume[0]);
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50 bg-background/95 backdrop-blur-sm border-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Reproduzindo</span>
          </div>
          {onClose && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {/* Informações da mídia */}
          <div className="text-center">
            <h4 className="font-medium text-sm truncate">{currentMedia.title}</h4>
            {currentMedia.artist && (
              <p className="text-xs text-muted-foreground truncate">{currentMedia.artist}</p>
            )}
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-muted-foreground'}`} />
              <span className="text-xs text-muted-foreground">
                {isPlaying ? 'NO AR' : 'FORA DO AR'}
              </span>
              {isYouTube && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  YouTube
                </span>
              )}
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="h-8 w-8 p-0"
              disabled={loading}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <Button
              size="sm"
              onClick={handlePlayPause}
              disabled={loading}
              className="h-10 w-10 p-0 bg-primary hover:bg-primary/90 disabled:opacity-50"
              title={loading ? 'Carregando...' : (isPlaying ? 'Pausar' : 'Reproduzir')}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <div className="flex-1 max-w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full"
                disabled={loading}
              />
            </div>
          </div>

          {/* Status de carregamento ou erro */}
          {loading && !error && (
            <div className="text-xs text-center text-muted-foreground bg-muted/50 p-2 rounded">
              {isYouTube ? 'Carregando player do YouTube...' : 'Conectando...'}
            </div>
          )}

          {error && (
            <div className="text-xs text-destructive text-center bg-destructive/10 p-2 rounded">
              {error}
              <Button
                size="sm"
                variant="ghost"
                onClick={clearError}
                className="ml-2 h-auto p-0 text-xs underline"
              >
                Dispensar
              </Button>
            </div>
          )}

          {/* Dica para YouTube */}
          {isYouTube && !error && !loading && (
            <div className="text-xs text-center text-muted-foreground bg-blue-50 p-2 rounded">
              🎵 Reproduzindo áudio do YouTube
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};