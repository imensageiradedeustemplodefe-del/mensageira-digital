import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, Users, Calendar, Play, Phone, Heart, Camera, MessageCircle, ChevronDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchBar } from "@/components/SearchBar";
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
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-1 min-w-0">
            <img 
              src="/lovable-uploads/a66b8df0-078f-4966-91ac-e6ead39aced4.png" 
              alt="Logo Igreja Mensageira de Deus Templo de Fé" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              {/* Mobile: Nome mais compacto */}
              <div className="sm:hidden">
                <h1 className="text-sm font-bold text-foreground truncate">
                  {settings.church_name?.split(' - ')[0] || 'Mensageira de Deus'}
                </h1>
                <p className="text-xs text-muted-foreground truncate -mt-0.5">
                  {settings.church_name?.split(' - ')[1] || 'Templo de Fé'}
                </p>
              </div>
              {/* Desktop: Nome completo */}
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-foreground">
                  {settings.church_name?.split(' - ')[0] || 'Mensageira de Deus'}
                </h1>
                <p className="text-sm text-muted-foreground -mt-1">
                  {settings.church_name?.split(' - ')[1] || 'Templo de Fé'}
                </p>
              </div>
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
                <div className="absolute right-0 mt-2 w-56 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-xl z-[100]">
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
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Search Bar */}
            <div className="hidden lg:block">
              <SearchBar className="w-64" />
            </div>
            
            {/* Theme Toggle */}
        <div className="flex items-center gap-2">
          <Link 
            to="/notificacoes" 
            className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            title="Configurações de Notificações"
          >
            <span className="text-sm">🔔</span>
          </Link>
          <Link 
            to="/admin/login" 
            className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <ThemeToggle />
        </div>
      </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-1 flex-shrink-0">
            <Link 
              to="/notificacoes" 
              className="inline-flex items-center gap-1 text-muted-foreground/60 hover:text-muted-foreground transition-colors p-2"
              title="Notificações"
            >
              <span className="text-sm">🔔</span>
            </Link>
            <Link 
              to="/admin/login" 
              className="inline-flex items-center gap-1 text-muted-foreground/60 hover:text-muted-foreground transition-colors p-2"
              title="Admin"
            >
              <Settings className="w-4 h-4" />
            </Link>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="ml-1"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 bg-background/95 backdrop-blur border-t border-border">
            {/* Mobile Search */}
            <div className="px-2 py-3 border-b border-border">
              <SearchBar />
            </div>
            
            <div className="space-y-1 pt-2 px-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-4 rounded-lg text-base font-medium transition-all min-h-[48px] ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile Ministry Links */}
              <div className="pt-2 mt-2 border-t border-border">
                <div className="px-3 py-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Ministérios
                </div>
                {ministryPages.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-4 rounded-lg text-base font-medium transition-all min-h-[48px] ${
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
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
          className="fixed inset-0 z-[90]"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;