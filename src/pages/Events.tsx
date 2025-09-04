import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Events = () => {
  const { settings, loading: settingsLoading } = useSiteSettings();
  
  const regularSchedule = [
    {
      title: "Culto de Cura e Libertação",
      day: "Sexta-feira",
      time: "20:00",
      frequency: "Semanal",
      description: "Noite de oração especial para cura física, emocional e espiritual. Venha buscar a libertação em Jesus Cristo.",
      color: "bg-primary"
    },
    {
      title: "Culto da Família",
      day: "Domingo",
      time: "19:30", 
      frequency: "Semanal",
      description: "Culto especial para toda a família, com mensagens edificantes e momentos de adoração em comunidade.",
      color: "bg-secondary"
    },
    {
      title: "Santa Ceia",
      day: "2º Domingo do Mês",
      time: "19:30",
      frequency: "Mensal",
      description: "Celebração da Santa Ceia do Senhor, momento sagrado de comunhão e renovação espiritual.",
      color: "bg-primary-light"
    },
    {
      title: "Culto dos Homens de Propósito",
      day: "4º Sábado do Mês",
      time: "19:30",
      frequency: "Mensal", 
      description: "Encontro especial para os homens da igreja, focado no crescimento espiritual e liderança cristã.",
      color: "bg-muted-foreground"
    }
  ];

  const ministryActivities = [
    {
      name: "Geração de Samuel",
      type: "Banda de Louvor",
      description: "Ministério de louvor que conduz a congregação em momentos de adoração",
      leaders: "André Dale Laste e Silvano Cardoso",
      schedule: "Ensaios: Quinta-feira | Cultos principais"
    },
    {
      name: "Obreiros",
      type: "Grupo de Oração",
      description: "Grupo dedicado à intercessão e oração pela igreja e comunidade",
      leaders: "Marica Machado e Ademar Malmann",
      schedule: "Terça-feira - Reunião de Oração"
    },
    {
      name: "Jovens Adoradores",
      type: "Grupo de Jovens",
      description: "Encontros especiais para jovens com estudos bíblicos e atividades",
      leaders: "Silvano e Leonice Cardoso",
      schedule: "Sábado - Atividades em grupo"
    },
    {
      name: "Mensageira Do Cristo Rei",
      type: "Grupo de Mulheres",
      description: "Ministério dedicado às mulheres da igreja com estudos e comunhão",
      leaders: "Ana Venconi e Gisele Segatto",
      schedule: "Sábado - Reuniões do grupo"
    },
    {
      name: "Ourinhos de Cristo",
      type: "Ministério Infantil",
      description: "Atividades especiais para crianças durante os cultos",
      leaders: "Leonice Cardoso e Elen Dale Laste",
      schedule: "Sábado - Atividades infantis | Domingos durante o culto"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            {settings.events_page_title}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            {settings.events_page_subtitle}
          </p>
        </div>
      </section>

      {/* Regular Schedule */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {settings.events_section_title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {settings.events_section_description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {regularSchedule.map((event, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-card to-accent/20">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-foreground mb-2">
                        {event.title}
                      </CardTitle>
                      <Badge variant="secondary" className="mb-3">
                        {event.frequency}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">{event.day}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">Templo Principal</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ministry Activities */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {settings.ministries_section_title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {settings.ministries_section_description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {ministryActivities.map((ministry, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 bg-card/60 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">
                        {ministry.name}
                      </CardTitle>
                      <Badge variant="outline" className="mt-2">
                        {ministry.type}
                      </Badge>
                    </div>
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground leading-relaxed">
                    {ministry.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-foreground">Líderes:</span>
                      <span className="text-muted-foreground ml-2">{ministry.leaders}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Horário:</span>
                      <span className="text-muted-foreground ml-2">{ministry.schedule}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-peaceful-blue/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            {settings.events_cta_title}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {settings.events_cta_description}
          </p>
          
          <Card className="bg-card/60 backdrop-blur border-none max-w-2xl mx-auto">
            <CardContent className="p-6">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>Endereço: R. Elias Biasi, 49 - Berger, Caçador - SC, 89500-000</span>
                </div>
                <div className="flex items-center justify-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Horários principais: Sex 20h | Dom 19h30</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Events;