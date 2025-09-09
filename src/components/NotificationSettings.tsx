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
      <div className="w-full max-w-2xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BellOff className="w-5 h-5" />
              Notificações
            </CardTitle>
            <CardDescription className="text-sm">
              Notificações não são suportadas neste dispositivo ou navegador.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Bell className="w-5 h-5" />
            Notificações Push
          </CardTitle>
          <CardDescription className="text-sm">
            Receba avisos sobre novos eventos, cultos e atualizações importantes da igreja.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="push-notifications" className="text-base font-medium">
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
              <p className="text-sm text-muted-foreground mb-3 font-medium">
                Ative as notificações para:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>
                  Novos eventos e cultos especiais
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>
                  Lembretes de Santa Ceia
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>
                  Atualizações importantes da igreja
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>
                  Mensagens do pastor
                </li>
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
              size="lg"
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
    </div>
  );
};