import { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface YouTubeFacadeProps {
  videoId: string;
  title?: string;
  onLoad: () => void;
}

export const YouTubeFacade = ({ videoId, title, onLoad }: YouTubeFacadeProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleClick = () => {
    setIsLoaded(true);
    onLoad();
  };

  if (isLoaded) {
    return null; // O componente real será carregado
  }

  // Thumbnail do YouTube (formato webp para melhor performance)
  const thumbnailUrl = `https://i.ytimg.com/vi_webp/${videoId}/sddefault.webp`;

  return (
    <div 
      className="relative w-full bg-black rounded-lg overflow-hidden cursor-pointer group"
      onClick={handleClick}
      role="button"
      aria-label={`Carregar vídeo: ${title || 'YouTube Video'}`}
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <img
        src={thumbnailUrl}
        alt={title || 'YouTube Video Thumbnail'}
        className="w-full h-auto"
        loading="lazy"
        width="640"
        height="480"
      />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <Button
          size="lg"
          className="rounded-full w-20 h-20 bg-red-600 hover:bg-red-700 shadow-2xl"
          aria-hidden="true"
        >
          <Play className="w-10 h-10 fill-white text-white ml-1" />
        </Button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
        <p className="text-white text-sm font-medium line-clamp-2">{title}</p>
      </div>
    </div>
  );
};