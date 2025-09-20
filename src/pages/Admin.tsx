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
import PushNotificationsManager from '@/components/admin/PushNotificationsManager';
import { LogOut, Image, Settings, MessageCircle, Music, Heart, Calendar, Radio, BarChart3, FolderOpen, Copy, Bell } from 'lucide-react';

const Admin = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-4 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center min-w-0 flex-1">
              <Settings className="w-6 sm:w-7 lg:w-8 h-6 sm:h-7 lg:h-8 text-primary mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold text-foreground truncate">
                  Painel Administrativo
                </h1>
                <p className="text-muted-foreground mt-1 text-xs sm:text-sm lg:text-base hidden sm:block">
                  Gerencie o conteúdo do site da igreja
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="flex-shrink-0">
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden xs:inline">Sair</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Admin Panel */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="dashboard" className="space-y-6">
            {/* Tabs Navigation */}
            <div className="w-full overflow-hidden">
              <TabsList className="w-full h-auto p-2 bg-muted/30 rounded-lg">
                {/* Mobile: Horizontal scroll with better spacing */}
                <div className="flex lg:grid lg:grid-cols-10 w-full overflow-x-auto lg:overflow-x-visible gap-1 lg:gap-2 scrollbar-hide">
                  <TabsTrigger 
                    value="dashboard" 
                    className="flex flex-col lg:flex-row items-center justify-center whitespace-nowrap px-3 py-4 lg:py-3 text-xs lg:text-sm min-w-[80px] lg:min-w-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <BarChart3 className="w-5 h-5 mb-1 lg:mb-0 lg:mr-2 flex-shrink-0" />
                    <span className="text-[10px] lg:text-sm font-medium">Dashboard</span>
                  </TabsTrigger>

                  <TabsTrigger 
                    value="notifications" 
                    className="flex flex-col lg:flex-row items-center justify-center whitespace-nowrap px-3 py-4 lg:py-3 text-xs lg:text-sm min-w-[80px] lg:min-w-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Bell className="w-5 h-5 mb-1 lg:mb-0 lg:mr-2 flex-shrink-0" />
                    <span className="text-[10px] lg:text-sm font-medium">Notific.</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="albums" 
                    className="flex flex-col lg:flex-row items-center justify-center whitespace-nowrap px-3 py-4 lg:py-3 text-xs lg:text-sm min-w-[80px] lg:min-w-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <FolderOpen className="w-5 h-5 mb-1 lg:mb-0 lg:mr-2 flex-shrink-0" />
                    <span className="text-[10px] lg:text-sm font-medium">Álbuns</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="testimonies" 
                    className="flex flex-col lg:flex-row items-center justify-center whitespace-nowrap px-3 py-4 lg:py-3 text-xs lg:text-sm min-w-[80px] lg:min-w-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <MessageCircle className="w-5 h-5 mb-1 lg:mb-0 lg:mr-2 flex-shrink-0" />
                    <span className="text-[10px] lg:text-sm font-medium">Testes</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="gallery" 
                    className="flex flex-col lg:flex-row items-center justify-center whitespace-nowrap px-3 py-4 lg:py-3 text-xs lg:text-sm min-w-[80px] lg:min-w-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Image className="w-5 h-5 mb-1 lg:mb-0 lg:mr-2 flex-shrink-0" />
                    <span className="text-[10px] lg:text-sm font-medium">Fotos</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="media" 
                    className="flex flex-col lg:flex-row items-center justify-center whitespace-nowrap px-3 py-4 lg:py-3 text-xs lg:text-sm min-w-[80px] lg:min-w-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Music className="w-5 h-5 mb-1 lg:mb-0 lg:mr-2 flex-shrink-0" />
                    <span className="text-[10px] lg:text-sm font-medium">Mídia</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="events" 
                    className="flex flex-col lg:flex-row items-center justify-center whitespace-nowrap px-3 py-4 lg:py-3 text-xs lg:text-sm min-w-[80px] lg:min-w-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Calendar className="w-5 h-5 mb-1 lg:mb-0 lg:mr-2 flex-shrink-0" />
                    <span className="text-[10px] lg:text-sm font-medium">Eventos</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="templates" 
                    className="flex flex-col lg:flex-row items-center justify-center whitespace-nowrap px-3 py-4 lg:py-3 text-xs lg:text-sm min-w-[80px] lg:min-w-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Copy className="w-5 h-5 mb-1 lg:mb-0 lg:mr-2 flex-shrink-0" />
                    <span className="text-[10px] lg:text-sm font-medium">Modelos</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="prayers" 
                    className="flex flex-col lg:flex-row items-center justify-center whitespace-nowrap px-3 py-4 lg:py-3 text-xs lg:text-sm min-w-[80px] lg:min-w-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Heart className="w-5 h-5 mb-1 lg:mb-0 lg:mr-2 flex-shrink-0" />
                    <span className="text-[10px] lg:text-sm font-medium">Orações</span>
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="live" 
                    className="flex flex-col lg:flex-row items-center justify-center whitespace-nowrap px-3 py-4 lg:py-3 text-xs lg:text-sm min-w-[80px] lg:min-w-0 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    <Radio className="w-5 h-5 mb-1 lg:mb-0 lg:mr-2 flex-shrink-0" />
                    <span className="text-[10px] lg:text-sm font-medium">Live</span>
                  </TabsTrigger>
                </div>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="mt-4 sm:mt-6">
              <DashboardStats />
            </TabsContent>

            <TabsContent value="notifications" className="mt-4 sm:mt-6">
              <PushNotificationsManager />
            </TabsContent>

            <TabsContent value="albums" className="mt-4 sm:mt-6">
              <AlbumsManager />
            </TabsContent>

            <TabsContent value="testimonies" className="mt-4 sm:mt-6">
              <TestimoniesManager />
            </TabsContent>

            <TabsContent value="gallery" className="mt-4 sm:mt-6">
              <GalleryManager />
            </TabsContent>

            <TabsContent value="media" className="mt-4 sm:mt-6">
              <MediaManager />
            </TabsContent>

            <TabsContent value="events" className="mt-4 sm:mt-6">
              <EventsManager />
            </TabsContent>

            <TabsContent value="templates" className="mt-4 sm:mt-6">
              <EventTemplatesManager />
            </TabsContent>

            <TabsContent value="prayers" className="mt-4 sm:mt-6">
              <PrayerRequestsManager />
            </TabsContent>
            
            <TabsContent value="live" className="mt-4 sm:mt-6">
              <LiveStreamsManager />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Admin;