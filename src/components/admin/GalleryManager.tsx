import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGalleryAlbums } from '@/hooks/useGalleryAlbums';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Eye, EyeOff, Trash2, Edit, Upload, FolderOpen } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface Photo {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category_id: string;
  album_id?: string;
  event_date: string;
  participants: number;
  is_published: boolean;
  created_at: string;
  gallery_categories?: { name: string };
  gallery_albums?: { name: string };
}

export function GalleryManager() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { albums } = useGalleryAlbums();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category_id: '',
    album_id: '',
    event_date: '',
    participants: 0
  });

  useEffect(() => {
    fetchPhotos();
    fetchCategories();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select(`
          *,
          gallery_categories(name),
          gallery_albums(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Erro ao buscar fotos:', error);
      toast.error('Erro ao carregar fotos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPhoto) {
        const { error } = await supabase
          .from('gallery_photos')
          .update(formData)
          .eq('id', editingPhoto.id);

        if (error) throw error;
        toast.success('Foto atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('gallery_photos')
          .insert([formData]);

        if (error) throw error;
        toast.success('Foto adicionada com sucesso!');
      }

      resetForm();
      fetchPhotos();
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
      toast.error('Erro ao salvar foto');
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('gallery_photos')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(
        !currentStatus ? 'Foto publicada!' : 'Foto despublicada!'
      );
      fetchPhotos();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da foto');
    }
  };

  const deletePhoto = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return;

    try {
      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Foto excluída com sucesso!');
      fetchPhotos();
    } catch (error) {
      console.error('Erro ao excluir foto:', error);
      toast.error('Erro ao excluir foto');
    }
  };

  const startEdit = (photo: Photo) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      description: photo.description || '',
      image_url: photo.image_url,
      category_id: photo.category_id,
      album_id: photo.album_id || '',
      event_date: photo.event_date || '',
      participants: photo.participants
    });
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      category_id: '',
      album_id: '',
      event_date: '',
      participants: 0
    });
    setEditingPhoto(null);
    setIsAddDialogOpen(false);
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciar Galeria</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Foto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPhoto ? 'Editar Foto' : 'Adicionar Nova Foto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="album">Álbum (Opcional)</Label>
                <Select
                  value={formData.album_id}
                  onValueChange={(value) => setFormData({ ...formData, album_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um álbum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem álbum</SelectItem>
                    {albums.map((album) => (
                      <SelectItem key={album.id} value={album.id}>
                        <div className="flex items-center">
                          <FolderOpen className="w-4 h-4 mr-2" />
                          {album.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="event_date">Data do Evento</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="participants">Participantes</Label>
                <Input
                  id="participants"
                  type="number"
                  min="0"
                  value={formData.participants}
                  onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingPhoto ? 'Atualizar' : 'Adicionar'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {photos.map((photo) => (
          <Card key={photo.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{photo.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {photo.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {photo.gallery_categories?.name}
                        </Badge>
                        {photo.gallery_albums?.name && (
                          <Badge variant="secondary">
                            <FolderOpen className="w-3 h-3 mr-1" />
                            {photo.gallery_albums.name}
                          </Badge>
                        )}
                        {photo.event_date && (
                          <Badge variant="outline">
                            {new Date(photo.event_date).toLocaleDateString('pt-BR')}
                          </Badge>
                        )}
                        <Badge variant="outline">
                          {photo.participants} participantes
                        </Badge>
                        <Badge variant={photo.is_published ? "default" : "secondary"}>
                          {photo.is_published ? "Publicada" : "Rascunho"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePublished(photo.id, photo.is_published)}
                      >
                        {photo.is_published ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(photo)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletePhoto(photo.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {photos.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma foto encontrada. Adicione a primeira foto à galeria!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}