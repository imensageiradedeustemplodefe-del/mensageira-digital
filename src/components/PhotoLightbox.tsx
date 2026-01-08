import { useState, useEffect } from 'react';
import { X, Download, Share2, ChevronLeft, ChevronRight, Facebook, MessageCircle, Heart, HandHeart, Flame, Sparkles, Bird } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
interface Photo {
  id: string;
  name: string;
  thumbUrl: string;
  viewUrl: string;
  createdTime: string;
}

interface PhotoLightboxProps {
  photos: Photo[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  albumDate?: string;
}

type ReactionType = 'love' | 'prayer' | 'amen' | 'hallelujah' | 'glory' | 'fire';

interface Reactions {
  loves: number;
  prayers: number;
  amens: number;
  hallelujahs: number;
  glories: number;
  fires: number;
}

export function PhotoLightbox({ photos, initialIndex, isOpen, onClose, albumDate }: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [reactions, setReactions] = useState<Reactions>({ 
    loves: 0, 
    prayers: 0, 
    amens: 0, 
    hallelujahs: 0, 
    glories: 0, 
    fires: 0 
  });
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const currentPhoto = photos[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (currentPhoto?.id) {
      fetchReactions();
    }
  }, [currentPhoto?.id]);

  const fetchReactions = async () => {
    try {
      // Fetch aggregated counts from view (doesn't expose user_ids)
      const { data: counts, error: countsError } = await supabase
        .from('photo_reaction_counts')
        .select('reaction_type, reaction_count')
        .eq('photo_id', currentPhoto.id);

      if (countsError) {
        console.error('Error fetching reaction counts:', countsError);
      }

      // Build reaction counts from aggregated view
      const reactionCounts = {
        loves: 0,
        prayers: 0,
        amens: 0,
        hallelujahs: 0,
        glories: 0,
        fires: 0
      };

      counts?.forEach(r => {
        const count = Number(r.reaction_count) || 0;
        if (r.reaction_type === 'love') reactionCounts.loves = count;
        else if (r.reaction_type === 'prayer') reactionCounts.prayers = count;
        else if (r.reaction_type === 'amen') reactionCounts.amens = count;
        else if (r.reaction_type === 'hallelujah') reactionCounts.hallelujahs = count;
        else if (r.reaction_type === 'glory') reactionCounts.glories = count;
        else if (r.reaction_type === 'fire') reactionCounts.fires = count;
      });
      
      setReactions(reactionCounts);

      // User reaction state is tracked client-side only now
      // We store the reaction type in localStorage alongside the user_id
      const userId = localStorage.getItem('photo_user_id');
      if (userId) {
        const storedReactions = localStorage.getItem('photo_reactions') || '{}';
        try {
          const reactionsMap = JSON.parse(storedReactions);
          const userReactionType = reactionsMap[currentPhoto.id];
          setUserReaction(userReactionType || null);
        } catch {
          setUserReaction(null);
        }
      } else {
        setUserReaction(null);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
      setReactions({ loves: 0, prayers: 0, amens: 0, hallelujahs: 0, glories: 0, fires: 0 });
      setUserReaction(null);
    }
  };

  const handleReaction = async (type: ReactionType) => {
    try {
      // Get or create user ID
      let userId = localStorage.getItem('photo_user_id');
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('photo_user_id', userId);
      }

      // Get stored reactions map
      const storedReactions = localStorage.getItem('photo_reactions') || '{}';
      let reactionsMap: Record<string, string> = {};
      try {
        reactionsMap = JSON.parse(storedReactions);
      } catch {
        reactionsMap = {};
      }

      if (userReaction === type) {
        // Remove reaction using secure function
        const { data, error } = await supabase
          .rpc('delete_own_reaction', {
            p_photo_id: currentPhoto.id,
            p_user_id: userId
          });
        
        if (error) {
          console.error('Error removing reaction:', error);
          toast.error(`Erro ao remover reação: ${error.message}`);
          return;
        }
        
        // Update localStorage
        delete reactionsMap[currentPhoto.id];
        localStorage.setItem('photo_reactions', JSON.stringify(reactionsMap));
        
        setUserReaction(null);
        toast.success('Reação removida');
      } else {
        // Use secure RPC function to add reaction (handles delete+insert atomically)
        const { data, error } = await supabase
          .rpc('add_photo_reaction', {
            p_photo_id: currentPhoto.id,
            p_user_id: userId,
            p_reaction_type: type
          });
        
        if (error) {
          console.error('Error adding reaction:', error);
          toast.error(`Erro ao adicionar reação: ${error.message}`);
          return;
        }
        
        // Check if the function returned success
        const result = data as { success: boolean; error?: string } | null;
        if (!result?.success) {
          console.error('Error adding reaction:', result?.error);
          toast.error(`Erro ao adicionar reação: ${result?.error || 'Unknown error'}`);
          return;
        }
        
        // Update localStorage
        reactionsMap[currentPhoto.id] = type;
        localStorage.setItem('photo_reactions', JSON.stringify(reactionsMap));
        
        setUserReaction(type);
        
        const messages = {
          love: 'Amei! ❤️',
          prayer: 'Oração enviada 🙏',
          amen: 'Amém! 🙌',
          hallelujah: 'Aleluia! 🕊️',
          glory: 'Glória a Deus! ⭐',
          fire: 'Aviva Senhor! 🔥'
        };
        toast.success(messages[type]);
      }
      
      // Refresh reactions count
      await fetchReactions();
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast.error('Erro ao processar reação');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = async () => {
    try {
      toast.success('Preparando download...');
      
      // Usar URL de tamanho original para download
      const imageUrl = `https://lh3.googleusercontent.com/d/${currentPhoto.id}=s0`;
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error('Falha ao baixar imagem');
      }
      
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentPhoto.name || 'foto.jpg';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download concluído!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Não foi possível baixar a foto. Abrindo em nova aba...');
      // Fallback: open in new tab
      window.open(`https://drive.google.com/file/d/${currentPhoto.id}/view`, '_blank');
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Confira esta foto: ${currentPhoto.name}`;
    const url = encodeURIComponent(window.location.href);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}%20${url}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado!');
  };

  if (!currentPhoto) return null;

  // URL para tamanho original do Google Drive (s0 = sem redimensionamento)
  const fullSizeImageUrl = `https://lh3.googleusercontent.com/d/${currentPhoto.id}=s0`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 gap-0 bg-black/98 backdrop-blur-sm">
        {/* Accessibility: Hidden title and description for screen readers */}
        <VisuallyHidden.Root>
          <DialogTitle>Visualizador de Foto</DialogTitle>
          <DialogDescription>
            Foto {currentIndex + 1} de {photos.length}: {currentPhoto.name}
          </DialogDescription>
        </VisuallyHidden.Root>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h3 className="font-semibold text-lg truncate max-w-md">
                {currentPhoto.name.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '')}
              </h3>
              {albumDate && (
                <p className="text-sm text-white/70">
                  {albumDate}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Main Image - Full size */}
        <div className="relative w-full h-full flex items-center justify-center p-16">
          <img
            src={fullSizeImageUrl}
            alt={currentPhoto.name}
            className="max-w-full max-h-full object-contain animate-fade-in"
            loading="eager"
            onError={(e) => {
              // Fallback para URL alternativa se a principal falhar
              const target = e.target as HTMLImageElement;
              if (!target.dataset.fallback) {
                target.dataset.fallback = 'true';
                target.src = currentPhoto.viewUrl || `https://drive.google.com/thumbnail?id=${currentPhoto.id}&sz=w1920`;
              }
            }}
          />
        </div>

        {/* Navigation Buttons */}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12 rounded-full"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 w-12 h-12 rounded-full"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </>
        )}

        {/* Footer with Actions */}
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 to-transparent p-4">
          <div className="flex flex-col gap-3">
            {/* Reactions Row */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('love')}
                className={`text-white hover:bg-white/20 gap-1.5 ${
                  userReaction === 'love' ? 'bg-white/20' : ''
                }`}
                title="Amei"
              >
                <Heart className={`w-4 h-4 ${userReaction === 'love' ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="text-xs">{reactions.loves}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('prayer')}
                className={`text-white hover:bg-white/20 gap-1.5 ${
                  userReaction === 'prayer' ? 'bg-white/20' : ''
                }`}
                title="Oração"
              >
                <HandHeart className={`w-4 h-4 ${userReaction === 'prayer' ? 'fill-blue-500 text-blue-500' : ''}`} />
                <span className="text-xs">{reactions.prayers}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('amen')}
                className={`text-white hover:bg-white/20 gap-1.5 ${
                  userReaction === 'amen' ? 'bg-white/20' : ''
                }`}
                title="Amém"
              >
                <span className={`text-base ${userReaction === 'amen' ? 'scale-125' : ''}`}>🙌</span>
                <span className="text-xs">{reactions.amens}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('hallelujah')}
                className={`text-white hover:bg-white/20 gap-1.5 ${
                  userReaction === 'hallelujah' ? 'bg-white/20' : ''
                }`}
                title="Aleluia"
              >
                <Bird className={`w-4 h-4 ${userReaction === 'hallelujah' ? 'fill-white text-white' : ''}`} />
                <span className="text-xs">{reactions.hallelujahs}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('glory')}
                className={`text-white hover:bg-white/20 gap-1.5 ${
                  userReaction === 'glory' ? 'bg-white/20' : ''
                }`}
                title="Glória a Deus"
              >
                <Sparkles className={`w-4 h-4 ${userReaction === 'glory' ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                <span className="text-xs">{reactions.glories}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('fire')}
                className={`text-white hover:bg-white/20 gap-1.5 ${
                  userReaction === 'fire' ? 'bg-white/20' : ''
                }`}
                title="Aviva Senhor"
              >
                <Flame className={`w-4 h-4 ${userReaction === 'fire' ? 'fill-orange-500 text-orange-500' : ''}`} />
                <span className="text-xs">{reactions.fires}</span>
              </Button>
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between">
              <div className="text-white/70 text-sm">
                {currentIndex + 1} / {photos.length}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Share Buttons */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShareWhatsApp}
                  className="text-white hover:bg-white/20"
                  title="Compartilhar no WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleShareFacebook}
                  className="text-white hover:bg-white/20"
                  title="Compartilhar no Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyLink}
                  className="text-white hover:bg-white/20"
                  title="Copiar link"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
                
                {/* Download Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownload}
                  className="text-white hover:bg-white/20"
                  title="Baixar foto"
                >
                  <Download className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}