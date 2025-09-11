import { useSiteSettings } from '@/hooks/useSiteSettings';

const Footer = () => {
  const { settings } = useSiteSettings();
  
  return (
    <footer className="bg-card border-t border-border py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Mensageira de Deus Templo de Fé | Desenvolvido por <span className="font-medium text-primary">Palavra Viva</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;