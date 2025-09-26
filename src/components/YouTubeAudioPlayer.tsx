import React, { useEffect, useRef, useCallback } from 'react';

interface YouTubeAudioPlayerProps {
  videoId: string;
  onReady?: (player: any) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
  volume?: number;
  autoplay?: boolean;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubeAudioPlayer: React.FC<YouTubeAudioPlayerProps> = ({
  videoId,
  onReady,
  onPlay,
  onPause,
  onEnd,
  onError,
  volume = 75,
  autoplay = false
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAPIReadyRef = useRef(false);

  // Extract video ID from URL if needed
  const extractVideoId = useCallback((url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : url;
  }, []);

  const actualVideoId = extractVideoId(videoId);

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        isAPIReadyRef.current = true;
        initializePlayer();
      };
    } else if (!isAPIReadyRef.current) {
      isAPIReadyRef.current = true;
      initializePlayer();
    } else {
      initializePlayer();
    }
  }, [actualVideoId]);

  const initializePlayer = useCallback(() => {
    if (!window.YT || !containerRef.current || !actualVideoId) return;

    // Destroy existing player
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new window.YT.Player(containerRef.current, {
      height: '0',
      width: '0',
      videoId: actualVideoId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
      },
      events: {
        onReady: (event: any) => {
          console.log('[YouTubeAudioPlayer] Player ready');
          event.target.setVolume(volume);
          onReady?.(event.target);
        },
        onStateChange: (event: any) => {
          const state = event.data;
          console.log('[YouTubeAudioPlayer] State change:', state);
          
          if (state === window.YT.PlayerState.PLAYING) {
            onPlay?.();
          } else if (state === window.YT.PlayerState.PAUSED) {
            onPause?.();
          } else if (state === window.YT.PlayerState.ENDED) {
            onEnd?.();
          }
        },
        onError: (event: any) => {
          console.error('[YouTubeAudioPlayer] Error:', event.data);
          onError?.(event.data);
        }
      }
    });
  }, [actualVideoId, volume, autoplay, onReady, onPlay, onPause, onEnd, onError]);

  // Update volume when prop changes
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(volume);
    }
  }, [volume]);

  // Public methods to control playback
  const play = useCallback(() => {
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
    }
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  }, []);

  const stop = useCallback(() => {
    if (playerRef.current && playerRef.current.stopVideo) {
      playerRef.current.stopVideo();
    }
  }, []);

  const setVolumeLevel = useCallback((level: number) => {
    if (playerRef.current && playerRef.current.setVolume) {
      playerRef.current.setVolume(level);
    }
  }, []);

  // Expose player methods via ref
  React.useImperativeHandle(playerRef, () => ({
    play,
    pause,
    stop,
    setVolume: setVolumeLevel,
    getPlayer: () => playerRef.current
  }));

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: 0, 
        height: 0, 
        overflow: 'hidden',
        position: 'absolute',
        left: '-9999px'
      }} 
    />
  );
};

export default YouTubeAudioPlayer;