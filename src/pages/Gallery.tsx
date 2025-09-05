import { useState, useEffect } from "react";
import { Camera, Calendar, Users, Heart, Image as ImageIcon, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
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
  event_date: string;
  participants: number;
  is_published: boolean;
  gallery_categories?: { name: string };
}

const Gallery = () => {
  const { settings } = useSiteSettings();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
            {settings.gallery_page_title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            {settings.gallery_page_subtitle}
          </p>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="py-8 bg-accent/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-4">
            <Filter className="w-5 h-5 text-primary mr-2" />
            <span className="text-sm font-medium text-muted-foreground">Filtrar por categoria:</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => {
              const Icon = getIconComponent(category.icon);
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Photo Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{photo.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs whitespace-nowrap ml-2">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(photo.event_date)}
                    </Badge>
                  </div>
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

          {filteredPhotos.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                Nenhuma foto encontrada nesta categoria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-peaceful-blue/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{photos.length}</div>
              <div className="text-muted-foreground">{settings.gallery_stats_photos}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                {categories.length - 1}
              </div>
              <div className="text-muted-foreground">{settings.gallery_stats_categories}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                {photos.reduce((total, photo) => total + photo.participants, 0)}
              </div>
              <div className="text-muted-foreground">{settings.gallery_stats_people}</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Gallery;