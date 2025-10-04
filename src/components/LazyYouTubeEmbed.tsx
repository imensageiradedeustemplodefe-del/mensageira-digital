import { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

interface LazyYouTubeEmbedProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  className?: string;
}

export const LazyYouTubeEmbed = ({ 
  videoId, 
  title = 'YouTube Video',
  autoplay = false,
  className = ''
}: LazyYouTubeEmbedProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Intersection Observer para carregar apenas quando visível
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );

    const element = document.getElementById(`youtube-facade-${videoId}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [videoId]);

  const handleClick = () => {
    setIsLoaded(true);
  };

  // Thumbnail em WebP para melhor performance
  const thumbnailUrl = `https://i.ytimg.com/vi_webp/${videoId}/sddefault.webp`;

  if (isLoaded) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={`w-full aspect-video ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div 
      id={`youtube-facade-${videoId}`}
      className={`relative w-full aspect-video bg-black rounded-lg overflow-hidden cursor-pointer group ${className}`}
      onClick={handleClick}
      role="button"
      aria-label={`Carregar vídeo: ${title}`}
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {isVisible && (
        <>
          <img
            src={thumbnailUrl}
            alt={`${title} - Thumbnail`}
            className="w-full h-full object-cover"
            loading="lazy"
            width="640"
            height="480"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="rounded-full w-20 h-20 bg-red-600 hover:bg-red-700 shadow-2xl flex items-center justify-center transition-all group-hover:scale-110">
              <Play className="w-10 h-10 fill-white text-white ml-1" />
            </div>
          </div>
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white text-sm font-medium line-clamp-2">{title}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};