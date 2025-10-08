import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, CheckCircle, ChevronDown, ChevronUp, Shield, AlertTriangle, Heart, Clock, Eye, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Updated PrayerRequest type without sensitive fields (they're now encrypted separately)
interface SecurePrayerRequest {
  id: string;
  is_approved: boolean | null;
  is_urgent: boolean | null;
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  approved_at: string | null;
  is_completed: boolean | null;
  completed_at: string | null;
  allow_public_share: boolean | null;
  name: string;
  request_text: string;
  category: string | null;
  has_contact_info?: boolean | null;
}

export default function PrayerRequestsManager() {
  const [requests, setRequests] = useState<SecurePrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState<Record<string, { email: string | null, phone: string | null }>>({});
  const { toast } = useToast();

  // Function to load contact info for a specific request
  const loadContactInfo = async (prayerRequestId: string) => {
    if (contactInfo[prayerRequestId]) return; // Already loaded
    
    try {
      const { data, error } = await supabase.functions.invoke('encrypt-contact-data', {
        body: {
          action: 'decrypt_and_retrieve',
          prayer_request_id: prayerRequestId
        }
      });
      
      if (!error && data) {
        setContactInfo(prev => ({
          ...prev,
          [prayerRequestId]: { email: data.email, phone: data.phone }
        }));
      }
    } catch (error) {
      console.error('Error loading contact info:', error);
    }
  };

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

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

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

      setRequests(prev => prev.map(request => 
        request.id === id 
          ? { ...request, is_approved: true, approved_at: new Date().toISOString() }
          : request
      ));

      toast({
        title: "Sucesso",
        description: "Pedido de oração aprovado!",
      });
    } catch (error) {
      console.error('Error approving prayer request:', error);
      toast({
        title: "Erro", 
        description: "Erro ao aprovar pedido de oração",
        variant: "destructive"
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

      setRequests(prev => prev.filter(request => request.id !== id));

      toast({
        title: "Sucesso",
        description: "Pedido de oração removido.",
      });
    } catch (error) {
      console.error('Error deleting prayer request:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover pedido de oração",
        variant: "destructive"
      });
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prayer_requests')
        .update({ 
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setRequests(prev => prev.map(request => 
        request.id === id 
          ? { ...request, is_completed: true, completed_at: new Date().toISOString() }
          : request
      ));

      toast({
        title: "Sucesso",
        description: "Pedido de oração marcado como concluído!",
      });
    } catch (error) {
      console.error('Error completing prayer request:', error);
      toast({
        title: "Erro",
        description: "Erro ao marcar pedido como concluído",
        variant: "destructive"
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'saude': return 'destructive';
      case 'familia': return 'secondary';
      case 'trabalho': return 'outline';
      case 'espiritual': return 'default';
      case 'financeiro': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'saude': return 'Saúde';
      case 'familia': return 'Família';
      case 'trabalho': return 'Trabalho';
      case 'espiritual': return 'Espiritual';
      case 'financeiro': return 'Financeiro';
      default: return 'Geral';
    }
  };

  const RequestCard = ({ request, isExpanded, onToggle }: { 
    request: SecurePrayerRequest; 
    isExpanded: boolean; 
    onToggle: () => void; 
  }) => {
    const currentContactInfo = contactInfo[request.id];
    
    // Load contact info when card is expanded
    useEffect(() => {
      if (isExpanded && request.has_contact_info && !currentContactInfo) {
        loadContactInfo(request.id);
      }
    }, [isExpanded, request.has_contact_info, currentContactInfo, request.id]);

    return (
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant={getCategoryColor(request.category || 'geral')} className="text-xs">
                  {getCategoryName(request.category || 'geral')}
                </Badge>
                {request.is_urgent && (
                  <Badge variant="destructive" className="text-xs">
                    Urgente
                  </Badge>
                )}
                {request.has_contact_info && (
                  <Badge variant="outline" className="text-xs">
                    📞 Contato
                  </Badge>
                )}
              </div>
              <div className="flex space-x-2">
                {!request.is_approved && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleReject(request.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rejeitar
                    </Button>
                  </>
                )}
                {request.is_approved && !request.is_completed && (
                  <>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => handleComplete(request.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Marcar Concluído
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleReject(request.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </>
                )}
                {request.is_completed && (
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleReject(request.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={onToggle}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div>
              <p className="font-semibold">{request.name}</p>
              <p className="text-sm text-gray-600 mt-1">
                {isExpanded ? request.request_text : `${request.request_text.substring(0, 100)}...`}
              </p>
            </div>

            {isExpanded && (
              <div className="space-y-3 pt-3 border-t">
                {request.has_contact_info && (
                  <div className="bg-muted p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Informações de Contato (Criptografadas)
                    </h4>
                    {currentContactInfo ? (
                      <>
                        {currentContactInfo.email && (
                          <p className="text-sm"><strong>Email:</strong> {currentContactInfo.email}</p>
                        )}
                        {currentContactInfo.phone && (
                          <p className="text-sm"><strong>Telefone:</strong> {currentContactInfo.phone}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Carregando informações de contato...</p>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Criado: {format(new Date(request.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                  {request.approved_at && (
                    <span>Aprovado: {format(new Date(request.approved_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                  )}
                  {request.completed_at && (
                    <span>Concluído: {format(new Date(request.completed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const pendingRequests = requests.filter(req => !req.is_approved);
  const approvedRequests = requests.filter(req => req.is_approved && !req.is_completed);
  const completedRequests = requests.filter(req => req.is_completed);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Gerenciar Pedidos de Oração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Carregando pedidos de oração...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            Gerenciar Pedidos de Oração
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Contatos Criptografados
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Pendentes ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Aprovados ({approvedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Concluídos ({completedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum pedido pendente</h3>
                <p className="text-muted-foreground">Todos os pedidos foram revisados.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    isExpanded={expandedRequest === request.id}
                    onToggle={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            {approvedRequests.length === 0 ? (
              <div className="text-center py-8">
                <Check className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum pedido aprovado</h3>
                <p className="text-muted-foreground">Pedidos aprovados aparecerão aqui.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    isExpanded={expandedRequest === request.id}
                    onToggle={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedRequests.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum pedido concluído</h3>
                <p className="text-muted-foreground">Pedidos concluídos aparecerão aqui.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    isExpanded={expandedRequest === request.id}
                    onToggle={() => setExpandedRequest(expandedRequest === request.id ? null : request.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}