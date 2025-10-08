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
import { LogOut } from 'lucide-react';
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