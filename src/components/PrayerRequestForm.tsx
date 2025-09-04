import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Send, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function PrayerRequestForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    request_text: '',
    category: 'geral',
    is_urgent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('prayer_requests')
        .insert([formData]);

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Pedido de Oração Enviado",
        description: "Seu pedido foi recebido e será analisado pela equipe pastoral.",
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        request_text: '',
        category: 'geral',
        is_urgent: false
      });

    } catch (error: any) {
      console.error('Erro ao enviar pedido:', error);
      toast({
        title: "Erro ao Enviar",
        description: "Houve um problema ao enviar seu pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Pedido Recebido!
          </h3>
          <p className="text-muted-foreground mb-6">
            Obrigado por compartilhar sua necessidade conosco. Nossa equipe pastoral 
            estará orando por você e sua situação.
          </p>
          <Button onClick={() => setIsSubmitted(false)} variant="outline">
            Enviar Outro Pedido
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Pedido de Oração</CardTitle>
        <p className="text-muted-foreground">
          Compartilhe sua necessidade de oração conosco. Estaremos intercedendo por você.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="familia">Família</SelectItem>
                  <SelectItem value="trabalho">Trabalho</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="espiritual">Espiritual</SelectItem>
                  <SelectItem value="relacionamentos">Relacionamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail (Opcional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (Opcional)</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="request_text">Pedido de Oração *</Label>
            <Textarea
              id="request_text"
              value={formData.request_text}
              onChange={(e) => setFormData({...formData, request_text: e.target.value})}
              required
              rows={5}
              placeholder="Compartilhe sua necessidade de oração..."
              className="resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_urgent"
              checked={formData.is_urgent}
              onCheckedChange={(checked) => 
                setFormData({...formData, is_urgent: checked as boolean})
              }
            />
            <Label htmlFor="is_urgent" className="text-sm">
              Marcar como pedido urgente
            </Label>
          </div>

          <Alert>
            <Heart className="h-4 w-4" />
            <AlertDescription>
              Seus dados são tratados com confidencialidade. Apenas a equipe pastoral 
              terá acesso ao seu pedido de oração.
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Pedido
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}