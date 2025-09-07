import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Youtube, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DailyVerse from "@/components/DailyVerse";
import { MediaPlayer } from "@/components/MediaPlayer";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Home = () => {
  const { toast } = useToast();
  const { settings, loading: settingsLoading } = useSiteSettings();
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
      // Tenta detectar se está em iOS/Safari e oferece instruções específicas
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      
      if (isIOS || isSafari) {
        toast({
          title: "Instalar App",
          description: "Toque no ícone de compartilhar e selecione 'Adicionar à Tela de Início'.",
          variant: "default"
        });
      } else {
        toast({
          title: "Instalar App", 
          description: "Use o menu do navegador (⋮) e selecione 'Instalar app' ou 'Adicionar à tela inicial'.",
          variant: "default"
        });
      }
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
      setInstallable(true);
      setDeferredPrompt(promptEvent);
      toast({
        title: "Instalação cancelada",
        description: "A instalação foi cancelada. Tente novamente quando quiser.",
        variant: "default"
      });
    }
  };

  const upcomingEvents = [
    {
      title: "Culto de Cura e Libertação",
      date: "Sexta-feira", 
      time: "20:00",
      description: "Noite de oração especial para cura física, emocional e espiritual. Venha buscar a libertação em Jesus Cristo."
    },
    {
      title: "Culto da Família",
      date: "Domingo",
      time: "19:30",
      description: "Culto especial para toda a família, com mensagens edificantes e momentos de adoração em comunidade."
    },
    {
      title: "Santa Ceia",
      date: "2º Domingo do Mês",
      time: "19:30",
      description: "Celebração da Santa Ceia do Senhor, momento sagrado de comunhão e renovação espiritual."
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
              <span className="block text-primary">Mensageira de Deus Templo de Fé</span>
              <span className="block text-lg sm:text-xl font-normal text-muted-foreground mt-2">
                Uma igreja comprometida com a Palavra de Deus
              </span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Venha fazer parte da nossa família de fé. Aqui você encontrará acolhimento, 
              crescimento espiritual e uma comunidade que se importa com você.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-6 px-4">
              <Link to="/live" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                  <Youtube className="w-5 h-5 mr-2" />
                  Assistir ao Vivo
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10"
                onClick={handleInstallClick}
              >
                <Download className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">{installable ? 'Instalar App' : 'Instalar App'}</span>
                <span className="sm:hidden">Instalar</span>
              </Button>
              <Link to="/eventos" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Ver Programação</span>
                  <span className="sm:hidden">Programação</span>
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

      {/* Media Player Section */}
      <section className="py-12 bg-accent/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <MediaPlayer />
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Próximos Eventos
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Participe dos nossos cultos e atividades. Todos são bem-vindos!
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {upcomingEvents.map((event, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-none bg-card/60 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg text-foreground leading-tight">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
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
            Venha nos Visitar
          </h2>
          <div className="flex items-center justify-center text-muted-foreground mb-6">
            <MapPin className="w-5 h-5 mr-2" />
            <span>R. Elias Biasi, 49 - Berger, Caçador - SC, 89500-000</span>
          </div>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Estamos de portas abertas para recebê-lo em nossa casa. 
            Venha conhecer nossa comunidade e participar dos nossos cultos.
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