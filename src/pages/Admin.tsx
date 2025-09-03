import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GalleryManager } from '@/components/admin/GalleryManager';
import { TestimoniesManager } from '@/components/admin/TestimoniesManager';
import { LogOut, Users, Image, Settings, MessageCircle } from 'lucide-react';

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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="testimonies" className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-2" />
                Testemunhos
              </TabsTrigger>
              <TabsTrigger value="gallery" className="flex items-center">
                <Image className="w-4 h-4 mr-2" />
                Galeria
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="testimonies" className="mt-6">
              <TestimoniesManager />
            </TabsContent>

            <TabsContent value="gallery" className="mt-6">
              <GalleryManager />
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Site</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Informações Gerais</h4>
                      <p className="text-sm text-muted-foreground">
                        Configurações básicas do site serão implementadas em breve.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Admin;