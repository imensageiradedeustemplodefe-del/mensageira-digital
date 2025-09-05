import { useState } from 'react';
import { useGalleryAlbums, GalleryAlbum } from '@/hooks/useGalleryAlbums';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, FolderOpen, Plus, Edit2, Trash2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export const AlbumsManager = () => {
  const { albums, loading, createAlbum, updateAlbum, deleteAlbum } = useGalleryAlbums();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cover_photo_url: '',
    event_date: '',
    is_published: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      cover_photo_url: '',
      event_date: '',
      is_published: false
    });
    setEditingAlbum(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (album: GalleryAlbum) => {
    setEditingAlbum(album);
    setFormData({
      name: album.name,
      description: album.description || '',
      cover_photo_url: album.cover_photo_url || '',
      event_date: album.event_date ? album.event_date.split('T')[0] : '',
      is_published: album.is_published
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const albumData = {
        name: formData.name,
        description: formData.description || null,
        cover_photo_url: formData.cover_photo_url || null,
        event_date: formData.event_date || null,
        is_published: formData.is_published
      };

      if (editingAlbum) {
        await updateAlbum(editingAlbum.id, albumData);
        toast.success('Álbum atualizado com sucesso!');
      } else {
        await createAlbum(albumData);
        toast.success('Álbum criado com sucesso!');
      }

      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar álbum. Tente novamente.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja deletar o álbum "${name}"? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteAlbum(id);
        toast.success('Álbum deletado com sucesso!');
      } catch (error) {
        toast.error('Erro ao deletar álbum. Tente novamente.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
        <span className="text-muted-foreground">Carregando álbuns...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Álbuns</h2>
          <p className="text-muted-foreground">
            Organize as fotos da galeria em álbuns temáticos
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Álbum
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAlbum ? 'Editar Álbum' : 'Novo Álbum'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Álbum *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="ex: Culto de Domingo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Descrição do evento ou álbum"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_date">Data do Evento</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_photo_url">URL da Foto de Capa</Label>
                <Input
                  id="cover_photo_url"
                  value={formData.cover_photo_url}
                  onChange={(e) => setFormData({...formData, cover_photo_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({...formData, is_published: checked})}
                />
                <Label htmlFor="is_published">Publicar álbum</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingAlbum ? 'Atualizar' : 'Criar'} Álbum
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {albums.map((album) => (
          <Card key={album.id} className="hover:shadow-lg transition-all duration-300">
            {album.cover_photo_url ? (
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img 
                  src={album.cover_photo_url} 
                  alt={album.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{album.name}</CardTitle>
                <Badge variant={album.is_published ? "default" : "secondary"}>
                  {album.is_published ? 'Publicado' : 'Rascunho'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {album.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {album.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {album.event_date && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(album.event_date)}
                  </div>
                )}
                <div className="flex items-center">
                  <ImageIcon className="w-4 h-4 mr-1" />
                  {album.photos?.length || 0} fotos
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleEdit(album)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  onClick={() => handleDelete(album.id, album.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {albums.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-2">
            Nenhum álbum criado ainda
          </p>
          <p className="text-muted-foreground">
            Crie seu primeiro álbum para organizar as fotos por evento
          </p>
        </div>
      )}
    </div>
  );
};