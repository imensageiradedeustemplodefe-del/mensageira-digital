import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { GoogleDriveManager } from '@/components/admin/GoogleDriveManager';
import { TestimoniesManager } from '@/components/admin/TestimoniesManager';
import { MediaManager } from '@/components/admin/MediaManager';
import PrayerRequestsManager from '@/components/admin/PrayerRequestsManager';
import EventsManager from '@/components/admin/EventsManager';
import EventTemplatesManager from '@/components/admin/EventTemplatesManager';
import LiveStreamsManager from '@/components/admin/LiveStreamsManager';
import DashboardStats from '@/components/admin/DashboardStats';
import PushNotificationsManager from '@/components/admin/PushNotificationsManager';
import { LogOut, Bell } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const Admin = () => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = async () => {
    await signOut();
  };

  const getPageTitle = (tab: string) => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard',
      notifications: 'Notificações Push',
      testimonies: 'Gerenciar Testemunhos',
      drive: 'Integração Google Drive',
      media: 'Biblioteca de Mídia',
      events: 'Gerenciar Eventos',
      templates: 'Modelos de Eventos',
      prayers: 'Pedidos de Oração',
      live: 'Transmissões ao Vivo',
    };
    return titles[tab] || 'Painel Administrativo';
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 flex flex-col">
          {/* Modern Header */}
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              
              <div className="flex items-center gap-2 flex-1">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{getPageTitle(activeTab)}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                size="sm"
                className="ml-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 space-y-6">
              {/* Page Header */}
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">{getPageTitle(activeTab)}</h1>
                <p className="text-muted-foreground">
                  {activeTab === 'dashboard' && 'Visão geral das atividades e estatísticas'}
                  {activeTab === 'notifications' && 'Configure e envie notificações push para os usuários'}
                  {activeTab === 'testimonies' && 'Aprove e gerencie os testemunhos recebidos'}
                  {activeTab === 'drive' && 'Sincronize fotos automaticamente do Google Drive'}
                  {activeTab === 'media' && 'Gerencie vídeos, áudios e músicas'}
                  {activeTab === 'events' && 'Crie e publique eventos da igreja'}
                  {activeTab === 'templates' && 'Crie modelos reutilizáveis para eventos'}
                  {activeTab === 'prayers' && 'Gerencie os pedidos de oração recebidos'}
                  {activeTab === 'live' && 'Configure transmissões ao vivo'}
                </p>
              </div>

              {/* Content */}
              <div className="animate-fade-in">
                {activeTab === 'dashboard' && <DashboardStats />}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="bg-card p-6 rounded-lg border">
                      <h3 className="text-lg font-semibold mb-2">Configurar Notificações</h3>
                      <p className="text-muted-foreground mb-4">
                        Para testar notificações, primeiro configure-as no seu dispositivo:
                      </p>
                      <a 
                        href="/notificacoes" 
                        target="_blank"
                        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Configurar Notificações
                      </a>
                    </div>
                    <PushNotificationsManager />
                  </div>
                )}
                {activeTab === 'testimonies' && <TestimoniesManager />}
                {activeTab === 'drive' && <GoogleDriveManager />}
                {activeTab === 'media' && <MediaManager />}
                {activeTab === 'events' && <EventsManager />}
                {activeTab === 'templates' && <EventTemplatesManager />}
                {activeTab === 'prayers' && <PrayerRequestsManager />}
                {activeTab === 'live' && <LiveStreamsManager />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;