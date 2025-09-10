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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2 px-1 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px] ${
                active
                  ? "text-primary bg-primary/10 scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${active ? "scale-110" : ""} transition-transform`} />
              <span className={`text-xs font-medium ${active ? "font-semibold" : ""}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;