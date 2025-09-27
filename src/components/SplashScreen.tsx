import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary/80">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="flex flex-col items-center space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="relative">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl animate-scale-in">
            <img 
              src="/lovable-uploads/e0927536-21ca-4d51-b004-638d6974f554.png" 
              alt="Mensageira de Deus" 
              className="w-16 h-16 object-cover rounded-full"
            />
          </div>
          <div className="absolute -inset-4 bg-white/20 rounded-full animate-ping opacity-75" />
        </div>

        {/* App Name */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Mensageira de Deus
          </h1>
          <p className="text-white/90 text-sm md:text-base font-medium">
            Templo de Fé
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 max-w-sm mx-auto">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/80 text-xs text-center mt-2">
            Carregando... {Math.round(progress)}%
          </p>
        </div>

        {/* Inspirational Text */}
        <div className="text-center max-w-xs">
          <p className="text-white/90 text-sm italic">
            "E conhecereis a verdade, e a verdade vos libertará."
          </p>
          <p className="text-white/70 text-xs mt-1">João 8:32</p>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};