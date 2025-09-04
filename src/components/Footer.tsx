import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Footer = () => {
  const { settings } = useSiteSettings();
  
  return (
    <footer className="bg-card border-t border-border py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © 2024 {settings.church_name?.split(' - ')[0] || 'Mensageira de Deus'} | Desenvolvido por <span className="font-medium text-primary">Palavra Viva</span>
          </p>
          
          <Link 
            to="/login" 
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors flex items-center gap-1"
          >
            <Settings className="w-3 h-3" />
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;