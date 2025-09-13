import { Link } from "react-router-dom";
import { Users, Phone, Camera, MessageCircle, Settings, Bell, ChevronRight } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const MobileMenuPage = () => {
  const { settings } = useSiteSettings();

  const menuItems = [
    { name: "Sobre", href: "/sobre", icon: Users, description: "Conheça nossa história" },
    { name: "Contato", href: "/contato", icon: Phone, description: "Entre em contato conosco" },
    { name: "Galeria", href: "/galeria", icon: Camera, description: "Fotos da nossa comunidade" },
    { name: "Testemunhos", href: "/testemunhos", icon: MessageCircle, description: "Histórias de fé" },
  ];

  const settingsItems = [
    { name: "Notificações", href: "/notificacoes", icon: Bell, description: "Configurar alertas" },
    { name: "Admin", href: "/admin/login", icon: Settings, description: "Área administrativa" },
  ];

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/a66b8df0-078f-4966-91ac-e6ead39aced4.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain"
            />
            <div>
              <h1 className="text-base font-bold text-foreground">
                Mensageira de Deus
              </h1>
              <p className="text-xs text-muted-foreground">
                Templo de Fé
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Main Menu */}
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground mb-2">Menu Principal</h2>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:bg-accent/50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            );
          })}
        </div>

        {/* Settings Menu */}
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground mb-2">Configurações</h2>
          {settingsItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:bg-accent/50 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-secondary/10 rounded-md flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <Icon className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Link>
            );
          })}
        </div>

        {/* App Info */}
        <div className="pt-4 border-t border-border">
          <div className="text-center text-muted-foreground">
            <p className="text-xs">
              Desenvolvido por Palavra Viva
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenuPage;