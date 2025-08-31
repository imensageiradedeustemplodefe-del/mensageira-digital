import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular envio do formulário
    toast({
      title: "Mensagem Enviada!",
      description: "Recebemos sua mensagem e entraremos em contato em breve.",
    });

    // Limpar formulário
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Endereço",
      content: "R. Elias Biasi - Berger, Caçador - SC, 89500-000",
      description: "Venha nos visitar pessoalmente"
    },
    {
      icon: Phone,
      title: "Telefone",
      content: "[Telefone a ser informado]",
      description: "Ligue para mais informações"
    },
    {
      icon: Mail,
      title: "E-mail",
      content: "imensageiradedeustemplodefe@gmail.com", 
      description: "Envie sua mensagem"
    },
    {
      icon: Clock,
      title: "Horários",
      content: "Sex: 20:00 | Dom: 19:30",
      description: "Horários dos cultos principais"
    }
  ];

  const officeHours = [
    { day: "Segunda a Quinta", hours: "14:00 - 18:00" },
    { day: "Sexta-feira", hours: "14:00 - 19:00" }, 
    { day: "Sábado", hours: "Consultar programação" },
    { day: "Domingo", hours: "17:00 - 20:00" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Entre em Contato
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Estamos aqui para você. Entre em contato conosco para dúvidas, 
            pedidos de oração ou para conhecer melhor nossa igreja.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-card to-accent/20">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg text-foreground">
                      {info.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium text-foreground">
                      {info.content}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {info.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="bg-card/60 backdrop-blur border-none">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground flex items-center">
                    <MessageCircle className="w-6 h-6 mr-2" />
                    Envie uma Mensagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
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
                        <Label htmlFor="email">E-mail</Label>
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
                        <Label htmlFor="subject">Assunto</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          placeholder="Assunto da mensagem"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mensagem</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        placeholder="Digite sua mensagem aqui..."
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Office Hours and Additional Info */}
            <div className="space-y-6">
              <Card className="bg-card/60 backdrop-blur border-none">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    Horário de Atendimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {officeHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
                        <span className="text-muted-foreground">{schedule.day}</span>
                        <span className="font-medium text-foreground">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-peaceful-blue/10 border-none">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Outras Formas de Contato
                  </h3>
                  <div className="space-y-3 text-muted-foreground">
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      <span className="text-sm">WhatsApp: [A ser informado]</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <span className="text-sm">E-mail da secretaria: imensageiradedeustemplodefe@gmail.com</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 bg-blue-600 rounded"></div>
                      <a href="https://www.facebook.com/igrejamensageira" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">
                        Facebook: Igreja Mensageira
                      </a>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded"></div>
                      <a href="https://www.instagram.com/igrejamensageira?igsh=MW0xd3p5bmlyM2ps" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary transition-colors">
                        Instagram: @igrejamensageira
                      </a>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-white/50 rounded-lg">
                    <h4 className="font-medium text-foreground mb-2">Pedidos de Oração</h4>
                    <p className="text-sm text-muted-foreground">
                      Envie seus pedidos de oração através do formulário ou durante 
                      nossas transmissões ao vivo. Nossa equipe estará orando por você.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card className="bg-card/60 backdrop-blur border-none">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Localização
                  </h3>
                  <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <MapPin className="w-8 h-8 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">
                        Mapa será adicionado quando o endereço for informado
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;