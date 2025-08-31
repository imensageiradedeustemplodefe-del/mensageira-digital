import { useState, useEffect } from "react";
import { Play, Calendar, Clock, Youtube, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Live = () => {
  const [isLive, setIsLive] = useState(false);
  const [nextService, setNextService] = useState<string>("");

  // Simulação para verificar se há transmissão ao vivo
  useEffect(() => {
    const checkLiveStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const currentTime = hour * 60 + minute;

      // Sexta-feira (5) às 20:00 ou Domingo (0) às 19:30
      const fridayService = day === 5 && currentTime >= 1200 && currentTime <= 1320; // 20:00 - 22:00
      const sundayService = day === 0 && currentTime >= 1170 && currentTime <= 1290; // 19:30 - 21:30

      setIsLive(fridayService || sundayService);
    };

    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Calcular próximo culto
  useEffect(() => {
    const calculateNextService = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      const minute = now.getMinutes();

      if (day === 5 && hour < 20) {
        setNextService("Hoje às 20:00 - Culto de Cura e Libertação");
      } else if (day === 0 && hour < 19) {
        setNextService("Hoje às 19:30 - Culto da Família");
      } else if (day < 5) {
        setNextService("Sexta-feira às 20:00 - Culto de Cura e Libertação");
      } else if (day === 5 && hour >= 20) {
        setNextService("Domingo às 19:30 - Culto da Família");
      } else if (day === 6) {
        setNextService("Domingo às 19:30 - Culto da Família");
      } else {
        setNextService("Sexta-feira às 20:00 - Culto de Cura e Libertação");
      }
    };

    calculateNextService();
  }, []);

  const services = [
    {
      name: "Culto de Cura e Libertação",
      day: "Sexta-feira",
      time: "20:00",
      description: "Noite especial de oração e libertação"
    },
    {
      name: "Culto da Família",
      day: "Domingo", 
      time: "19:30",
      description: "Culto para toda a família"
    },
    {
      name: "Santa Ceia",
      day: "2º Domingo",
      time: "19:30",
      description: "Celebração da Santa Ceia"
    },
    {
      name: "Culto dos Homens",
      day: "4º Sábado",
      time: "19:30",
      description: "Encontro dos Homens de Propósito"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Transmissão ao Vivo
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Participe dos nossos cultos online e faça parte da nossa comunidade de fé.
          </p>
        </div>
      </section>

      {/* Live Status */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/10 border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-3">
                  {isLive ? (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <Badge variant="destructive" className="animate-pulse">
                        AO VIVO
                      </Badge>
                      <span className="text-foreground font-medium">Culto em andamento</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-muted rounded-full"></div>
                      <Badge variant="secondary">OFFLINE</Badge>
                      <span className="text-muted-foreground">Próximo culto: {nextService}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Canal: Mensageira de Deus Templo de Fé</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* YouTube Player */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="overflow-hidden border-none shadow-lg">
            <CardContent className="p-0">
              <div className="aspect-video bg-muted/30 relative">
                <iframe
                  src="https://www.youtube.com/embed/live_stream?channel=UC_YOUR_CHANNEL_ID"
                  title="Mensageira de Deus - Transmissão ao Vivo"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                
                {!isLive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                        <Play className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          Transmissão Offline
                        </h3>
                        <p className="text-muted-foreground">
                          A transmissão será iniciada nos horários dos cultos
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Channel Link */}
          <div className="text-center mt-6">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary text-primary hover:bg-primary/10"
              onClick={() => window.open("https://www.youtube.com/@imensageiradedeustemlodefe", "_blank")}
            >
              <Youtube className="w-5 h-5 mr-2" />
              Visitar Canal no YouTube
            </Button>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Programação de Transmissões
            </h2>
            <p className="text-lg text-muted-foreground">
              Acompanhe nossa programação regular de cultos e eventos especiais.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 bg-card/60 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground">
                    {service.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">{service.day}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">{service.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-primary/5 to-peaceful-blue/10 border-none">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-foreground">
                Como Participar Online
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Acesse no Horário</h3>
                  <p className="text-sm">Entre na página nos horários dos cultos para participar ao vivo</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Participe do Chat</h3>
                  <p className="text-sm">Use o chat do YouTube para interagir e enviar pedidos de oração</p>
                </div>
                <div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2">Compartilhe</h3>
                  <p className="text-sm">Convide amigos e familiares para participar juntos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Live;