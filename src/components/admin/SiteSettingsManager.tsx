import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings, Church, Phone, Users, Calendar, Video, Info } from 'lucide-react';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  category: string;
  display_name: string;
  description: string | null;
}

interface SettingsByCategory {
  [category: string]: SiteSetting[];
}

export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SettingsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('category, setting_key');

      if (error) throw error;

      // Group settings by category
      const grouped = (data || []).reduce((acc: SettingsByCategory, setting) => {
        if (!acc[setting.category]) {
          acc[setting.category] = [];
        }
        acc[setting.category].push(setting);
        return acc;
      }, {});

      setSettings(grouped);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (settingKey: string, value: string) => {
    setSettings(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(category => {
        updated[category] = updated[category].map(setting =>
          setting.setting_key === settingKey
            ? { ...setting, setting_value: value }
            : setting
        );
      });
      return updated;
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const allSettings = Object.values(settings).flat();
      
      for (const setting of allSettings) {
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: setting.setting_value })
          .eq('setting_key', setting.setting_key);

        if (error) throw error;
      }

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const renderFormField = (setting: SiteSetting) => {
    const { setting_key, setting_value, setting_type, display_name, description } = setting;

    const commonProps = {
      id: setting_key,
      value: setting_value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleSettingChange(setting_key, e.target.value),
    };

    switch (setting_type) {
      case 'textarea':
        return <Textarea {...commonProps} rows={3} />;
      case 'email':
        return <Input {...commonProps} type="email" />;
      case 'url':
        return <Input {...commonProps} type="url" />;
      case 'time':
        return <Input {...commonProps} type="time" />;
      case 'number':
        return <Input {...commonProps} type="number" />;
      default:
        return <Input {...commonProps} type="text" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return Church;
      case 'contact': return Phone;
      case 'social': return Users;
      case 'schedule': return Calendar;
      case 'live': return Video;
      case 'about': return Info;
      default: return Settings;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'general': return 'Informações Gerais';
      case 'contact': return 'Contato';
      case 'social': return 'Redes Sociais';
      case 'schedule': return 'Horários de Culto';
      case 'live': return 'Transmissão ao Vivo';
      case 'about': return 'Sobre a Igreja';
      default: return 'Configurações';
    }
  };

  if (loading) {
    return <div className="p-6">Carregando configurações...</div>;
  }

  const categories = Object.keys(settings);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Configurações do Site</h2>
        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <Tabs defaultValue={categories[0]} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category);
            return (
              <TabsTrigger key={category} value={category} className="flex items-center text-xs">
                <Icon className="w-3 h-3 mr-1" />
                {getCategoryTitle(category)}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {React.createElement(getCategoryIcon(category), { className: "w-5 h-5 mr-2" })}
                  {getCategoryTitle(category)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings[category]?.map((setting) => (
                  <div key={setting.setting_key} className="space-y-2">
                    <Label htmlFor={setting.setting_key} className="text-sm font-medium">
                      {setting.display_name}
                    </Label>
                    {renderFormField(setting)}
                    {setting.description && (
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}