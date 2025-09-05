import { useState } from "react";
import { Heart, Users, Clock, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PrayerRequestForm from "@/components/PrayerRequestForm";
import { usePrayerRequests } from "@/hooks/usePrayerRequests";
import { PublicPrayerRequest } from "@/types/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Prayer = () => {
  const { requests, loading } = usePrayerRequests(true);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'saude': 'text-red-600',
      'familia': 'text-blue-600', 
      'trabalho': 'text-green-600',
      'financeiro': 'text-yellow-600',
      'espiritual': 'text-purple-600',
      'geral': 'text-gray-600'
    };
    return colors[category] || colors['geral'];
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'saude': 'Saúde',
      'familia': 'Família',
      'trabalho': 'Trabalho', 
      'financeiro': 'Financeiro',
      'espiritual': 'Espiritual',
      'geral': 'Geral'
    };
    return names[category] || 'Geral';
  };

  // Type guard to safely access properties
  const getRequestName = (request: any): string => {
    return request.display_name || request.name || 'Anônimo';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-peaceful-blue/20 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Casa de Oração
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            "A minha casa será chamada casa de oração para todos os povos" - Isaías 56:7
          </p>
        </div>
      </section>

      {/* Prayer Request Form Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Compartilhe Sua Necessidade
            </h2>
            <p className="text-lg text-muted-foreground">
              Nossa equipe pastoral estará intercedendo por você em oração.
            </p>
          </div>
          <PrayerRequestForm />
        </div>
      </section>

      {/* Approved Prayer Requests */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Pedidos da Comunidade
            </h2>
            <p className="text-lg text-muted-foreground">
              Vamos interceder uns pelos outros em comunhão.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-muted-foreground">Carregando pedidos...</span>
            </div>
          ) : requests.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum pedido público no momento
                </h3>
                <p className="text-muted-foreground">
                  Seja o primeiro a compartilhar uma necessidade de oração com a comunidade.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <Heart className="w-4 h-4 mr-2 text-primary" />
                        {getRequestName(request)}
                      </CardTitle>
                      {request.is_urgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgente
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed line-clamp-4">
                      {request.request_text}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={getCategoryColor(request.category)}>
                        {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
                      </Badge>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        {format(new Date(request.created_at), "dd 'de' MMM", { locale: ptBR })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Prayer Groups and Times */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Momentos de Oração
            </h2>
            <p className="text-lg text-muted-foreground">
              Participe dos nossos encontros de oração e intercessão.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Guerreiros de Fé</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Grupo de intercessão dedicado à oração pela igreja e comunidade.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Quando:</strong> Terça-feira às 19h</p>
                  <p><strong>Local:</strong> Templo Principal</p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Oração Matinal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Começe o dia buscando a presença de Deus em oração.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Quando:</strong> Segunda à Sexta às 6h</p>
                  <p><strong>Local:</strong> Templo Principal</p>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Vigília Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Uma noite inteira dedicada à oração e comunhão com Deus.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Quando:</strong> Primeira sexta do mês</p>
                  <p><strong>Local:</strong> Templo Principal</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Prayer;