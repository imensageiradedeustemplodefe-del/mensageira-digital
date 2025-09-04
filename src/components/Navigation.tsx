import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Users, Calendar, Play, Phone, Heart, Camera, MessageCircle, BookOpen, GraduationCap, Music, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Navigation = () => {
  const { settings } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Início", href: "/", icon: Home },
    { name: "Sobre", href: "/sobre", icon: Users },
    { name: "Eventos", href: "/eventos", icon: Calendar },
    { name: "Live", href: "/live", icon: Play },
    { name: "Contato", href: "/contato", icon: Phone },
  ];

  const ministryPages = [
    { name: "Pedidos de Oração", href: "/oracoes", icon: Heart },
    { name: "Galeria", href: "/galeria", icon: Camera },
    { name: "Testemunhos", href: "/testemunhos", icon: MessageCircle },
    { name: "Mídia", href: "/midia", icon: Music },
    { name: "Sermões", href: "/em-breve", icon: BookOpen, comingSoon: true },
    { name: "Estudos Bíblicos", href: "/em-breve", icon: GraduationCap, comingSoon: true },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/a66b8df0-078f-4966-91ac-e6ead39aced4.png" 
              alt="Logo Igreja Mensageira de Deus Templo de Fé" 
              className="w-10 h-10 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">
                {settings.church_name?.split(' - ')[0] || 'Mensageira de Deus'}
              </h1>
              <p className="text-sm text-muted-foreground -mt-1">
                {settings.church_name?.split(' - ')[1] || 'Templo de Fé'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1 items-center">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* Ministry Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Heart className="w-4 h-4 mr-2" />
                Ministérios
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    {ministryPages.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center px-4 py-2 text-sm transition-colors ${
                            isActive(item.href)
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          }`}
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.name}
                          {item.comingSoon && (
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                              em breve
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile Ministry Links */}
              <div className="pt-2 mt-2 border-t border-border">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ministérios
                </div>
                {ministryPages.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.name}
                      {item.comingSoon && (
                        <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                          em breve
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Backdrop for dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;