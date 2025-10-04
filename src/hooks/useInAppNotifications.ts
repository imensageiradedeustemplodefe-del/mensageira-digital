import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InAppNotification, NotificationType } from '@/types/notifications';

const STORAGE_KEY = 'read_notifications';
const NOTIFICATION_LIMIT = 20;

// Ícones para cada tipo de notificação
const getNotificationConfig = (type: NotificationType) => {
  const configs = {
    daily_verse: {
      title: '📖 Nova Palavra do Dia',
      icon: '📖',
      url: '/'
    },
    new_photos: {
      title: '📸 Novas Fotos',
      icon: '📸',
      url: '/galeria'
    },
    live_stream: {
      title: '🔴 Transmissão ao Vivo',
      icon: '🔴',
      url: '/live'
    },
    new_testimony: {
      title: '✨ Novo Testemunho',
      icon: '✨',
      url: '/testemunhos'
    },
    new_prayer: {
      title: '🙏 Nova Oração',
      icon: '🙏',
      url: '/oracoes'
    }
  };
  return configs[type];
};

const getReadNotifications = (): Set<string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

const saveReadNotifications = (readIds: Set<string>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(readIds)));
  } catch (error) {
    console.error('Error saving read notifications:', error);
  }
};

export const useInAppNotifications = () => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(getReadNotifications);

  const fetchNotifications = useCallback(async () => {
    try {
      const readIds = getReadNotifications();
      const allNotifications: InAppNotification[] = [];

      // Buscar versos diários (últimos 5)
      const { data: verses } = await supabase
        .from('daily_verses')
        .select('id, created_at, verse_text')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (verses) {
        verses.forEach(verse => {
          const config = getNotificationConfig('daily_verse');
          allNotifications.push({
            id: `verse_${verse.id}`,
            type: 'daily_verse',
            title: config.title,
            message: 'Uma nova palavra de inspiração está disponível para você!',
            icon: config.icon,
            url: config.url,
            timestamp: verse.created_at,
            isRead: readIds.has(`verse_${verse.id}`)
          });
        });
      }

      // Buscar novos álbuns (últimos 5)
      const { data: albums } = await supabase
        .from('gallery_albums')
        .select('id, created_at, name')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (albums) {
        albums.forEach(album => {
          const config = getNotificationConfig('new_photos');
          allNotifications.push({
            id: `album_${album.id}`,
            type: 'new_photos',
            title: config.title,
            message: `Novo álbum de fotos: ${album.name}`,
            icon: config.icon,
            url: config.url,
            timestamp: album.created_at,
            isRead: readIds.has(`album_${album.id}`)
          });
        });
      }

      // Buscar lives recentes (últimas 5)
      const { data: streams } = await supabase
        .from('live_streams')
        .select('id, created_at, title')
        .order('created_at', { ascending: false })
        .limit(5);

      if (streams) {
        streams.forEach(stream => {
          const config = getNotificationConfig('live_stream');
          allNotifications.push({
            id: `stream_${stream.id}`,
            type: 'live_stream',
            title: config.title,
            message: stream.title || 'A transmissão está ao vivo agora!',
            icon: config.icon,
            url: config.url,
            timestamp: stream.created_at,
            isRead: readIds.has(`stream_${stream.id}`)
          });
        });
      }

      // Buscar testemunhos aprovados (últimos 5)
      const { data: testimonies } = await supabase
        .from('testimonies')
        .select('id, created_at, name')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (testimonies) {
        testimonies.forEach(testimony => {
          const config = getNotificationConfig('new_testimony');
          allNotifications.push({
            id: `testimony_${testimony.id}`,
            type: 'new_testimony',
            title: config.title,
            message: `Novo testemunho de ${testimony.name}`,
            icon: config.icon,
            url: config.url,
            timestamp: testimony.created_at,
            isRead: readIds.has(`testimony_${testimony.id}`)
          });
        });
      }

      // Buscar orações públicas aprovadas (últimas 5)
      const { data: prayers } = await supabase
        .from('public_prayer_requests')
        .select('id, created_at, display_name')
        .order('created_at', { ascending: false })
        .limit(5);

      if (prayers) {
        prayers.forEach(prayer => {
          const config = getNotificationConfig('new_prayer');
          allNotifications.push({
            id: `prayer_${prayer.id}`,
            type: 'new_prayer',
            title: config.title,
            message: `Novo pedido de oração de ${prayer.display_name}`,
            icon: config.icon,
            url: config.url,
            timestamp: prayer.created_at,
            isRead: readIds.has(`prayer_${prayer.id}`)
          });
        });
      }

      // Ordenar por data (mais recente primeiro) e limitar
      allNotifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(allNotifications.slice(0, NOTIFICATION_LIMIT));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setReadNotifications(prev => {
      const newSet = new Set(prev);
      newSet.add(notificationId);
      saveReadNotifications(newSet);
      return newSet;
    });

    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadNotifications(allIds);
    saveReadNotifications(allIds);
    
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    fetchNotifications();

    // Configurar realtime para novas notificações
    const channels = [
      supabase
        .channel('daily_verses_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_verses' }, fetchNotifications)
        .subscribe(),
      
      supabase
        .channel('albums_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_albums' }, fetchNotifications)
        .subscribe(),
      
      supabase
        .channel('streams_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'live_streams' }, fetchNotifications)
        .subscribe(),
      
      supabase
        .channel('testimonies_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonies' }, fetchNotifications)
        .subscribe(),
      
      supabase
        .channel('prayers_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'public_prayer_requests' }, fetchNotifications)
        .subscribe(),
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications
  };
};
