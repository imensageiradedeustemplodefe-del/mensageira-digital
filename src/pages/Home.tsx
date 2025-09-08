import { useState, useEffect, Suspense, lazy } from "react";
import { useToast } from "@/hooks/use-toast";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy loading dos componentes
const DailyVerse = lazy(() => import("@/components/DailyVerse"));
const MediaPlayer = lazy(() => import("@/components/MediaPlayer").then(module => ({ default: module.MediaPlayer })));
const HeroSection = lazy(() => import("@/components/home/HeroSection").then(module => ({ default: module.HeroSection })));
const UpcomingEvents = lazy(() => import("@/components/home/UpcomingEvents").then(module => ({ default: module.UpcomingEvents })));
const ContactSection = lazy(() => import("@/components/home/ContactSection").then(module => ({ default: module.ContactSection })));

// Componente de loading skeleton
const SectionSkeleton = ({ className }: { className?: string }) => (
  <section className={className}>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  </section>
);

const Home = () => {
  const { toast } = useToast();
  const { settings, loading: settingsLoading } = useSiteSettings();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installable, setInstallable] = useState(false);
  
  // Hook para gerenciar atualizações automáticas
  useServiceWorkerUpdate();

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    const promptEvent = deferredPrompt;
    setDeferredPrompt(null);
    setInstallable(false);

    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;

    if (outcome === 'accepted') {
      toast({
        title: "App instalado!",
        description: "O app foi instalado com sucesso em seu dispositivo.",
      });
    } else {
      setInstallable(true);
      setDeferredPrompt(promptEvent);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section com Suspense */}
      <Suspense fallback={<SectionSkeleton className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 via-background to-peaceful-blue/20" />}>
        <HeroSection installable={installable} onInstallClick={handleInstallClick} />
      </Suspense>

      {/* Daily Verse Section com Suspense */}
      <Suspense fallback={<SectionSkeleton className="py-12 bg-background" />}>
        <section className="py-12 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <DailyVerse />
          </div>
        </section>
      </Suspense>

      {/* Media Player Section com Suspense */}
      <Suspense fallback={<SectionSkeleton className="py-12 bg-accent/30" />}>
        <section className="py-12 bg-accent/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <MediaPlayer />
          </div>
        </section>
      </Suspense>

      {/* Upcoming Events com Suspense */}
      <Suspense fallback={<SectionSkeleton className="py-16 bg-background" />}>
        <UpcomingEvents loading={settingsLoading} />
      </Suspense>

      {/* Contact Info com Suspense */}
      <Suspense fallback={<SectionSkeleton className="py-16 bg-background" />}>
        <ContactSection />
      </Suspense>
    </div>
  );
};

export default Home;