import { useState } from "react";
import { Play, Download, Calendar, User, BookOpen, Search, Filter, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const Sermons = () => {
  const [selectedSeries, setSelectedSeries] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample sermon data - in a real app, this would come from a CMS or API
  const sermons = [
    {
      id: 1,
      title: "O Poder da Oração",
      speaker: "Pr. Gilmar Radaelli",
      date: "2024-12-15",
      series: "vida-crista",
      seriesName: "Vida Cristã Vitoriosa",
      duration: "45:30",
      description: "Uma mensagem poderosa sobre como a oração transforma vidas e nos conecta com Deus.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      audioUrl: "#",
      thumbnailUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&crop=center",
      featured: true,
      views: 245
    },
    {
      id: 2,
      title: "Caminhando em Fé",
      speaker: "Pra. Vera Lucia Radaelli",
      date: "2024-12-08",
      series: "vida-crista",
      seriesName: "Vida Cristã Vitoriosa",
      duration: "38:15",
      description: "Como manter a fé firme mesmo diante das adversidades da vida.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      audioUrl: "#",
      thumbnailUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&h=250&fit=crop&crop=center",
      featured: false,
      views: 189
    },
    {
      id: 3,
      title: "A Cura que Vem de Deus",
      speaker: "Pr. João Ezequiel Batista",
      date: "2024-12-01",
      series: "cura-libertacao",
      seriesName: "Cura e Libertação",
      duration: "52:20",
      description: "Jesus Cristo é o mesmo ontem, hoje e eternamente. Ele ainda cura e liberta.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      audioUrl: "#",
      thumbnailUrl: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=250&fit=crop&crop=center",
      featured: true,
      views: 312
    },
    {
      id: 4,
      title: "O Propósito da Família",
      speaker: "Pr. Gilmar Radaelli",
      date: "2024-11-24",
      series: "familia",
      seriesName: "Família Abençoada",
      duration: "41:45",
      description: "Entendendo o plano de Deus para a família e como edificar um lar cristão.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      audioUrl: "#",
      thumbnailUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=250&fit=crop&crop=center",
      featured: false,
      views: 167
    },
    {
      id: 5,
      title: "Libertação do Medo",
      speaker: "Pra. Vera Lucia Radaelli",
      date: "2024-11-17",
      series: "cura-libertacao",
      seriesName: "Cura e Libertação",
      duration: "36:30",
      description: "Como vencer o medo através da Palavra de Deus e da fé em Jesus.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      audioUrl: "#",
      thumbnailUrl: "https://images.unsplash.com/photo-1574391884720-bfab8d3b8b4a?w=400&h=250&fit=crop&crop=center",
      featured: false,
      views: 223
    },
    {
      id: 6,
      title: "Prosperidade Segundo Deus",
      speaker: "Pr. João Ezequiel Batista",
      date: "2024-11-10",
      series: "prosperidade",
      seriesName: "Prosperidade Bíblica",
      duration: "44:15",
      description: "O verdadeiro conceito bíblico de prosperidade e como alcançá-la.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      audioUrl: "#",
      thumbnailUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=250&fit=crop&crop=center",
      featured: false,
      views: 198
    }
  ];

  const series = [
    { id: "all", name: "Todas as Séries" },
    { id: "vida-crista", name: "Vida Cristã Vitoriosa" },
    { id: "cura-libertacao", name: "Cura e Libertação" },
    { id: "familia", name: "Família Abençoada" },
    { id: "prosperidade", name: "Prosperidade Bíblica" }
  ];

  const filteredSermons = sermons.filter(sermon => {
    const matchesSeries = selectedSeries === "all" || sermon.series === selectedSeries;
    const matchesSearch = sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sermon.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sermon.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeries && matchesSearch;
  });

  const featuredSermons = sermons.filter(sermon => sermon.featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handlePlayVideo = (videoUrl: string) => {
    window.open(videoUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Biblioteca de Sermões
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Acesse nossa coleção de mensagens bíblicas em áudio e vídeo. Alimente sua alma com a Palavra de Deus.
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-accent/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, pregador ou palavra-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <select
                value={selectedSeries}
                onChange={(e) => setSelectedSeries(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {series.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sermons */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Sermões em Destaque
          </h2>
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {featuredSermons.slice(0, 2).map((sermon) => (
              <Card key={sermon.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary/5 to-peaceful-blue/10 border-none">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={sermon.thumbnailUrl}
                    alt={sermon.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <Button
                      size="lg"
                      onClick={() => handlePlayVideo(sermon.videoUrl)}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                    >
                      <Play className="w-6 h-6 mr-2" />
                      Assistir
                    </Button>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-primary/90">
                    <Clock className="w-3 h-3 mr-1" />
                    {sermon.duration}
                  </Badge>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{sermon.title}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <User className="w-4 h-4 mr-1" />
                        {sermon.speaker}
                        <Calendar className="w-4 h-4 ml-4 mr-1" />
                        {formatDate(sermon.date)}
                      </div>
                      <Badge variant="outline">{sermon.seriesName}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {sermon.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {sermon.views} visualizações
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handlePlayVideo(sermon.videoUrl)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Vídeo
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        Áudio
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Sermons */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Todos os Sermões
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSermons.map((sermon) => (
              <Card key={sermon.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={sermon.thumbnailUrl}
                    alt={sermon.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      onClick={() => handlePlayVideo(sermon.videoUrl)}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                    >
                      <Play className="w-5 h-5" />
                    </Button>
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black/60">
                    {sermon.duration}
                  </Badge>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{sermon.title}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-3 h-3 mr-1" />
                    {sermon.speaker}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(sermon.date)}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {sermon.seriesName}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {sermon.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {sermon.views} views
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-8 px-2">
                        <Play className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSermons.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                Nenhum sermão encontrado com os filtros aplicados.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{sermons.length}</div>
              <div className="text-muted-foreground">Sermões</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">{series.length - 1}</div>
              <div className="text-muted-foreground">Séries</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">3</div>
              <div className="text-muted-foreground">Pregadores</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">
                {sermons.reduce((total, sermon) => total + sermon.views, 0)}
              </div>
              <div className="text-muted-foreground">Visualizações</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sermons;