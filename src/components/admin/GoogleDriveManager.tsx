import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Cloud, 
  FolderOpen, 
  Image, 
  Download, 
  RefreshCw, 
  Eye, 
  Settings,
  Upload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DriveFolder {
  id: string;
  name: string;
  modifiedTime: string;
}

interface DrivePhoto {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
  thumbnailLink?: string;
}

export function GoogleDriveManager() {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<DriveFolder | null>(null);
  const [photos, setPhotos] = useState<DrivePhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [driveConnected, setDriveConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Import form state
  const [importData, setImportData] = useState({
    albumName: '',
    albumDescription: ''
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .eq('role', 'admin')
        .single();

      if (profile) {
        setIsAdmin(true);
        await checkDriveConnection();
      } else {
        toast.error('Acesso negado. Apenas administradores podem acessar esta função.');
      }
    } catch (error) {
      console.error('Erro ao verificar status de admin:', error);
      toast.error('Erro ao verificar permissões');
    }
  };

  const checkDriveConnection = async () => {
    try {
      setLoading(true);
      console.log('Iniciando teste de conexão Google Drive...');
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Você precisa estar autenticado como admin para usar esta função');
      }
      
      const { data, error } = await supabase.functions.invoke('google-drive-sync', {
        body: { action: 'list_folders' }
      });

      console.log('Resposta da função:', { data, error });

      if (error) {
        console.error('Erro na função:', error);
        throw error;
      }
      
      setDriveConnected(true);
      setFolders(data.folders || []);
      toast.success('Conectado ao Google Drive!');
    } catch (error) {
      console.error('Erro ao conectar com Google Drive:', error);
      setDriveConnected(false);
      
      // Mensagem de erro mais específica
      const errorMessage = error?.message || 'Erro desconhecido';
      if (errorMessage.includes('Failed to get Google Drive access token')) {
        toast.error('Erro de autenticação. Verifique se o refresh token ainda é válido.');
      } else {
        toast.error(`Erro ao conectar: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFolderPhotos = async (folder: DriveFolder) => {
    try {
      setLoading(true);
      setSelectedFolder(folder);

      const { data, error } = await supabase.functions.invoke('google-drive-sync', {
        body: { 
          action: 'list_photos',
          folderId: folder.id 
        }
      });

      if (error) throw error;
      
      setPhotos(data.photos);
      setImportData({ 
        albumName: folder.name,
        albumDescription: `Fotos do álbum "${folder.name}" importadas do Google Drive`
      });
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
      toast.error('Erro ao carregar fotos da pasta');
    } finally {
      setLoading(false);
    }
  };

  const importAlbum = async () => {
    if (!selectedFolder) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('google-drive-sync', {
        body: { 
          action: 'import_album',
          folderId: selectedFolder.id,
          albumName: importData.albumName,
          albumDescription: importData.albumDescription
        }
      });

      if (error) throw error;

      toast.success(
        `Álbum importado com sucesso! ${data.imported_photos}/${data.total_photos} fotos importadas`
      );
      
      setIsImportDialogOpen(false);
      setSelectedFolder(null);
      setPhotos([]);
    } catch (error) {
      console.error('Erro ao importar álbum:', error);
      toast.error('Erro ao importar álbum do Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const syncPhotos = async () => {
    if (!selectedFolder) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('google-drive-sync', {
        body: { 
          action: 'sync_photos',
          folderId: selectedFolder.id
        }
      });

      if (error) throw error;

      const stats = data.stats;
      toast.success(
        `Sincronização concluída! ${stats.new_photos} novas fotos, ${stats.updated_photos} atualizadas`
      );
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      toast.error('Erro ao sincronizar fotos');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Integração com Google Drive
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
            <p className="text-muted-foreground mb-6">
              Apenas administradores podem acessar a integração com Google Drive.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!driveConnected) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              Integração com Google Drive
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Google Drive não conectado</h3>
            <p className="text-muted-foreground mb-6">
              Configure as credenciais do Google Drive para importar suas fotos automaticamente.
            </p>
            <Button onClick={checkDriveConnection} disabled={loading}>
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Settings className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Conectando...' : 'Tentar Conectar'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Cloud className="w-6 h-6 text-primary" />
            Google Drive
          </h2>
          <p className="text-muted-foreground">
            Importe fotos diretamente das suas pastas do Google Drive
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Conectado
          </Badge>
          <Button variant="outline" onClick={checkDriveConnection} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Folders List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Pastas do Google Drive
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !selectedFolder ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFolder?.id === folder.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => loadFolderPhotos(folder)}
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-primary" />
                      <span className="font-medium">{folder.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Modificado: {new Date(folder.modifiedTime).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photos Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              {selectedFolder ? `Fotos - ${selectedFolder.name}` : 'Selecione uma pasta'}
            </CardTitle>
            {selectedFolder && (
              <div className="flex gap-2">
                <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Importar Álbum
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Importar Álbum do Google Drive</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="albumName">Nome do Álbum</Label>
                        <Input
                          id="albumName"
                          value={importData.albumName}
                          onChange={(e) => setImportData({ ...importData, albumName: e.target.value })}
                          placeholder="Nome do álbum"
                        />
                      </div>
                      <div>
                        <Label htmlFor="albumDescription">Descrição</Label>
                        <Textarea
                          id="albumDescription"
                          value={importData.albumDescription}
                          onChange={(e) => setImportData({ ...importData, albumDescription: e.target.value })}
                          placeholder="Descrição do álbum"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={importAlbum} disabled={loading} className="flex-1">
                          {loading ? (
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 mr-2" />
                          )}
                          {loading ? 'Importando...' : 'Importar'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsImportDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" size="sm" onClick={syncPhotos} disabled={loading}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sincronizar
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {!selectedFolder ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma pasta para visualizar as fotos</p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma foto encontrada nesta pasta</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary">
                    {photos.length} fotos encontradas
                  </Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                  {photos.slice(0, 12).map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        {photo.thumbnailLink ? (
                          <img
                            src={photo.thumbnailLink}
                            alt={photo.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button size="sm" variant="secondary" asChild>
                          <a href={photo.webViewLink} target="_blank" rel="noopener noreferrer">
                            <Eye className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {photos.length > 12 && (
                  <p className="text-xs text-center text-muted-foreground">
                    Mostrando 12 de {photos.length} fotos
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}