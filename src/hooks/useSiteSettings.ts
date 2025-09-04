import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSetting {
  setting_key: string;
  setting_value: string | null;
}

interface SiteSettings {
  // General
  church_name: string;
  church_slogan: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
  
  // Contact
  church_address: string;
  church_phone: string;
  church_email: string;
  contact_email_secretary: string;
  contact_address_full: string;
  
  // Social
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  whatsapp_number: string;
  
  // Schedule
  sunday_service_time: string;
  wednesday_service_time: string;
  friday_service_time: string;
  
  // Live
  live_youtube_id: string;
  live_facebook_url: string;
  
  // About
  church_description: string;
  pastor_name: string;
  church_founded_year: string;
  pastor_principal_name: string;
  pastor_principal_description: string;
  pastora_name: string;
  pastora_description: string;
  pastor_auxiliar_name: string;
  pastor_auxiliar_description: string;
}

const defaultSettings: SiteSettings = {
  church_name: 'Igreja Mensageira de Deus - Templo de Fé',
  church_slogan: 'Proclamando a Palavra de Deus com Fé e Amor',
  hero_title: 'Bem-vindos à Mensageira de Deus',
  hero_subtitle: 'Templo de Fé',
  hero_description: 'Uma igreja comprometida com a Palavra de Deus, onde vidas são transformadas e famílias são edificadas no amor de Cristo.',
  church_address: '',
  church_phone: '',
  church_email: '',
  contact_email_secretary: '',
  contact_address_full: '',
  facebook_url: '',
  instagram_url: '',
  youtube_url: '',
  whatsapp_number: '',
  sunday_service_time: '10:00',
  wednesday_service_time: '19:30',
  friday_service_time: '19:30',
  live_youtube_id: '',
  live_facebook_url: '',
  church_description: '',
  pastor_name: '',
  church_founded_year: '',
  pastor_principal_name: '',
  pastor_principal_description: '',
  pastora_name: '',
  pastora_description: '',
  pastor_auxiliar_name: '',
  pastor_auxiliar_description: '',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value');

      if (error) {
        console.error('Erro ao buscar configurações:', error);
        return;
      }

      if (data) {
        const settingsMap = data.reduce((acc: Partial<SiteSettings>, setting: SiteSetting) => {
          if (setting.setting_value) {
            acc[setting.setting_key as keyof SiteSettings] = setting.setting_value;
          }
          return acc;
        }, {});

        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refresh: fetchSettings };
}