import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Events from "./pages/Events";
import Live from "./pages/Live";
import Contact from "./pages/Contact";
import Prayer from "./pages/Prayer";
import Gallery from "./pages/Gallery";
import Testimonies from "./pages/Testimonies";
import ComingSoon from "./pages/ComingSoon";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/sobre" element={<About />} />
                <Route path="/eventos" element={<Events />} />
                <Route path="/live" element={<Live />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/oracoes" element={<Prayer />} />
                <Route path="/galeria" element={<Gallery />} />
                <Route path="/testemunhos" element={<Testimonies />} />
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
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
