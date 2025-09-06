import { Heart, Target, Eye, Users2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const About = () => {
  const { settings } = useSiteSettings();
  
  const pastors = [
    {
      name: "Profeta José",
      role: "Profeta (in memoriam)",
      description: "Uma pessoa especial que continua sendo importante no ministério, mesmo não estando mais entre nós.",
      image: "/lovable-uploads/e0927536-21ca-4d51-b004-638d6974f554.png"
    },
    {
      name: settings.pastora_name || "Pra. Vera Lucia Radaelli",
      role: "Pastora Responsável",
      description: settings.pastora_description || "Comprometida com o ministério de mulheres e o ensino da Palavra de Deus.",
      image: "/lovable-uploads/b6dd3c88-7992-4063-ace2-78cf8de87b61.png"
    },
    {
      name: settings.pastor_principal_name || "Pr. Gilmar Radaelli",
      role: "Pastor Responsável",
      description: settings.pastor_principal_description || "Líder espiritual dedicado ao crescimento da igreja e ao cuidado pastoral das famílias.",
      image: "/lovable-uploads/5544ccb1-0c80-408a-8c5c-46805e2d6676.png"
    },
    {
      name: settings.pastor_auxiliar_name || "Pr. João Ezequiel Batista",
      role: "Pastor Auxiliar",
      description: settings.pastor_auxiliar_description || "Apoio pastoral e liderança em diversas atividades da congregação.",
      image: "/lovable-uploads/3d072e4d-3492-4762-92ab-9d3f39dc18ab.png"
    }
  ];

  const ministries = [
    {
      name: "Geração de Samuel",
      leaders: "André Dale Laste e Silvano Cardoso",
      type: "Banda de Louvor",
      icon: "🎵"
    },
    {
      name: "Jovens Adoradores",
      leaders: "Silvano e Leonice Cardoso",
      type: "Grupo de Jovens",
      icon: "👥"
    },
    {
      name: "Guerreiros De Fé",
      leaders: "Marica Machado e Ademar Malmann",
      type: "Grupo de Oração",
      icon: "🙏"
    },
    {
      name: "Palavra Viva",
      leaders: "Jessica Vacelkoski",
      type: "Ministério de Mídia",
      icon: "📱"
    },
    {
      name: "Ourinhos de Cristo",
      leaders: "Leonice Cardoso e Elen Dale Laste",
      type: "Ministério Infantil",
      icon: "👶"
    },
    {
      name: "Mensageira Do Cristo Rei",
      leaders: "Ana Venconi e Gisele Segatto",
      type: "Grupo de Mulheres",
      icon: "👩"
    }
  ];

  const values = [
    {
      icon: Heart,
      title: "Amor",
      description: "O amor de Cristo é o centro de tudo que fazemos, servindo uns aos outros com compaixão."
    },
    {
      icon: Target,
      title: "Missão",
      description: "Proclamar o evangelho de Jesus Cristo e fazer discípulos em nossa comunidade e além."
    },
    {
      icon: Eye,
      title: "Visão",
      description: "Ser uma igreja transformadora que impacta vidas através da Palavra de Deus."
    },
    {
      icon: Users2,
      title: "Comunidade",
      description: "Cultivar relacionamentos genuínos e apoio mútuo entre os irmãos na fé."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Nossa História
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            {settings.church_description || "A Mensageira de Deus Templo de Fé é uma comunidade de fé comprometida com a pregação da Palavra de Deus e o cuidado pastoral das famílias."}
          </p>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Nossos Valores
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Liderança Pastoral
            </h2>
            <p className="text-lg text-muted-foreground">
              Conheca nossa equipe pastoral dedicada ao serviço do Reino de Deus.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {pastors.map((pastor, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden">
                    <img 
                      src={pastor.image} 
                      alt={pastor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-xl">{pastor.name}</CardTitle>
                  <p className="text-primary font-medium">{pastor.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {pastor.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ministries */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ministérios
            </h2>
            <p className="text-lg text-muted-foreground">
              Conheça os diferentes ministérios que servem nossa comunidade.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {ministries.map((ministry, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{ministry.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{ministry.name}</CardTitle>
                      <p className="text-sm text-primary font-medium">{ministry.type}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    <strong>Líderes:</strong> {ministry.leaders}
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

export default About;