import { useState } from "react";
import { Heart, Send, MessageCircle, Users, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Prayer = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    prayerType: "",
    request: "",
    isUrgent: false,
    allowSharing: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subject = encodeURIComponent(`Pedido de Oração: ${formData.prayerType}`);
    const body = encodeURIComponent(
      `Nome: ${formData.name}\n` +
      `E-mail: ${formData.email}\n` +
      `Telefone: ${formData.phone || 'Não informado'}\n` +
      `Tipo: ${formData.prayerType}\n` +
      `Urgente: ${formData.isUrgent ? 'Sim' : 'Não'}\n` +
      `Permite compartilhar: ${formData.allowSharing ? 'Sim' : 'Não'}\n\n` +
      `Pedido de Oração:\n${formData.request}`
    );
    
    const mailtoLink = `mailto:imensageiradedeustemplodefe@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    
    toast({
      title: "Pedido Enviado!",
      description: "Seu pedido de oração foi enviado. Nossa equipe estará orando por você.",
    });

    setFormData({
      name: "",
      email: "",
      phone: "",
      prayerType: "",
      request: "",
      isUrgent: false,
      allowSharing: true
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const prayerTypes = [
    "Cura Física",
    "Cura Emocional", 
    "Problemas Familiares",
    "Questões Financeiras",
    "Trabalho/Emprego",
    "Relacionamentos",
    "Decisões Importantes",
    "Agradecimento",
    "Outros"
  ];

  const testimonies = [
    {
      name: "Maria Silva",
      testimony: "Deus me curou de uma doença grave. Sou grata pelas orações da igreja!",
      date: "Dezembro 2024"
    },
    {
      name: "João Santos", 
      testimony: "Encontrei emprego após meses de oração. Deus é fiel!",
      date: "Novembro 2024"
    },
    {
      name: "Ana Costa",
      testimony: "Minha família foi restaurada através das orações. Glória a Deus!",
      date: "Outubro 2024"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="w-12 h-12 text-primary mx-auto mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Pedidos de Oração
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Compartilhe seus pedidos de oração conosco. Nossa equipe estará intercedendo por você.
          </p>
        </div>
      </section>

      {/* Prayer Request Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-card/60 backdrop-blur border-none">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground flex items-center">
                <MessageCircle className="w-6 h-6 mr-2" />
                Envie seu Pedido de Oração
              </CardTitle>
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

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone (Opcional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prayerType">Tipo de Pedido *</Label>
                    <select
                      id="prayerType"
                      name="prayerType"
                      value={formData.prayerType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="">Selecione o tipo</option>
                      {prayerTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="request">Seu Pedido de Oração *</Label>
                  <Textarea
                    id="request"
                    name="request"
                    value={formData.request}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    placeholder="Compartilhe seu pedido de oração aqui..."
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isUrgent"
                      name="isUrgent"
                      checked={formData.isUrgent}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isUrgent" className="text-sm">
                      Este é um pedido urgente
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowSharing"
                      name="allowSharing"
                      checked={formData.allowSharing}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="allowSharing" className="text-sm">
                      Permito que este pedido seja compartilhado com a equipe de oração (sem identificação pessoal)
                    </Label>
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Pedido de Oração
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Prayer Guidelines */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle>Horários de Oração</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nossas reuniões de oração acontecem todas as terças-feiras. 
                  Participe conosco!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle>Equipe de Intercessão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nossa equipe de oração está sempre intercedendo pelos pedidos recebidos.
                  Você não está sozinho!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle>Confidencialidade</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Todos os pedidos são tratados com total confidencialidade e amor cristão.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Testimonies */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Testemunhos de Orações Respondidas
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonies.map((testimony, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{testimony.name}</CardTitle>
                    <Badge variant="secondary">{testimony.date}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">
                    "{testimony.testimony}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Prayer;