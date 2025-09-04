import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Footer = () => {
  const { settings } = useSiteSettings();
  
  return (
    <footer className="bg-card border-t border-border py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 {settings.church_name?.split(' - ')[0] || 'Mensageira de Deus'} | Desenvolvido por <span className="font-medium text-primary">Palavra Viva - <span className="text-blue-500">ministério de mídia</span></span>
          </p>
          
          <Link 
            to="/admin/login" 
            className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors mt-2"
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