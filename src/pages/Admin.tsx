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
import { LogOut, Image, Settings, MessageCircle, Music, Heart, Calendar, Radio } from 'lucide-react';

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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-primary mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Painel Administrativo
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gerencie o conteúdo do site da igreja
                </p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </section>

      {/* Admin Panel */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="testimonies" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="testimonies" className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Testemunhos
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center">
                <Image className="w-4 h-4 mr-2" />
                Galeria
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center">
                <Music className="w-4 h-4 mr-2" />
                Mídias
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Eventos
              </TabsTrigger>
              <TabsTrigger value="prayers" className="flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                Orações
              </TabsTrigger>
              <TabsTrigger value="live" className="flex items-center">
                <Radio className="w-4 h-4 mr-2" />
                Transmissões
              </TabsTrigger>
            </TabsList>

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