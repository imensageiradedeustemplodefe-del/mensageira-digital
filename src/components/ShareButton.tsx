import { useState } from 'react';
import { Share2, Facebook, MessageCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export const ShareButton = ({ 
  title, 
  text, 
  url, 
  className = "",
  variant = "outline",
  size = "default"
}: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const shareUrl = url || window.location.href;

  const canUseNativeShare = () => {
    return 'share' in navigator && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const handleNativeShare = async () => {
    if (canUseNativeShare()) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para sua área de transferência."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive"
      });
    }
  };

  const shareOnFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const whatsappText = `${title}\n\n${text}\n\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Se o dispositivo suporta compartilhamento nativo, usar apenas um botão
  if (canUseNativeShare()) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleNativeShare}
        className={className}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Compartilhar
      </Button>
    );
  }

  // Caso contrário, mostrar opções de compartilhamento
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="w-4 h-4 mr-2" />
          Compartilhar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={shareOnWhatsApp}
            className="w-full justify-start"
          >
            <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
            WhatsApp
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={shareOnFacebook}
            className="w-full justify-start"
          >
            <Facebook className="w-4 h-4 mr-2 text-blue-600" />
            Facebook
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyLink}
            className="w-full justify-start"
          >
            {copied ? (
              <Check className="w-4 h-4 mr-2 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? 'Copiado!' : 'Copiar Link'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};