import { useState, useEffect } from "react";
import { Camera, Calendar, Users, Heart, Image as ImageIcon, Filter, FolderOpen, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { ShareButton } from "@/components/ShareButton";
import { supabase } from "@/integrations/supabase/client";
import { useGalleryAlbums } from "@/hooks/useGalleryAlbums";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface Photo {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category_id: string;
  album_id?: string;
  event_date: string;
  participants: number;
  is_published: boolean;
  gallery_categories?: { name: string };
  gallery_albums?: { name: string };
}

const Gallery = () => {
  const { settings } = useSiteSettings();
  const { albums, loading: albumsLoading } = useGalleryAlbums(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredAlbums, setFilteredAlbums] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedAlbum) {
      fetchAlbumPhotos(selectedAlbum);
    } else {
      fetchPhotos();
      fetchCategories();
    }
  }, [selectedAlbum]);

  const fetchAlbumPhotos = async (albumId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('gallery_photos')
        .select(`
          *,
          gallery_categories(name),
          gallery_albums(name)
        `)
        .eq('album_id', albumId)
        .eq('is_published', true)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Erro ao buscar fotos do álbum:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
    fetchCategories();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select(`
          *,
          gallery_categories(name)
        `)
        .eq('is_published', true)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Erro ao buscar fotos:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Add "all" category at the beginning
      const allCategories = [
        { id: "all", name: "Todas", slug: "all", icon: "ImageIcon" },
        ...(data || [])
      ];
      setCategories(allCategories);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPhotos = selectedCategory === "all" 
    ? photos 
    : photos.filter(photo => photo.category_id === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredAlbums(albums);
    } else {
      const filtered = albums.filter(album =>
        album.name.toLowerCase().includes(query.toLowerCase()) ||
        album.description?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredAlbums(filtered);
    }
  };

  // Update filtered albums when albums change
  useEffect(() => {
    setFilteredAlbums(albums);
  }, [albums]);

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      ImageIcon,
      Heart,
      Users,
      Camera
    };
    return icons[iconName] || ImageIcon;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Carregando galeria...</div>
      </div>
    );
  }

    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Camera className="w-12 h-12 text-primary mx-auto mb-6" />
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              {selectedAlbum ? albums.find(a => a.id === selectedAlbum)?.name : settings.gallery_page_title}
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8">
              {selectedAlbum ? albums.find(a => a.id === selectedAlbum)?.description : settings.gallery_page_subtitle}
            </p>
            {!selectedAlbum && (
              <div className="max-w-md mx-auto px-4">
                <SearchBar onSearch={handleSearch} placeholder="Pesquisar álbuns..." />
              </div>
            )}
            {selectedAlbum && (
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setSelectedAlbum(null);
                  setPhotos([]);
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Álbuns
              </Button>
            )}
          </div>
        </section>

        {!selectedAlbum ? (
          /* Albums Grid */
          <>
            <section className="py-16">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Álbuns de Fotos
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Navegue pelas memórias organizadas por evento
                  </p>
                </div>

                {albumsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : albums.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">
                      Nenhum álbum disponível ainda.
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {filteredAlbums.map((album) => (
                      <Card
                        key={album.id}
                        className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                        onClick={() => setSelectedAlbum(album.id)}
                      >
                        <div className="aspect-video overflow-hidden">
                          {album.cover_photo_url ? (
                            <img
                              src={album.cover_photo_url}
                              alt={album.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <FolderOpen className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg line-clamp-1">{album.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs">
                              {album.event_date && (
                                <>
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {new Date(album.event_date).toLocaleDateString('pt-BR')}
                                </>
                              )}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {album.description && (
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                              {album.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                            <div className="flex items-center">
                              <ImageIcon className="w-3 h-3 mr-1" />
                              {album.photos?.length || 0} fotos
                            </div>
                          </div>
                          <ShareButton
                            title={`Álbum: ${album.name}`}
                            text={`Confira as fotos do álbum "${album.name}" da Mensageira de Deus`}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          /* Photos Grid for Selected Album */
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    Este álbum ainda não possui fotos.
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {photos.map((photo) => (
                    <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={photo.image_url}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg line-clamp-2">{photo.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {photo.description}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Users className="w-3 h-3 mr-1" />
                          {photo.participants} participantes
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Stats Section - Only show when not viewing album */}
        {!selectedAlbum && (
          <section className="py-16 bg-gradient-to-br from-primary/5 to-peaceful-blue/10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">{albums.reduce((total, album) => total + (album.photos?.length || 0), 0)}</div>
                  <div className="text-muted-foreground">Fotos Compartilhadas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">{albums.length}</div>
                  <div className="text-muted-foreground">Álbuns Disponíveis</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {albums.reduce((total, album) => total + album.photos?.reduce((photoTotal, photo: any) => photoTotal + (photo.participants || 0), 0), 0)}
                  </div>
                  <div className="text-muted-foreground">Pessoas Registradas</div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    );
};

export default Gallery;