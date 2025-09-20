import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Send, Users, TrendingUp, Settings } from 'lucide-react';

interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  is_active: boolean;
  created_at: string;
}

const PushNotificationsManager = () => {
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [targetUrl, setTargetUrl] = useState('/');
  const [notificationType, setNotificationType] = useState<string>('custom');
  const { toast } = useToast();

  const predefinedNotifications = {
    daily_verse: {
      title: '📖 Nova Palavra do Dia',
      body: 'Uma nova palavra de inspiração está disponível para você!'
    },
    live_stream: {
      title: '🔴 Transmissão ao Vivo',
      body: 'A transmissão está ao vivo agora! Não perca!'
    },
    event_today: {
      title: '⛪ Evento de Hoje',
      body: 'Hoje temos um evento especial na igreja!'
    },
    new_prayer: {
      title: '🙏 Nova Oração',
      body: 'Uma nova oração foi adicionada ao mural, ajude a interceder!'
    },
    new_testimony: {
      title: '✨ Novo Testemunho',
      body: 'Novo testemunho disponível! Veja o que o Senhor pode fazer em nossas vidas.'
    },
    new_photos: {
      title: '📸 Novas Fotos',
      body: 'Novas fotos foram adicionadas! Relembre esses momentos especiais.'
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar inscrições de notificação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationTypeChange = (type: string) => {
    setNotificationType(type);
    if (type !== 'custom' && predefinedNotifications[type as keyof typeof predefinedNotifications]) {
      const notification = predefinedNotifications[type as keyof typeof predefinedNotifications];
      setTitle(notification.title);
      setBody(notification.body);
    } else {
      setTitle('');
      setBody('');
    }
  };

  const sendPushNotification = async () => {
    if (!title.trim() || !body.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e mensagem são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const response = await fetch('https://zienifzedhpcynuozfan.supabase.co/functions/v1/send-push-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          url: targetUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();
      
      toast({
        title: "Sucesso!",
        description: `Notificação enviada para ${result.successful} usuários.`,
      });

      // Reset form
      setTitle('');
      setBody('');
      setTargetUrl('/');
      setNotificationType('custom');

    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar notificação push.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const activeSubscriptions = subscriptions.filter(sub => sub.is_active);
  const totalSubscriptions = subscriptions.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inscrições Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">
              Usuários que receberão notificações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Inscrições</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Incluindo inativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ativação</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalSubscriptions > 0 ? Math.round((activeSubscriptions.length / totalSubscriptions) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Usuários com notificações ativas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Send Notification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Enviar Notificação Push
          </CardTitle>
          <CardDescription>
            Envie uma notificação personalizada para todos os usuários inscritos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notification-type">Tipo de Notificação</Label>
            <Select value={notificationType} onValueChange={handleNotificationTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de notificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Personalizada</SelectItem>
                <SelectItem value="daily_verse">Palavra do Dia</SelectItem>
                <SelectItem value="live_stream">Transmissão ao Vivo</SelectItem>
                <SelectItem value="event_today">Evento de Hoje</SelectItem>
                <SelectItem value="new_prayer">Nova Oração</SelectItem>
                <SelectItem value="new_testimony">Novo Testemunho</SelectItem>
                <SelectItem value="new_photos">Novas Fotos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título da Notificação</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da notificação"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">{title.length}/50 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Mensagem</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Digite a mensagem da notificação"
              maxLength={120}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{body.length}/120 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-url">URL de Destino (opcional)</Label>
            <Select value={targetUrl} onValueChange={setTargetUrl}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="/">Página Inicial</SelectItem>
                <SelectItem value="/events">Eventos</SelectItem>
                <SelectItem value="/prayer">Orações</SelectItem>
                <SelectItem value="/testimonies">Testemunhos</SelectItem>
                <SelectItem value="/gallery">Galeria</SelectItem>
                <SelectItem value="/live">Transmissão ao Vivo</SelectItem>
                <SelectItem value="/about">Sobre</SelectItem>
                <SelectItem value="/contact">Contato</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={sendPushNotification} 
            disabled={sending || !title.trim() || !body.trim()}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? 'Enviando...' : 'Enviar Notificação'}
          </Button>
        </CardContent>
      </Card>

      {/* Subscription List */}
      <Card>
        <CardHeader>
          <CardTitle>Inscrições de Notificação</CardTitle>
          <CardDescription>
            Lista de usuários inscritos para receber notificações push
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma inscrição de notificação encontrada.
            </p>
          ) : (
            <div className="space-y-2">
              {subscriptions.slice(0, 10).map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${subscription.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <p className="text-sm font-medium">
                        Usuário: {subscription.user_id?.substring(0, 8)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Criado em: {new Date(subscription.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subscription.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                      {subscription.is_active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
              ))}
              {subscriptions.length > 10 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  E mais {subscriptions.length - 10} inscrições...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PushNotificationsManager;