import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const NotificationSettings = () => {
  const { isSupported, isRegistered, subscribeToPush, unsubscribeFromPush } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Notificações não são suportadas neste dispositivo ou navegador.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba avisos sobre novos eventos, cultos e atualizações importantes da igreja.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications" className="text-base">
              Ativar Notificações
            </Label>
            <div className="text-sm text-muted-foreground">
              Receba notificações sobre eventos e atualizações
            </div>
          </div>
          <Switch
            id="push-notifications"
            checked={isRegistered}
            onCheckedChange={(checked) => {
              if (checked) {
                subscribeToPush();
              } else {
                unsubscribeFromPush();
              }
            }}
          />
        </div>

        {!isRegistered && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">
              Ative as notificações para:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Novos eventos e cultos especiais</li>
              <li>• Lembretes de Santa Ceia</li>
              <li>• Atualizações importantes da igreja</li>
              <li>• Mensagens do pastor</li>
            </ul>
          </div>
        )}

        {isRegistered && (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-primary font-medium mb-2">
              <Bell className="w-4 h-4" />
              Notificações Ativadas
            </div>
            <p className="text-sm text-muted-foreground">
              Você receberá notificações sobre eventos e atualizações importantes da igreja.
            </p>
          </div>
        )}

        {isSupported && (
          <Button
            variant={isRegistered ? "outline" : "default"}
            onClick={isRegistered ? unsubscribeFromPush : subscribeToPush}
            className="w-full"
          >
            {isRegistered ? (
              <>
                <BellOff className="w-4 h-4 mr-2" />
                Desativar Notificações
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Ativar Notificações
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};