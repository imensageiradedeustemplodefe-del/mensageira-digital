import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Music, Radio, Search, Clock, Users } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

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

const Media = () => {
  const { settings } = useSiteSettings();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMediaItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterItems();
  }, [mediaItems, selectedCategory, searchTerm]);

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

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.artist?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const playMedia = async (item: MediaItem) => {
    try {
      // Stop current audio if playing
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }

      if (currentPlaying === item.id) {
        setCurrentPlaying(null);
        setAudioElement(null);
        return;
      }

      // Create new audio element
      const audio = new Audio(item.media_url);
      audio.play();

      setCurrentPlaying(item.id);
      setAudioElement(audio);

      // Update play count
      await supabase
        .from('media_items')
        .update({ play_count: item.play_count + 1 })
        .eq('id', item.id);

      // Handle audio events
      audio.onended = () => {
        setCurrentPlaying(null);
        setAudioElement(null);
      };

      audio.onerror = () => {
        console.error('Erro ao reproduzir mídia');
        setCurrentPlaying(null);
        setAudioElement(null);
      };

    } catch (error) {
      console.error('Erro ao reproduzir mídia:', error);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando mídias...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Music className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Centro de Mídia
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ouça pregações, louvores e nossa rádio gospel 24 horas
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar por título, artista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
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
          </div>
        </div>
      </section>

      {/* Media Grid */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Nenhuma mídia encontrada' 
                  : 'Nenhuma mídia disponível'
                }
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Aguarde novas mídias serem adicionadas'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted relative">
                    {item.thumbnail_url ? (
                      <img 
                        src={item.thumbnail_url} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.is_radio ? (
                          <Radio className="w-16 h-16 text-muted-foreground" />
                        ) : (
                          <Music className="w-16 h-16 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button
                        size="lg"
                        className="rounded-full w-16 h-16"
                        onClick={() => playMedia(item)}
                      >
                        {currentPlaying === item.id ? (
                          <Pause className="w-8 h-8" />
                        ) : (
                          <Play className="w-8 h-8 ml-1" />
                        )}
                      </Button>
                    </div>

                    {/* Live indicator for radio */}
                    {item.is_radio && currentPlaying === item.id && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="destructive" className="animate-pulse">
                          AO VIVO
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-2">{item.title}</h3>
                      {item.artist && (
                        <p className="text-xs text-muted-foreground">{item.artist}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {item.media_categories && (
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryIcon(item.media_categories.icon)}
                            <span className="ml-1">{item.media_categories.name}</span>
                          </Badge>
                        )}
                        {item.is_radio && (
                          <Badge variant="outline" className="text-xs">
                            <Radio className="w-3 h-3 mr-1" />
                            Rádio
                          </Badge>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(item.duration)}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {item.play_count}
                        </div>
                      </div>

                      <Button 
                        className="w-full mt-3" 
                        size="sm"
                        onClick={() => playMedia(item)}
                        variant={currentPlaying === item.id ? "secondary" : "default"}
                      >
                        {currentPlaying === item.id ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Reproduzir
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Media;