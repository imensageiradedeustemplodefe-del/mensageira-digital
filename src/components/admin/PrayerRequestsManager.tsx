import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Check, 
  X, 
  Clock, 
  AlertTriangle,
  Eye,
  Mail,
  Phone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrayerRequest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  request_text: string;
  is_approved: boolean;
  is_urgent: boolean;
  category: string;
  created_at: string;
  approved_at: string | null;
}

export default function PrayerRequestsManager() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

  const fetchPrayerRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar pedidos de oração.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({ 
          is_approved: true,
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setRequests(prev => 
        prev.map(req => 
          req.id === id 
            ? { ...req, is_approved: true, approved_at: new Date().toISOString() }
            : req
        )
      );

      toast({
        title: "Pedido Aprovado",
        description: "O pedido foi aprovado e será exibido publicamente.",
      });
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      toast({
        title: "Erro",
        description: "Erro ao aprovar pedido.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRequests(prev => prev.filter(req => req.id !== id));
      
      toast({
        title: "Pedido Removido",
        description: "O pedido foi removido do sistema.",
      });
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover pedido.",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'saude': 'bg-red-100 text-red-800',
      'familia': 'bg-blue-100 text-blue-800',
      'trabalho': 'bg-green-100 text-green-800',
      'financeiro': 'bg-yellow-100 text-yellow-800',
      'espiritual': 'bg-purple-100 text-purple-800',
      'relacionamentos': 'bg-pink-100 text-pink-800',
      'geral': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['geral'];
  };

  const pendingRequests = requests.filter(req => !req.is_approved);
  const approvedRequests = requests.filter(req => req.is_approved);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
            <span>Carregando pedidos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const RequestCard = ({ request, showActions = true }: { request: PrayerRequest; showActions?: boolean }) => (
    <Card key={request.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{request.name}</h4>
            {request.is_urgent && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Urgente
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {format(new Date(request.created_at), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge className={getCategoryColor(request.category)}>
            {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
          </Badge>
          {request.is_approved && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Check className="w-3 h-3 mr-1" />
              Aprovado
            </Badge>
          )}
        </div>

        <div className="mb-3">
          <p className={`text-sm ${
            expandedRequest === request.id ? '' : 'line-clamp-3'
          }`}>
            {request.request_text}
          </p>
          {request.request_text.length > 150 && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => 
                setExpandedRequest(
                  expandedRequest === request.id ? null : request.id
                )
              }
            >
              <Eye className="w-3 h-3 mr-1" />
              {expandedRequest === request.id ? 'Ver menos' : 'Ver mais'}
            </Button>
          )}
        </div>

        {(request.email || request.phone) && (
          <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
            {request.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {request.email}
              </div>
            )}
            {request.phone && (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {request.phone}
              </div>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2">
            {!request.is_approved ? (
              <>
                <Button
                  size="sm"
                  onClick={() => handleApprove(request.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(request.id)}
                >
                  <X className="w-3 h-3 mr-1" />
                  Rejeitar
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleReject(request.id)}
              >
                <X className="w-3 h-3 mr-1" />
                Excluir
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pedidos de Oração</h2>
          <p className="text-muted-foreground">
            Gerencie os pedidos de oração recebidos pela comunidade
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">
            {pendingRequests.length} pendentes
          </Badge>
          <Badge variant="outline">
            {approvedRequests.length} aprovados
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pendentes ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Aprovados ({approvedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum pedido pendente</h3>
                <p className="text-muted-foreground">
                  Todos os pedidos foram revisados pela equipe pastoral.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Check className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum pedido aprovado</h3>
                <p className="text-muted-foreground">
                  Pedidos aprovados aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvedRequests.map(request => (
                <RequestCard key={request.id} request={request} showActions={true} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}