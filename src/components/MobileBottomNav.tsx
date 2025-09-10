import { Link, useLocation } from "react-router-dom";
import { Home, Users, Calendar, Play, Phone, Heart, Camera, MessageCircle } from "lucide-react";

const MobileBottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { name: "Início", href: "/", icon: Home },
    { name: "Eventos", href: "/eventos", icon: Calendar },
    { name: "Live", href: "/live", icon: Play },
    { name: "Oração", href: "/oracoes", icon: Heart },
    { name: "Mais", href: "/menu", icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === "/menu") {
      return ["/sobre", "/contato", "/galeria", "/testemunhos"].includes(location.pathname);
    }
    return location.pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-background/98 to-background/95 backdrop-blur-lg border-t border-border/50 shadow-lg md:hidden">
      <div className="flex items-center justify-around py-3 px-2 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 min-w-[64px] group ${
                active
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground hover:scale-105"
              }`}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
              )}
              
              {/* Background highlight */}
              <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                active 
                  ? "bg-primary/15 shadow-lg shadow-primary/25" 
                  : "bg-transparent group-hover:bg-accent/30"
              }`} />
              
              {/* Icon and text */}
              <div className="relative z-10 flex flex-col items-center">
                <Icon className={`w-6 h-6 mb-1 transition-all duration-300 ${
                  active ? "scale-110 drop-shadow-sm" : "group-hover:scale-105"
                }`} />
                <span className={`text-[10px] font-medium transition-all duration-300 ${
                  active ? "font-bold text-primary" : "group-hover:font-medium"
                }`}>
                  {item.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;