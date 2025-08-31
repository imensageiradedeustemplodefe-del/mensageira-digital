import { useState } from "react";
import { Camera, Calendar, Users, Heart, Image as ImageIcon, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Gallery = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Placeholder images - in a real app, these would come from a CMS or database
  const photos = [
    {
      id: 1,
      title: "Culto da Família - Dezembro 2024",
      category: "cultos",
      date: "2024-12-15",
      description: "Momento especial de adoração e comunhão",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center",
      participants: 85
    },
    {
      id: 2,
      title: "Batismo nas Águas",
      category: "batismos",
      date: "2024-11-20",
      description: "Celebração dos novos membros da família",
      image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&h=300&fit=crop&crop=center",
      participants: 12
    },
    {
      id: 3,
      title: "Ensaio Geração de Samuel",
      category: "musica",
      date: "2024-12-10", 
      description: "Preparação para o culto de domingo",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop&crop=center",
      participants: 8
    },
    {
      id: 4,
      title: "Reunião das Mulheres",
      category: "grupos",
      date: "2024-12-08",
      description: "Mensageira do Cristo Rei - Encontro mensal",
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=300&fit=crop&crop=center",
      participants: 25
    },
    {
      id: 5,
      title: "Ourinhos de Cristo",
      category: "criancas",
      date: "2024-12-03",
      description: "Atividades especiais para as crianças",
      image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=300&fit=crop&crop=center",
      participants: 18
    },
    {
      id: 6,
      title: "Jovens Adoradores",
      category: "jovens",
      date: "2024-11-30",
      description: "Retiro espiritual dos jovens",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop&crop=center",
      participants: 32
    },
    {
      id: 7,
      title: "Culto de Cura e Libertação",
      category: "cultos",
      date: "2024-12-06",
      description: "Noite de oração e milagres",
      image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=300&fit=crop&crop=center",
      participants: 95
    },
    {
      id: 8,
      title: "Obreiros em Oração",
      category: "oracao",
      date: "2024-12-05",
      description: "Intercessão pela igreja e comunidade",
      image: "https://images.unsplash.com/photo-1574391884720-bfab8d3b8b4a?w=400&h=300&fit=crop&crop=center",
      participants: 15
    }
  ];

  const categories = [
    { id: "all", name: "Todas", icon: ImageIcon },
    { id: "cultos", name: "Cultos", icon: Heart },
    { id: "batismos", name: "Batismos", icon: Users },
    { id: "musica", name: "Música", icon: Camera },
    { id: "grupos", name: "Grupos", icon: Users },
    { id: "criancas", name: "Crianças", icon: Heart },
    { id: "jovens", name: "Jovens", icon: Users },
    { id: "oracao", name: "Oração", icon: Heart }
  ];

  const filteredPhotos = selectedCategory === "all" 
    ? photos 
    : photos.filter(photo => photo.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Camera className="w-12 h-12 text-primary mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Galeria de Fotos
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Reviva os momentos especiais de nossa comunidade de fé através destas imagens.
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
              const Icon = category.icon;
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={photo.image}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{photo.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs whitespace-nowrap ml-2">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(photo.date)}
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
              <div className="text-muted-foreground">Fotos na Galeria</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                {categories.length - 1}
              </div>
              <div className="text-muted-foreground">Categorias</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                {photos.reduce((total, photo) => total + photo.participants, 0)}
              </div>
              <div className="text-muted-foreground">Pessoas nas Fotos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-card/60 backdrop-blur border-none">
            <CardContent className="p-8">
              <Camera className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Compartilhe suas Fotos</h3>
              <p className="text-muted-foreground mb-6">
                Você tem fotos especiais de eventos da igreja? Envie para nós pelo e-mail
                e ajude a documentar nossa jornada de fé!
              </p>
              <Button 
                onClick={() => window.location.href = 'mailto:imensageiradedeustemplodefe@gmail.com?subject=Fotos para Galeria'}
                className="bg-primary hover:bg-primary/90"
              >
                <Camera className="w-4 h-4 mr-2" />
                Enviar Fotos
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Gallery;