import { useState, useEffect } from "react";
import { Camera, Calendar, Users, Image as ImageIcon, FolderOpen, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGoogleDrivePhotos } from "@/hooks/useGoogleDriveAlbums";
import { useGalleryAlbums } from "@/hooks/useGalleryAlbums";
import { PhotoLightbox } from "@/components/PhotoLightbox";

const Gallery = () => {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedAlbumName, setSelectedAlbumName] = useState<string>('');
  const [selectedAlbumCoverUrl, setSelectedAlbumCoverUrl] = useState<string>('');
  const [selectedAlbumDate, setSelectedAlbumDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState("");
  const [scriptUrl, setScriptUrl] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Função para extrair data do nome do álbum (formato: DD.MM.AAAA ou DD-MM-AAAA)
  const extractDateFromAlbumName = (albumName: string): string => {
    const dateMatch = albumName.match(/(\d{2})[\.\-](\d{2})[\.\-](\d{4})/);
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      return `${day}/${month}/${year}`;
    }
    return '';
  };

  // Função para obter o dia da semana em português
  const getDayOfWeek = (dateString: string): string => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    const date = new Date(`${year}-${month}-${day}`);
    const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return daysOfWeek[date.getDay()];
  };

  // Função para extrair a categoria do nome do álbum (primeira palavra antes da data)
  const extractCategoryFromAlbumName = (albumName: string): string => {
    const parts = albumName.split(/(\d{2}[\.\-]\d{2}[\.\-]\d{4})/);
    return parts[0]?.trim() || albumName;
  };

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
  
  // Busca álbuns do Supabase (sincronizados pelo admin)
  const { albums: supabaseAlbums, loading: albumsLoading } = useGalleryAlbums(true);
  
  // Converte álbuns do Supabase para o formato esperado
  const albums = supabaseAlbums.map(album => ({
    id: album.id,
    name: album.name,
    coverUrl: album.cover_photo_url || '',
    photoCount: album.photos?.length || 0
  }));
  
  // Busca fotos do Google Drive quando um álbum é selecionado
  const { photos: drivePhotos, loading: photosLoading, hasMore, loadMore } = useGoogleDrivePhotos(
    scriptUrl,
    selectedAlbum || undefined,
    20,
    'name'
  );
  
  // Garante que photos sempre seja um array
  const photos = drivePhotos || [];

  // Filtra e ordena álbuns por data (mais recente primeiro)
  const filteredAlbums = albums
    .filter(album =>
      album.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Extrai datas dos nomes dos álbuns
      const dateA = a.name.match(/(\d{2})[\.\-](\d{2})[\.\-](\d{4})/);
      const dateB = b.name.match(/(\d{2})[\.\-](\d{2})[\.\-](\d{4})/);
      
      // Se ambos têm data, ordena por data (mais recente primeiro)
      if (dateA && dateB) {
        const [, dayA, monthA, yearA] = dateA;
        const [, dayB, monthB, yearB] = dateB;
        const timeA = new Date(`${yearA}-${monthA}-${dayA}`).getTime();
        const timeB = new Date(`${yearB}-${monthB}-${dayB}`).getTime();
        return timeB - timeA; // Ordem decrescente (mais recente primeiro)
      }
      
      // Se apenas um tem data, prioriza o que tem data
      if (dateA) return -1;
      if (dateB) return 1;
      
      // Se nenhum tem data, ordena alfabeticamente
      return a.name.localeCompare(b.name);
    });

  const loading = albumsLoading || photosLoading;

  const handleAlbumClick = (albumId: string, albumName: string, coverUrl?: string) => {
    setSelectedAlbum(albumId);
    setSelectedAlbumName(albumName);
    setSelectedAlbumCoverUrl(coverUrl || '');
    setSelectedAlbumDate(extractDateFromAlbumName(albumName));
  };

  const handleBackToAlbums = () => {
    setSelectedAlbum(null);
    setSelectedAlbumName('');
    setSelectedAlbumCoverUrl('');
    setSelectedAlbumDate('');
  };

  // Extrair ID da foto de capa da URL do Google Drive
  const getCoverPhotoId = (coverUrl: string) => {
    const match = coverUrl.match(/[?&]id=([^&]+)/);
    return match ? match[1] : null;
  };

  // Filtrar fotos para remover a foto de capa
  const filteredPhotos = selectedAlbumCoverUrl 
    ? photos.filter(photo => {
        const coverPhotoId = getCoverPhotoId(selectedAlbumCoverUrl);
        return coverPhotoId !== photo.id;
      })
    : photos;

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading && albums.length === 0 && photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 animate-fade-in">
        <Camera className="w-16 h-16 text-primary animate-pulse" />
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-lg font-medium text-foreground">Carregando momentos especiais...</p>
        <p className="text-sm text-muted-foreground">Preparando as memórias da nossa comunidade</p>
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
            {selectedAlbum ? (
              <>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
                  {extractCategoryFromAlbumName(selectedAlbumName)} - {getDayOfWeek(selectedAlbumDate)} - {selectedAlbumDate}
                </h1>
                <p className="text-xl md:text-2xl font-semibold text-primary mb-4">
                  {selectedAlbumName}
                </p>
                <p className="text-base md:text-lg text-muted-foreground mb-8">
                  Explore as fotos deste momento especial
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                  Galeria de Fotos
                </h1>
                <p className="text-base md:text-lg text-muted-foreground mb-8">
                  Momentos especiais da nossa comunidade
                </p>
              </>
            )}
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

        {scriptUrl && !selectedAlbum && albumsLoading && albums.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
            <Loader2 className="w-10 h-10 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-lg font-medium text-foreground mb-2">Carregando álbuns especiais...</p>
            <p className="text-sm text-muted-foreground">Organizando suas memórias ❤️</p>
          </div>
        )}

        {scriptUrl && !selectedAlbum && !albumsLoading && filteredAlbums.length === 0 && (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum álbum encontrado</p>
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
                  onClick={() => handleAlbumClick(album.id, album.name, album.coverUrl)}
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                    {album.coverUrl ? (
                      <>
                        <img
                          src={album.coverUrl}
                          alt={album.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderOpen className="w-16 h-16 text-primary/50" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 leading-tight min-h-[3.5rem]">
                      {album.name.split(/(\d{2}[\.\-]\d{2}[\.\-]\d{4})/).map((part, idx) => (
                        <span key={idx} className={idx === 1 ? "block text-base font-normal text-muted-foreground mt-1" : ""}>
                          {part.trim()}
                        </span>
                      ))}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <ImageIcon className="w-4 h-4" />
                      <span>{album.photoCount ? `${Math.max(0, album.photoCount - 1)} fotos` : "Ver fotos"}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedAlbum && filteredPhotos.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredPhotos.map((photo, index) => (
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
                    <h3 className="font-semibold text-sm truncate">
                      {photo.name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')}
                    </h3>
                    {selectedAlbumDate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Calendar className="w-3 h-3" />
                        {selectedAlbumDate}
                      </div>
                    )}
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
                      Carregando mais momentos...
                    </>
                  ) : (
                    'Carregar mais fotos'
                  )}
                </Button>
              </div>
            )}
          </>
        )}

        {selectedAlbum && filteredPhotos.length === 0 && !loading && (
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
                  {filteredAlbums.length > 0 ? extractDateFromAlbumName(filteredAlbums[0].name) || new Date().toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : '-'}
                </div>
                <div className="text-sm text-muted-foreground">Última atualização</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Photo Lightbox */}
      {filteredPhotos.length > 0 && selectedAlbum && (
        <PhotoLightbox
          photos={filteredPhotos}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          albumDate={selectedAlbumDate}
        />
      )}
    </div>
  );
};

export default Gallery;
