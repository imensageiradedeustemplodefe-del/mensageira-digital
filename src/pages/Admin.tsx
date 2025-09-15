import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { AlbumsManager } from '@/components/admin/AlbumsManager';
import { TestimoniesManager } from '@/components/admin/TestimoniesManager';
import { MediaManager } from '@/components/admin/MediaManager';
import PrayerRequestsManager from '@/components/admin/PrayerRequestsManager';
import EventsManager from '@/components/admin/EventsManager';
import EventTemplatesManager from '@/components/admin/EventTemplatesManager';
import LiveStreamsManager from '@/components/admin/LiveStreamsManager';
import DashboardStats from '@/components/admin/DashboardStats';
import { LogOut, Image, Settings, MessageCircle, Music, Heart, Calendar, Radio, BarChart3, FolderOpen, Copy } from 'lucide-react';

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
            {/* Mobile: Horizontal scroll, Desktop: Grid */}
            <div className="w-full">
              <TabsList className="w-full h-auto p-1 sm:p-2">
                {/* Mobile: Horizontal scrollable tabs */}
                <div className="flex lg:grid lg:grid-cols-9 w-full overflow-x-auto lg:overflow-x-visible gap-1 sm:gap-2 pb-1 lg:pb-0">
                  <TabsTrigger 
                    value="dashboard" 
                    className="flex items-center justify-center whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm min-w-[80px] lg:min-w-0"
                  >
                    <BarChart3 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden ml-1">Stats</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="albums" 
                    className="flex items-center justify-center whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm min-w-[80px] lg:min-w-0"
                  >
                    <FolderOpen className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Álbuns</span>
                    <span className="sm:hidden ml-1">Álbuns</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="testimonies" 
                    className="flex items-center justify-center whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm min-w-[90px] lg:min-w-0"
                  >
                    <MessageCircle className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Testemunhos</span>
                    <span className="sm:hidden ml-1">Testes</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="gallery" 
                    className="flex items-center justify-center whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm min-w-[70px] lg:min-w-0"
                  >
                    <Image className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Fotos</span>
                    <span className="sm:hidden ml-1">Fotos</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="media" 
                    className="flex items-center justify-center whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm min-w-[70px] lg:min-w-0"
                  >
                    <Music className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Mídias</span>
                    <span className="sm:hidden ml-1">Mídia</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="events" 
                    className="flex items-center justify-center whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm min-w-[80px] lg:min-w-0"
                  >
                    <Calendar className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Eventos</span>
                    <span className="sm:hidden ml-1">Events</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="templates" 
                    className="flex items-center justify-center whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm min-w-[80px] lg:min-w-0"
                  >
                    <Copy className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Modelos</span>
                    <span className="sm:hidden ml-1">Models</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="prayers" 
                    className="flex items-center justify-center whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm min-w-[80px] lg:min-w-0"
                  >
                    <Heart className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Orações</span>
                    <span className="sm:hidden ml-1">Orações</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="live" 
                    className="flex items-center justify-center whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm min-w-[70px] lg:min-w-0"
                  >
                    <Radio className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Transmissões</span>
                    <span className="sm:hidden ml-1">Live</span>
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="mt-6">
              <DashboardStats />
            </TabsContent>

            <TabsContent value="albums" className="mt-6">
              <AlbumsManager />
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

            <TabsContent value="templates" className="mt-6">
              <EventTemplatesManager />
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