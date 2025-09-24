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

export const GlobalAudioPlayer: React.FC<GlobalAudioPlayerProps> = ({ onClose }) => {
  const {
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

  // Se não há mídia carregada, não mostrar o player
  if (!currentMedia) {
    return null;
  }

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else {
      await play();
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
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center justify-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleMute}
              className="h-8 w-8 p-0"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>

            <Button
              size="sm"
              onClick={handlePlayPause}
              disabled={loading}
              className="h-10 w-10 p-0 bg-primary hover:bg-primary/90"
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
                value={[volume]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Status de erro */}
          {error && (
            <div className="text-xs text-destructive text-center bg-destructive/10 p-2 rounded">
              {error}
              <Button
                size="sm"
                variant="ghost"
                onClick={clearError}
                className="ml-2 h-auto p-0 text-xs"
              >
                Dispensar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};