import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto flex items-center justify-center">
          <span className="text-3xl font-bold text-white">404</span>
        </div>
        <h1 className="text-4xl font-bold text-foreground">Página não encontrada</h1>
        <p className="text-xl text-muted-foreground">
          Ops! A página que você procura não existe ou foi movida.
        </p>
        <a 
          href="/" 
          className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Voltar ao Início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
