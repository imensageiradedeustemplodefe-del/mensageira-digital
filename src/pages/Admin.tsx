import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { TestimoniesManager } from '@/components/admin/TestimoniesManager';
import { MediaManager } from '@/components/admin/MediaManager';
import PrayerRequestsManager from '@/components/admin/PrayerRequestsManager';
import EventsManager from '@/components/admin/EventsManager';
import LiveStreamsManager from '@/components/admin/LiveStreamsManager';
import DashboardStats from '@/components/admin/DashboardStats';
import { LogOut, Image, Settings, MessageCircle, Music, Heart, Calendar, Radio, BarChart3 } from 'lucide-react';

const Admin = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <Settings className="w-6 sm:w-8 h-6 sm:h-8 text-primary mr-3" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Painel Administrativo
                </h1>
                <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
                  Gerencie o conteúdo do site da igreja
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="self-end sm:self-auto">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sair</span>
              <span className="sm:hidden">Sair</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Admin Panel */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 h-auto p-2">
              <TabsTrigger value="dashboard" className="flex items-center justify-center flex-col sm:flex-row p-3 text-xs sm:text-sm">
                <BarChart3 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden mt-1">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="testimonies" className="flex items-center justify-center flex-col sm:flex-row p-3 text-xs sm:text-sm">
                <MessageCircle className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Testemunhos</span>
                <span className="sm:hidden mt-1">Teste</span>
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center justify-center flex-col sm:flex-row p-3 text-xs sm:text-sm">
                <Image className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Galeria</span>
                <span className="sm:hidden mt-1">Fotos</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center justify-center flex-col sm:flex-row p-3 text-xs sm:text-sm">
                <Music className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Mídias</span>
                <span className="sm:hidden mt-1">Mídia</span>
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center justify-center flex-col sm:flex-row p-3 text-xs sm:text-sm">
                <Calendar className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Eventos</span>
                <span className="sm:hidden mt-1">Event</span>
              </TabsTrigger>
              <TabsTrigger value="prayers" className="flex items-center justify-center flex-col sm:flex-row p-3 text-xs sm:text-sm">
                <Heart className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Orações</span>
                <span className="sm:hidden mt-1">Orar</span>
              </TabsTrigger>
              <TabsTrigger value="live" className="flex items-center justify-center flex-col sm:flex-row p-3 text-xs sm:text-sm">
                <Radio className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Transmissões</span>
                <span className="sm:hidden mt-1">Live</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <DashboardStats />
            </TabsContent>

            <TabsContent value="testimonies" className="mt-6">
              <TestimoniesManager />
            </TabsContent>

            <TabsContent value="gallery" className="mt-6">
              <GalleryManager />
            </TabsContent>

            <TabsContent value="media" className="mt-6">
              <MediaManager />
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <EventsManager />
            </TabsContent>

            <TabsContent value="prayers" className="mt-6">
              <PrayerRequestsManager />
            </TabsContent>
            
            <TabsContent value="live" className="mt-6">
              <LiveStreamsManager />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Admin;