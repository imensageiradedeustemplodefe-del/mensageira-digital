import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Youtube, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DailyVerse from "@/components/DailyVerse";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";

const Home = () => {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installable, setInstallable] = useState(false);
  
  // Hook para gerenciar atualizações automáticas
  useServiceWorkerUpdate();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Instalação não disponível",
        description: "Use o menu do seu navegador para adicionar à tela inicial ou instalar o app.",
        variant: "default"
      });
      return;
    }

    const promptEvent = deferredPrompt;
    setDeferredPrompt(null);
    setInstallable(false);

    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;

    if (outcome === 'accepted') {
      toast({
        title: "App instalado!",
        description: "O app foi instalado com sucesso em seu dispositivo.",
      });
    } else {
      toast({
        title: "Instalação cancelada",
        description: "A instalação foi cancelada. Você pode instalar mais tarde pelo menu do navegador.",
        variant: "default"
      });
    }
  };

  const upcomingEvents = [
    {
      title: "Culto de Cura e Libertação",
      date: "Sexta-feira",
      time: "20:00",
      description: "Venha buscar a cura e libertação em Jesus Cristo"
    },
    {
      title: "Culto da Família",
      date: "Domingo",
      time: "19:30",
      description: "Culto especial para toda a família"
    },
    {
      title: "Santa Ceia",
      date: "2º Domingo do Mês",
      time: "19:30",
      description: "Celebração da Santa Ceia do Senhor"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-peaceful-blue/20 py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-spiritual-glow/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Bem-vindos à
              <span className="block text-primary">Mensageira de Deus</span>
              <span className="block text-lg sm:text-xl font-normal text-muted-foreground mt-2">
                Templo de Fé
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Uma igreja comprometida com a Palavra de Deus, onde vidas são transformadas 
              e famílias são edificadas no amor de Cristo.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link to="/live">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                  <Youtube className="w-5 h-5 mr-2" />
                  Assistir ao Vivo
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10"
                onClick={handleInstallClick}
              >
                <Download className="w-5 h-5 mr-2" />
                {installable ? 'Instalar App' : 'Instalar App'}
              </Button>
              <Link to="/eventos">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                  <Calendar className="w-5 h-5 mr-2" />
                  Ver Programação
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Verse Section */}
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <DailyVerse />
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Próximos Eventos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Participe da nossa programação semanal e fortaleça sua fé em comunidade.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-none bg-card/60 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-foreground">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">{event.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/eventos">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                Ver Todos os Eventos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
            Visite Nossa Igreja
          </h2>
          <div className="flex items-center justify-center text-muted-foreground mb-6">
            <MapPin className="w-5 h-5 mr-2" />
            <span>R. Elias Biasi, 49 - Berger, Caçador - SC, 89500-000</span>
          </div>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Venha fazer parte da nossa família! Todos são bem-vindos para adorar 
            e crescer juntos na presença do Senhor.
          </p>
          <Link to="/contato">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Entre em Contato
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;