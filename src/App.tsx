import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AudioProvider } from "@/contexts/AudioContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import MobileMenuPage from "@/components/MobileMenuPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GlobalAudioPlayer } from "@/components/GlobalAudioPlayer";
import { useServiceWorkerUpdate } from "@/hooks/useServiceWorkerUpdate";
import { useCacheManager } from "@/hooks/useCacheManager";
import { useIsMobile } from "@/hooks/use-mobile";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import EventRegistration from "./pages/EventRegistration";
import Live from "./pages/Live";
import Contact from "./pages/Contact";
import Prayer from "./pages/Prayer";
import Gallery from "./pages/Gallery";
import Testimonies from "./pages/Testimonies";
import ComingSoon from "./pages/ComingSoon";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotificationSettingsPage from "./pages/NotificationSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  // Ativa gerenciamento automático de cache
  useServiceWorkerUpdate();
  useCacheManager();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className={`flex-1 ${isMobile ? 'pb-20' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/eventos" element={<Events />} />
          <Route path="/eventos/:eventId/inscricao" element={<EventRegistration />} />
          <Route path="/live" element={<Live />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/oracoes" element={<Prayer />} />
          <Route path="/galeria" element={<Gallery />} />
          <Route path="/testemunhos" element={<Testimonies />} />
          <Route path="/notificacoes" element={<NotificationSettingsPage />} />
          <Route path="/menu" element={<MobileMenuPage />} />
          <Route path="/em-breve" element={<ComingSoon />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
          {/* Redirect old routes to coming soon */}
          <Route path="/sermoes" element={<ComingSoon />} />
          <Route path="/estudos" element={<ComingSoon />} />
          {/* Legacy login redirect */}
          <Route path="/login" element={<AdminLogin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isMobile && <Footer />}
      {isMobile && <MobileBottomNav />}
      <GlobalAudioPlayer />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <NotificationProvider>
          <AudioProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </AudioProvider>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
