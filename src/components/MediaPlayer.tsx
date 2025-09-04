import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Music, Radio, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface MediaCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface MediaItem {
  id: string;
  title: string;
  description: string | null;
  media_url: string;
  thumbnail_url: string | null;
  category_id: string | null;
  duration: number | null;
  artist: string | null;
  is_published: boolean;
  is_radio: boolean;
  play_count: number;
  created_at: string;
  media_categories?: MediaCategory;
}

export function MediaPlayer() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentTrack, setCurrentTrack] = useState<MediaItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchMediaItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterItems();
  }, [mediaItems, selectedCategory]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  const fetchMediaItems = async () => {
    try {
      const { data, error } = await supabase
        .from('media_items')
        .select(`
          *,
          media_categories (
            id,
            name,
            slug,
            icon
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaItems(data || []);
    } catch (error) {
      console.error('Erro ao buscar mídias:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('media_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const filterItems = () => {
    let filtered = mediaItems;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }

    setFilteredItems(filtered);
    
    // Reset current track if it's not in filtered items
    if (currentTrack && !filtered.find(item => item.id === currentTrack.id)) {
      setCurrentTrack(null);
      setCurrentIndex(0);
      setIsPlaying(false);
    }
  };

  const playTrack = async (item: MediaItem, index: number) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      if (currentTrack?.id === item.id && isPlaying) {
        setIsPlaying(false);
        audioRef.current?.pause();
        return;
      }

      const audio = new Audio(item.media_url);
      audioRef.current = audio;
      
      audio.volume = isMuted ? 0 : volume[0] / 100;
      
      audio.onloadstart = () => setLoading(true);
      audio.oncanplay = () => setLoading(false);
      
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      
      audio.onended = () => {
        setIsPlaying(false);
        playNext();
      };

      audio.onerror = () => {
        console.error('Erro ao reproduzir mídia');
        setIsPlaying(false);
        setLoading(false);
      };

      await audio.play();
      setCurrentTrack(item);
      setCurrentIndex(index);

      // Update play count
      await supabase
        .from('media_items')
        .update({ play_count: item.play_count + 1 })
        .eq('id', item.id);

    } catch (error) {
      console.error('Erro ao reproduzir mídia:', error);
      setIsPlaying(false);
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const playNext = () => {
    if (filteredItems.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    playTrack(filteredItems[nextIndex], nextIndex);
  };

  const playPrevious = () => {
    if (filteredItems.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? filteredItems.length - 1 : currentIndex - 1;
    playTrack(filteredItems[prevIndex], prevIndex);
  };

  const getCategoryIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'radio':
        return <Radio className="w-4 h-4" />;
      case 'music':
        return <Music className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Music className="w-6 h-6 text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Carregando player...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhuma mídia disponível
            </h3>
            <p className="text-muted-foreground">
              Aguarde novas músicas e pregações serem adicionadas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Music className="w-5 h-5 mr-2" />
          Centro de Mídia
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center">
                    {getCategoryIcon(category.icon)}
                    <span className="ml-2">{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* Current Track Display */}
        {currentTrack && (
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-background rounded-lg flex items-center justify-center overflow-hidden">
                {currentTrack.thumbnail_url ? (
                  <img 
                    src={currentTrack.thumbnail_url} 
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentTrack.is_radio ? (
                    <Radio className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Music className="w-8 h-8 text-muted-foreground" />
                  )
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{currentTrack.title}</h4>
                {currentTrack.artist && (
                  <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {currentTrack.media_categories && (
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryIcon(currentTrack.media_categories.icon)}
                      <span className="ml-1">{currentTrack.media_categories.name}</span>
                    </Badge>
                  )}
                  {currentTrack.is_radio && (
                    <Badge variant="destructive" className="text-xs animate-pulse">
                      AO VIVO
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={playPrevious}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={togglePlay}>
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </Button>
                <Button size="sm" variant="ghost" onClick={playNext}>
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 mt-4">
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
          </div>
        )}

        {/* Track List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Music className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Nenhuma mídia encontrada nesta categoria
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div 
                key={item.id}
                className={`flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors ${
                  currentTrack?.id === item.id ? 'bg-accent' : ''
                }`}
                onClick={() => playTrack(item, index)}
              >
                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center overflow-hidden">
                  {item.thumbnail_url ? (
                    <img 
                      src={item.thumbnail_url} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    item.is_radio ? (
                      <Radio className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Music className="w-4 h-4 text-muted-foreground" />
                    )
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-sm truncate">{item.title}</h5>
                  {item.artist && (
                    <p className="text-xs text-muted-foreground truncate">{item.artist}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.is_radio && (
                    <Badge variant="outline" className="text-xs">
                      <Radio className="w-3 h-3 mr-1" />
                      Rádio
                    </Badge>
                  )}
                  <Button size="sm" variant="ghost">
                    {currentTrack?.id === item.id && isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}