import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, X, Trash2, MessageCircle } from 'lucide-react';

interface Testimony {
  id: string;
  name: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

export function TestimoniesManager() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const fetchTestimonies = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonies(data || []);
    } catch (error) {
      console.error('Erro ao buscar testemunhos:', error);
      toast.error('Erro ao carregar testemunhos');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonies')
        .update({ is_approved: true })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Testemunho aprovado!');
      fetchTestimonies();
    } catch (error) {
      console.error('Erro ao aprovar testemunho:', error);
      toast.error('Erro ao aprovar testemunho');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonies')
        .update({ is_approved: false })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Testemunho rejeitado!');
      fetchTestimonies();
    } catch (error) {
      console.error('Erro ao rejeitar testemunho:', error);
      toast.error('Erro ao rejeitar testemunho');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este testemunho permanentemente?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('testimonies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Testemunho excluído!');
      fetchTestimonies();
    } catch (error) {
      console.error('Erro ao excluir testemunho:', error);
      toast.error('Erro ao excluir testemunho');
    }
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  const pendingTestimonies = testimonies.filter(t => !t.is_approved);
  const approvedTestimonies = testimonies.filter(t => t.is_approved);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Testemunhos</h2>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Pendentes: {pendingTestimonies.length}</span>
          <span>Aprovados: {approvedTestimonies.length}</span>
        </div>
      </div>

      {/* Testemunhos Pendentes */}
      {pendingTestimonies.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Testemunhos Pendentes ({pendingTestimonies.length})
          </h3>
          <div className="grid gap-4">
            {pendingTestimonies.map((testimony) => (
              <Card key={testimony.id} className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{testimony.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(testimony.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary">Pendente</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm mb-4 leading-relaxed">
                    {testimony.content}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(testimony.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(testimony.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Testemunhos Aprovados */}
      {approvedTestimonies.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Check className="w-5 h-5 mr-2 text-green-600" />
            Testemunhos Aprovados ({approvedTestimonies.length})
          </h3>
          <div className="grid gap-4">
            {approvedTestimonies.map((testimony) => (
              <Card key={testimony.id} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{testimony.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(testimony.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-green-600">Aprovado</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm mb-4 leading-relaxed">
                    {testimony.content}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(testimony.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Desaprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(testimony.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {testimonies.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum testemunho encontrado. Os testemunhos enviados aparecerão aqui para aprovação.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}