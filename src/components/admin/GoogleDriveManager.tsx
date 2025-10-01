import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Cloud, Save, AlertCircle, ExternalLink } from 'lucide-react';

export function GoogleDriveManager() {
  const [scriptUrl, setScriptUrl] = useState('');
  const [folderId, setFolderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    loadSettings();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar autenticado');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .eq('role', 'admin')
        .single();

      if (profile) {
        setIsAdmin(true);
      } else {
        toast.error('Acesso negado. Apenas administradores podem acessar esta função.');
      }
    } catch (error) {
      console.error('Erro ao verificar status de admin:', error);
      toast.error('Erro ao verificar permissões');
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', ['google_drive_script_url', 'google_drive_folder_id']);

      if (error) throw error;

      const urlSetting = data?.find(s => s.setting_key === 'google_drive_script_url');
      const folderSetting = data?.find(s => s.setting_key === 'google_drive_folder_id');

      if (urlSetting) setScriptUrl(urlSetting.setting_value || '');
      if (folderSetting) setFolderId(folderSetting.setting_value || '');
      
      if (urlSetting && folderSetting) {
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = async () => {
    if (!scriptUrl.trim()) {
      toast.error('Informe a URL do Apps Script');
      return;
    }

    try {
      setLoading(true);

      const settings = [
        {
          setting_key: 'google_drive_script_url',
          setting_value: scriptUrl,
          setting_type: 'text',
          category: 'integrations',
          display_name: 'URL do Google Apps Script'
        },
        {
          setting_key: 'google_drive_folder_id',
          setting_value: folderId,
          setting_type: 'text',
          category: 'integrations',
          display_name: 'ID da Pasta Principal'
        }
      ];

      for (const setting of settings) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(setting, { onConflict: 'setting_key' });

        if (error) throw error;
      }

      setIsSaved(true);
      toast.success('Configurações salvas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
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

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Configuração do Google Apps Script
          </CardTitle>
          <CardDescription>
            Configure a integração com Google Drive usando Apps Script
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="font-medium">Instruções de Configuração:</p>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Acesse <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                    Google Apps Script <ExternalLink className="w-3 h-3" />
                  </a></li>
                  <li>Crie um novo projeto e cole o código do script fornecido pelo ChatGPT</li>
                  <li>No código, altere o <code className="bg-background px-1 py-0.5 rounded">FOLDER_ID</code> para o ID da sua pasta principal do Drive</li>
                  <li>Ative os "Serviços Avançados" → Drive API (v2 ou v3)</li>
                  <li>Implante como "Web app" com acesso "Qualquer pessoa"</li>
                  <li>Copie a URL gerada e cole abaixo</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scriptUrl">URL do Apps Script *</Label>
              <Input
                id="scriptUrl"
                type="url"
                value={scriptUrl}
                onChange={(e) => {
                  setScriptUrl(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="https://script.google.com/macros/s/AKfycby.../exec"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Cole a URL da web app do seu Apps Script
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="folderId">ID da Pasta Principal (opcional)</Label>
              <Input
                id="folderId"
                value={folderId}
                onChange={(e) => {
                  setFolderId(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="18nmGpvjaUX_9MyRP1YcZj7rg5yABVHBL"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Referência do FOLDER_ID configurado no script (para documentação)
              </p>
            </div>

            <Button
              onClick={saveSettings}
              disabled={loading || !scriptUrl.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : isSaved ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Configuração Salva ✓
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configuração
                </>
              )}
            </Button>
          </div>

          {isSaved && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✓ Configuração salva! A galeria agora está conectada ao seu Google Drive.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Organize suas fotos em subpastas no Drive e elas aparecerão como álbuns na galeria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
