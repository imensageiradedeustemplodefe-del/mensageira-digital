import { useState, useEffect } from "react";
import { Camera, Calendar, Users, Image as ImageIcon, FolderOpen, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGoogleDriveAlbums, useGoogleDrivePhotos } from "@/hooks/useGoogleDriveAlbums";
import { PhotoLightbox } from "@/components/PhotoLightbox";

const Gallery = () => {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedAlbumName, setSelectedAlbumName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState("");
  const [scriptUrl, setScriptUrl] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Busca a URL do Apps Script nas configurações
  useEffect(() => {
    const fetchScriptUrl = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'google_drive_script_url')
        .single();
      
      if (data?.setting_value) {
        setScriptUrl(data.setting_value);
      }
    };
    
    fetchScriptUrl();
  }, []);
  
  // Busca álbuns e fotos do Google Drive
  const { albums, loading: albumsLoading } = useGoogleDriveAlbums(scriptUrl);
  const { photos, loading: photosLoading, hasMore, loadMore } = useGoogleDrivePhotos(
    scriptUrl,
    selectedAlbum || undefined,
    24,
    'newest'
  );

  // Filtra álbuns por pesquisa
  const filteredAlbums = albums.filter(album =>
    album.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loading = albumsLoading || photosLoading;

  const handleAlbumClick = (albumId: string, albumName: string) => {
    setSelectedAlbum(albumId);
    setSelectedAlbumName(albumName);
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setSelectedAlbumName('');
  };

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading && albums.length === 0 && photos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <Camera className="w-12 h-12 text-primary mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {selectedAlbum ? selectedAlbumName : 'Galeria de Fotos'}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {selectedAlbum ? 'Explore as fotos deste álbum' : 'Momentos especiais da nossa comunidade'}
            </p>
            {!selectedAlbum && (
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Buscar por álbum..."
                  className="pl-10 bg-background/50 backdrop-blur"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {selectedAlbum && (
          <Button
            onClick={handleBackToAlbums}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Álbuns
          </Button>
        )}

        {!scriptUrl && (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Configure a integração com Google Drive no painel administrativo
            </p>
          </div>
        )}

        {scriptUrl && !selectedAlbum && filteredAlbums.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <FolderOpen className="w-8 h-8 text-primary" />
              Álbuns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlbums.map((album) => (
                <Card
                  key={album.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group"
                  onClick={() => handleAlbumClick(album.id, album.name)}
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                    {album.coverUrl ? (
                      <>
                        <img
                          src={album.coverUrl}
                          alt={album.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderOpen className="w-16 h-16 text-primary/50" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{album.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ImageIcon className="w-4 h-4" />
                      <span>{album.photoCount ? `${album.photoCount} fotos` : 'Ver fotos'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedAlbum && photos.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {photos.map((photo, index) => (
                <Card 
                  key={photo.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  onClick={() => handlePhotoClick(index)}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={photo.thumbUrl}
                      alt={photo.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm truncate">{photo.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(photo.createdTime).toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {hasMore && (
              <div className="text-center">
                <Button
                  onClick={loadMore}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    'Carregar mais fotos'
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {selectedAlbum && photos.length === 0 && !loading && (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma foto encontrada neste álbum.</p>
          </div>
        )}

        {!selectedAlbum && albums.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold mb-1">{albums.length}</div>
                <div className="text-sm text-muted-foreground">Álbuns</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold mb-1">∞</div>
                <div className="text-sm text-muted-foreground">Fotos no Drive</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold mb-1">
                  {photos.length > 0 ? new Date(photos[0].createdTime).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '-'}
                </div>
                <div className="text-sm text-muted-foreground">Última atualização</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Photo Lightbox */}
      {photos.length > 0 && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default Gallery;
