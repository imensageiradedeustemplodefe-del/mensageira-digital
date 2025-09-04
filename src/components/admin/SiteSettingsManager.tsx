import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Settings, Phone, Share2, Clock, Info, Tv } from 'lucide-react';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  category: string;
  display_name: string;
  description: string;
}

export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('category, display_name');

      if (error) throw error;
      
      const settingsData = data || [];
      setSettings(settingsData);
      
      // Initialize form data
      const initialFormData: Record<string, string> = {};
      settingsData.forEach(setting => {
        initialFormData[setting.setting_key] = setting.setting_value || '';
      });
      setFormData(initialFormData);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update all settings
      const updates = Object.keys(formData).map(key => ({
        setting_key: key,
        setting_value: formData[key]
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: update.setting_value })
          .eq('setting_key', update.setting_key);

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

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderInput = (setting: SiteSetting) => {
    const value = formData[setting.setting_key] || '';
    
    switch (setting.setting_type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            placeholder={setting.description}
            rows={3}
          />
        );
      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            placeholder={setting.description}
          />
        );
      case 'url':
        return (
          <Input
            type="url"
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            placeholder={setting.description}
          />
        );
      case 'time':
        return (
          <Input
            type="time"
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            placeholder={setting.description}
          />
        );
      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(setting.setting_key, e.target.value)}
            placeholder={setting.description}
          />
        );
    }
  };

  const getSettingsByCategory = (category: string) => {
    return settings.filter(setting => setting.category === category);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return Settings;
      case 'contact': return Phone;
      case 'social': return Share2;
      case 'schedule': return Clock;
      case 'about': return Info;
      case 'live': return Tv;
      default: return Settings;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'general': return 'Informações Gerais';
      case 'contact': return 'Contato';
      case 'social': return 'Redes Sociais';
      case 'schedule': return 'Horários dos Cultos';
      case 'about': return 'Sobre a Igreja';
      case 'live': return 'Transmissão Ao Vivo';
      default: return category;
    }
  };

  if (loading) {
    return <div className="p-6">Carregando configurações...</div>;
  }

  const categories = ['general', 'contact', 'social', 'schedule', 'live', 'about'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configurações do Site</h2>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>Salvando...</>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          {categories.map(category => {
            const Icon = getCategoryIcon(category);
            return (
              <TabsTrigger key={category} value={category} className="flex items-center text-xs">
                <Icon className="w-3 h-3 mr-1" />
                {getCategoryTitle(category)}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {React.createElement(getCategoryIcon(category), { className: "w-5 h-5 mr-2" })}
                  {getCategoryTitle(category)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSettingsByCategory(category).map(setting => (
                  <div key={setting.id} className="space-y-2">
                    <Label htmlFor={setting.setting_key}>
                      {setting.display_name}
                    </Label>
                    {renderInput(setting)}
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