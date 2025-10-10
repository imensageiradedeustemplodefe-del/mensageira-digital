import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InAppNotification, NotificationType } from '@/types/notifications';
import { toast } from 'sonner';

const STORAGE_KEY = 'read_notifications';
const NOTIFICATION_LIMIT = 20;

interface NotificationContextType {
  notifications: InAppNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

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
    },
    event_today: {
      title: '⛪ Hoje tem Culto!',
      icon: '⛪',
      url: '/eventos'
    },
    live_starting_soon: {
      title: '🔴 Live começando em breve!',
      icon: '🔴',
      url: '/live'
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

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(getReadNotifications);

  const fetchNotifications = useCallback(async () => {
    try {
      const readIds = getReadNotifications();
      const allNotifications: InAppNotification[] = [];
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Buscar eventos de hoje
      const { data: todayEvents } = await supabase
        .from('events')
        .select('id, title, event_date, category')
        .eq('is_published', true)
        .gte('event_date', `${today}T00:00:00`)
        .lte('event_date', `${today}T23:59:59`)
        .order('event_date', { ascending: true });

      if (todayEvents && todayEvents.length > 0) {
        todayEvents.forEach(event => {
          const config = getNotificationConfig('event_today');
          const eventDate = event.event_date.split('T')[0];
          const notificationId = `event_today_${event.id}_${eventDate}`;
          
          allNotifications.push({
            id: notificationId,
            type: 'event_today',
            title: config.title,
            message: event.category === 'culto' 
              ? `Hoje tem culto às ${new Date(event.event_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}!`
              : `${event.title} - Hoje às ${new Date(event.event_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
            icon: config.icon,
            url: config.url,
            timestamp: event.event_date,
            isRead: readIds.has(notificationId)
          });
        });
      }

      // Buscar lives
      const { data: upcomingStreams } = await supabase
        .from('live_streams')
        .select('id, title, scheduled_at, is_live')
        .eq('is_active', true)
        .or(`is_live.eq.true,and(scheduled_at.gte.${now.toISOString()},scheduled_at.lte.${twoHoursFromNow.toISOString()})`)
        .order('scheduled_at', { ascending: true })
        .limit(3);

      if (upcomingStreams && upcomingStreams.length > 0) {
        upcomingStreams.forEach(stream => {
          const config = getNotificationConfig('live_starting_soon');
          const notificationId = `live_soon_${stream.id}`;
          
          if (stream.is_live) {
            allNotifications.push({
              id: notificationId,
              type: 'live_starting_soon',
              title: '🔴 Transmissão AO VIVO agora!',
              message: `${stream.title} - Assista agora!`,
              icon: config.icon,
              url: config.url,
              timestamp: stream.scheduled_at || new Date().toISOString(),
              isRead: readIds.has(notificationId)
            });
          } else if (stream.scheduled_at) {
            const scheduledTime = new Date(stream.scheduled_at);
            const minutesUntil = Math.round((scheduledTime.getTime() - now.getTime()) / (1000 * 60));
            
            allNotifications.push({
              id: notificationId,
              type: 'live_starting_soon',
              title: config.title,
              message: `${stream.title} - Começa em ${minutesUntil} minutos!`,
              icon: config.icon,
              url: config.url,
              timestamp: stream.scheduled_at,
              isRead: readIds.has(notificationId)
            });
          }
        });
      }

      // Buscar versos diários
      const { data: verses } = await supabase
        .from('daily_verses')
        .select('id, created_at, verse_text')
        .eq('is_active', true)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (verses) {
        verses.forEach(verse => {
          const config = getNotificationConfig('daily_verse');
          allNotifications.push({
            id: `verse_${verse.id}`,
            type: 'daily_verse',
            title: config.title,
            message: 'Uma nova palavra de inspiração está disponível!',
            icon: config.icon,
            url: config.url,
            timestamp: verse.created_at,
            isRead: readIds.has(`verse_${verse.id}`)
          });
        });
      }

      // Buscar novos álbuns
      const { data: albums } = await supabase
        .from('gallery_albums')
        .select('id, created_at, name')
        .eq('is_published', true)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (albums) {
        albums.forEach(album => {
          const config = getNotificationConfig('new_photos');
          allNotifications.push({
            id: `album_${album.id}`,
            type: 'new_photos',
            title: config.title,
            message: `Novo álbum: ${album.name}`,
            icon: config.icon,
            url: config.url,
            timestamp: album.created_at,
            isRead: readIds.has(`album_${album.id}`)
          });
        });
      }

      // Buscar testemunhos
      const { data: testimonies } = await supabase
        .from('testimonies')
        .select('id, created_at, name')
        .eq('is_approved', true)
        .gte('created_at', sevenDaysAgo.toISOString())
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

      // Buscar orações
      const { data: prayers } = await supabase
        .from('public_prayer_requests')
        .select('id, created_at, display_name')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (prayers) {
        prayers.forEach(prayer => {
          const config = getNotificationConfig('new_prayer');
          allNotifications.push({
            id: `prayer_${prayer.id}`,
            type: 'new_prayer',
            title: config.title,
            message: `Novo pedido de ${prayer.display_name}`,
            icon: config.icon,
            url: config.url,
            timestamp: prayer.created_at,
            isRead: readIds.has(`prayer_${prayer.id}`)
          });
        });
      }

      const uniqueNotifications = Array.from(
        new Map(allNotifications.map(item => [item.id, item])).values()
      );

      uniqueNotifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(uniqueNotifications.slice(0, NOTIFICATION_LIMIT));
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
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'daily_verses' }, (payload) => {
          toast.success('📖 Nova Palavra do Dia disponível!');
          fetchNotifications();
        })
        .subscribe(),
      
      supabase
        .channel('albums_changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gallery_albums' }, (payload) => {
          toast.success('📸 Novas fotos adicionadas!');
          fetchNotifications();
        })
        .subscribe(),
      
      supabase
        .channel('streams_changes')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'live_streams' }, (payload: any) => {
          if (payload.new?.is_live && !payload.old?.is_live) {
            toast.success('🔴 Transmissão ao vivo começou!');
            fetchNotifications();
          }
        })
        .subscribe(),
      
      supabase
        .channel('testimonies_changes')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'testimonies' }, (payload: any) => {
          if (payload.new?.is_approved && !payload.old?.is_approved) {
            toast.success('✨ Novo testemunho aprovado!');
            fetchNotifications();
          }
        })
        .subscribe(),
      
      supabase
        .channel('prayers_changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'public_prayer_requests' }, () => {
          toast.success('🙏 Novo pedido de oração!');
          fetchNotifications();
        })
        .subscribe(),
      
      supabase
        .channel('events_changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, () => {
          toast.success('⛪ Novo evento adicionado!');
          fetchNotifications();
        })
        .subscribe(),
    ];

    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refresh: fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};