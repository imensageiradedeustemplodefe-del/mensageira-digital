import { NotificationSettings } from '@/components/NotificationSettings';

const NotificationSettingsPage = () => {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configurações de Notificações
          </h1>
          <p className="text-muted-foreground">
            Gerencie como e quando você deseja receber notificações da igreja.
          </p>
        </div>
        
        <NotificationSettings />
      </div>
    </div>
  );
};

export default NotificationSettingsPage;