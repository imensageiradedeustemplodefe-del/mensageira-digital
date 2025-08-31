import { useState } from "react";
import { BookOpen, Download, Users, Calendar, Clock, Play, FileText, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Studies = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const bibleStudies = [
    {
      id: 1,
      title: "O Sermão do Monte",
      description: "Estudo completo sobre os ensinamentos de Jesus em Mateus 5-7",
      lessons: 8,
      duration: "6 semanas",
      level: "Intermediário",
      category: "gospels",
      leader: "Pr. Gilmar Radaelli",
      materials: ["PDF", "Vídeo", "Áudio"],
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&crop=center",
      featured: true
    },
    {
      id: 2,
      title: "Frutos do Espírito",
      description: "Desenvolvendo o caráter cristão através dos frutos espirituais",
      lessons: 9,
      duration: "9 semanas",
      level: "Básico",
      category: "christian-living",
      leader: "Pra. Vera Lucia Radaelli",
      materials: ["PDF", "Vídeo"],
      image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&h=250&fit=crop&crop=center",
      featured: false
    },
    {
      id: 3,
      title: "Livro de Apocalipse",
      description: "Compreendendo as profecias e revelações do fim dos tempos",
      lessons: 12,
      duration: "12 semanas",
      level: "Avançado",
      category: "prophecy",
      leader: "Pr. João Ezequiel Batista",
      materials: ["PDF", "Vídeo", "Áudio", "Slides"],
      image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=400&h=250&fit=crop&crop=center",
      featured: true
    },
    {
      id: 4,
      title: "Salmos de Davi",
      description: "Explorando a adoração e os sentimentos expressos nos Salmos",
      lessons: 10,
      duration: "10 semanas",
      level: "Básico",
      category: "worship",
      leader: "Pra. Vera Lucia Radaelli",
      materials: ["PDF", "Áudio"],
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=250&fit=crop&crop=center",
      featured: false
    },
    {
      id: 5,
      title: "Epístolas de Paulo",
      description: "Estudo das cartas paulinas e seus ensinamentos práticos",
      lessons: 15,
      duration: "15 semanas",
      level: "Intermediário",
      category: "epistles",
      leader: "Pr. Gilmar Radaelli",
      materials: ["PDF", "Vídeo", "Áudio"],
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=250&fit=crop&crop=center",
      featured: false
    },
    {
      id: 6,
      title: "Princípios de Liderança Bíblica",
      description: "Como liderar segundo os princípios bíblicos de Jesus",
      lessons: 6,
      duration: "6 semanas",
      level: "Avançado",
      category: "leadership",
      leader: "Pr. João Ezequiel Batista",
      materials: ["PDF", "Vídeo", "Slides"],
      image: "https://images.unsplash.com/photo-1574391884720-bfab8d3b8b4a?w=400&h=250&fit=crop&crop=center",
      featured: false
    }
  ];

  const categories = [
    { id: "all", name: "Todos", count: bibleStudies.length },
    { id: "gospels", name: "Evangelhos", count: 1 },
    { id: "christian-living", name: "Vida Cristã", count: 1 },
    { id: "prophecy", name: "Profecias", count: 1 },
    { id: "worship", name: "Adoração", count: 1 },
    { id: "epistles", name: "Epístolas", count: 1 },
    { id: "leadership", name: "Liderança", count: 1 }
  ];

  const upcomingClasses = [
    {
      id: 1,
      title: "O Sermão do Monte - Lição 3",
      date: "2024-12-20",
      time: "19:30",
      location: "Presencial + Online",
      leader: "Pr. Gilmar Radaelli"
    },
    {
      id: 2,
      title: "Frutos do Espírito - Lição 5",
      date: "2024-12-22",
      time: "14:00",
      location: "Sala 2",
      leader: "Pra. Vera Lucia Radaelli"
    },
    {
      id: 3,
      title: "Apocalipse - Lição 8",
      date: "2024-12-25",
      time: "18:00",
      location: "Online",
      leader: "Pr. João Ezequiel Batista"
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredStudies = bibleStudies.filter(study => {
    const matchesCategory = selectedCategory === "all" || study.category === selectedCategory;
    const matchesSearch = study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.leader.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredStudies = bibleStudies.filter(study => study.featured);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Básico": return "bg-green-100 text-green-800";
      case "Intermediário": return "bg-yellow-100 text-yellow-800";
      case "Avançado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Estudos Bíblicos
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Aprofunde-se na Palavra de Deus através de nossos estudos bíblicos sistemáticos e temáticos.
          </p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="studies" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="studies">Estudos Disponíveis</TabsTrigger>
              <TabsTrigger value="schedule">Cronograma</TabsTrigger>
            </TabsList>

            <TabsContent value="studies" className="mt-8">
              {/* Search and Filter */}
              <div className="mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
                  <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar estudos bíblicos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center"
                    >
                      {category.name} ({category.count})
                    </Button>
                  ))}
                </div>
              </div>

              {/* Featured Studies */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-center text-foreground mb-8">
                  Estudos em Destaque
                </h2>
                <div className="grid lg:grid-cols-2 gap-8">
                  {featuredStudies.map((study) => (
                    <Card key={study.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary/5 to-peaceful-blue/10 border-none">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={study.image}
                          alt={study.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Button size="lg" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                            <Play className="w-6 h-6 mr-2" />
                            Ver Estudo
                          </Button>
                        </div>
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{study.title}</CardTitle>
                            <p className="text-muted-foreground mb-3">{study.description}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge className={getLevelColor(study.level)}>{study.level}</Badge>
                              <Badge variant="outline">{study.lessons} lições</Badge>
                              <Badge variant="outline">{study.duration}</Badge>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="w-4 h-4 mr-1" />
                              {study.leader}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {study.materials.map((material, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {material}
                              </Badge>
                            ))}
                          </div>
                          <Button size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Material
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* All Studies */}
              <div>
                <h2 className="text-3xl font-bold text-center text-foreground mb-8">
                  Todos os Estudos
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStudies.map((study) => (
                    <Card key={study.id} className="hover:shadow-lg transition-all duration-300 group">
                      <div className="aspect-video relative overflow-hidden">
                        <img
                          src={study.image}
                          alt={study.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                            <Play className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg line-clamp-2">{study.title}</CardTitle>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {study.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge className={`${getLevelColor(study.level)} text-xs`}>
                            {study.level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {study.lessons} lições
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                          <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {study.leader}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {study.duration}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {study.materials.slice(0, 2).map((material, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {material}
                              </Badge>
                            ))}
                            {study.materials.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{study.materials.length - 2}
                              </Badge>
                            )}
                          </div>
                          <Button size="sm" variant="outline">
                            <FileText className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredStudies.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">
                      Nenhum estudo encontrado com os filtros aplicados.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="mt-8">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-foreground mb-8">
                  Próximas Aulas
                </h2>
                <div className="space-y-4">
                  {upcomingClasses.map((classItem) => (
                    <Card key={classItem.id} className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {classItem.title}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(classItem.date)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {classItem.time}
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {classItem.leader}
                              </div>
                            </div>
                            <Badge variant="outline" className="mt-2">
                              {classItem.location}
                            </Badge>
                          </div>
                          <Button>
                            Participar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Studies;