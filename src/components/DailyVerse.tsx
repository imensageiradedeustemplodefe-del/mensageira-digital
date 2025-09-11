import { useState, useEffect } from "react";
import { Share2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Verse {
  text: string;
  reference: string;
}

const DailyVerse = () => {
  const [verse, setVerse] = useState<Verse>({
    text: "",
    reference: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Lista de versículos inspiradores
  const verses = [
    {
      text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o SENHOR; pensamentos de paz, e não de mal, para vos dar o fim que esperais.",
      reference: "Jeremias 29:11"
    },
    {
      text: "Tudo posso naquele que me fortalece.",
      reference: "Filipenses 4:13"
    },
    {
      text: "O SENHOR é o meu pastor; nada me faltará.",
      reference: "Salmos 23:1"
    },
    {
      text: "Entrega o teu caminho ao SENHOR; confia nele, e ele tudo fará.",
      reference: "Salmos 37:5"
    },
    {
      text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.",
      reference: "Romanos 8:28"
    },
    {
      text: "Não tema, porque eu sou contigo; não te assombres, porque eu sou teu Deus.",
      reference: "Isaías 41:10"
    },
    {
      text: "Buscar-me-eis, e me achareis, quando me buscardes com todo o vosso coração.",
      reference: "Jeremias 29:13"
    }
  ];

  const getDailyVerse = (useRandom = false) => {
    setIsLoading(true);
    let verseIndex;
    
    if (useRandom) {
      // Gera um índice aleatório para o botão de atualizar
      verseIndex = Math.floor(Math.random() * verses.length);
    } else {
      // Gera um índice baseado na data atual para o versículo do dia
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      verseIndex = dayOfYear % verses.length;
    }
    
    setTimeout(() => {
      setVerse(verses[verseIndex]);
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    getDailyVerse();
  }, []);

  const shareVerse = async () => {
    const shareText = `"${verse.text}" - ${verse.reference}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Palavra do Dia - Mensageira de Deus Templo de Fé',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para copiar para área de transferência
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Versículo copiado!",
          description: "O versículo foi copiado para a área de transferência.",
        });
      } catch (error) {
        toast({
          title: "Erro ao copiar",
          description: "Não foi possível copiar o versículo.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary-light/20 to-warm-gold/30 border-none shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-spiritual-glow/5 to-transparent"></div>
      <CardContent className="relative p-6 sm:p-8">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Palavra do Dia</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => getDailyVerse(true)}
              disabled={isLoading}
              className="hover:bg-white/20"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={shareVerse}
              className="hover:bg-white/20"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/3"></div>
          </div>
        ) : (
          <div className="space-y-3">
            <blockquote className="text-foreground text-base sm:text-lg italic leading-relaxed">
              "{verse.text}"
            </blockquote>
            <cite className="block text-sm font-medium text-muted-foreground">
              — {verse.reference}
            </cite>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyVerse;