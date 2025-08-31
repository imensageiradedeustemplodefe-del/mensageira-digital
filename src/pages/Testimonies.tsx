import { useState } from "react";
import { Heart, Star, Send, Quote, Calendar, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Testimonies = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    testimony: "",
    category: "",
    allowPublic: true
  });

  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subject = encodeURIComponent(`Novo Testemunho: ${formData.category}`);
    const body = encodeURIComponent(
      `Nome: ${formData.name}\n` +
      `E-mail: ${formData.email}\n` +
      `Categoria: ${formData.category}\n` +
      `Pode ser publicado: ${formData.allowPublic ? 'Sim' : 'Não'}\n\n` +
      `Testemunho:\n${formData.testimony}`
    );
    
    const mailtoLink = `mailto:imensageiradedeustemplodefe@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    
    toast({
      title: "Testemunho Enviado!",
      description: "Obrigado por compartilhar como Deus tem agido em sua vida!",
    });

    setFormData({
      name: "",
      email: "",
      testimony: "",
      category: "",
      allowPublic: true
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const categories = [
    { id: "all", name: "Todos" },
    { id: "cura", name: "Cura" },
    { id: "provisao", name: "Provisão" },
    { id: "familia", name: "Família" },
    { id: "trabalho", name: "Trabalho" },
    { id: "libertacao", name: "Libertação" },
    { id: "salvacao", name: "Salvação" },
    { id: "outros", name: "Outros" }
  ];

  const testimonies = [
    {
      id: 1,
      name: "Maria Santos",
      category: "cura",
      date: "2024-12-10",
      testimony: "Fui diagnosticada com uma doença grave, mas através das orações da igreja e da fé em Jesus, recebi cura completa. Os médicos ficaram surpresos com os resultados dos exames. Glória a Deus!",
      featured: true
    },
    {
      id: 2,
      name: "João Silva",
      category: "trabalho",
      date: "2024-11-25",
      testimony: "Estava desempregado há 8 meses e a situação estava difícil. Coloquei nas mãos de Deus e, após as orações da igreja, consegui um emprego melhor do que imaginava. Deus é fiel!",
      featured: false
    },
    {
      id: 3,
      name: "Ana Costa",
      category: "familia",
      date: "2024-11-15",
      testimony: "Meu casamento estava passando por uma crise profunda. Através dos conselhos pastorais e muita oração, Deus restaurou nossa família. Hoje somos mais unidos do que nunca!",
      featured: true
    },
    {
      id: 4,
      name: "Pedro Oliveira",
      category: "libertacao",
      date: "2024-10-30",
      testimony: "Lutei contra vícios por anos. Na igreja encontrei apoio, oração e o poder transformador de Jesus. Hoje sou livre e ajudo outros que passam pela mesma luta.",
      featured: false
    },
    {
      id: 5,
      name: "Carla Mendes",
      category: "provisao",
      date: "2024-10-18",
      testimony: "Passamos por dificuldades financeiras sérias. Permanecemos fiéis nos dízimos e ofertas, e Deus nos surpreendeu com uma provisão sobrenatural. Ele sempre cuida dos seus!",
      featured: false
    },
    {
      id: 6,
      name: "Roberto Lima",
      category: "salvacao",
      date: "2024-09-22",
      testimony: "Cheguei na igreja sem esperança, longe de Deus. Através do amor da comunidade e da Palavra, entreguei minha vida a Jesus. Hoje tenho paz e propósito!",
      featured: true
    }
  ];

  const filteredTestimonies = selectedCategory === "all" 
    ? testimonies 
    : testimonies.filter(testimony => testimony.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Testemunhos
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Veja como Deus tem transformado vidas em nossa comunidade e compartilhe seu próprio testemunho.
          </p>
        </div>
      </section>

      {/* Filter Buttons */}
      <section className="py-8 bg-accent/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Testimonies */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Testemunhos em Destaque
          </h2>
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {filteredTestimonies.filter(t => t.featured).slice(0, 2).map((testimony) => (
              <Card key={testimony.id} className="bg-gradient-to-br from-primary/5 to-peaceful-blue/10 border-none hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-primary" />
                      <CardTitle className="text-xl">{testimony.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <Badge variant="secondary">{getCategoryName(testimony.category)}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(testimony.date)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Quote className="w-8 h-8 text-primary/20 absolute -top-2 -left-2" />
                    <p className="text-muted-foreground italic leading-relaxed pl-6">
                      {testimony.testimony}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Testimonies */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Todos os Testemunhos
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {filteredTestimonies.map((testimony) => (
              <Card key={testimony.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{testimony.name}</CardTitle>
                    <Badge variant="outline">{getCategoryName(testimony.category)}</Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(testimony.date)}
                    {testimony.featured && <Star className="w-4 h-4 ml-2 text-yellow-500" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {testimony.testimony}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTestimonies.length === 0 && (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                Nenhum testemunho encontrado nesta categoria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Share Testimony Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-card/60 backdrop-blur border-none">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground flex items-center justify-center">
                <Send className="w-6 h-6 mr-2" />
                Compartilhe seu Testemunho
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Conte-nos como Deus tem agido em sua vida. Seu testemunho pode encorajar outros!
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Seu nome"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.filter(cat => cat.id !== "all").map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="testimony">Seu Testemunho *</Label>
                  <Textarea
                    id="testimony"
                    name="testimony"
                    value={formData.testimony}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Conte como Deus tem agido em sua vida..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="allowPublic"
                    name="allowPublic"
                    checked={formData.allowPublic}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="allowPublic" className="text-sm">
                    Autorizo a publicação deste testemunho no site da igreja
                  </Label>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Testemunho
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Testimonies;