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
    if (!stored) return new Set();
    
    const data = JSON.parse(stored);
    const readIds = new Set<string>(data.ids || []);
    const lastCleanup = data.lastCleanup || 0;
    
    // Limpar notificações lidas antigas (mais de 7 dias)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    if (lastCleanup < sevenDaysAgo) {
      const today = new Date().toISOString().split('T')[0];
      const cleanedIds = Array.from(readIds).filter(id => {
        // Manter notificações lidas de hoje
        if (id.includes(today)) return true;
        // Remover notificações antigas
        return false;
      });
      return new Set(cleanedIds);
    }
    
    return readIds;
  } catch {
    return new Set();
  }
};

const saveReadNotifications = (readIds: Set<string>) => {
  try {
    const data = {
      ids: Array.from(readIds),
      lastCleanup: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
      setLoading(true);
      const readIds = getReadNotifications();
      const allNotifications: InAppNotification[] = [];
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Buscar eventos de hoje
      const { data: todayEvents, error: eventsError } = await supabase
        .from('events')
        .select('id, title, event_date, category')
        .eq('is_published', true)
        .gte('event_date', `${today}T00:00:00`)
        .lte('event_date', `${today}T23:59:59`)
        .order('event_date', { ascending: true });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
      } else if (todayEvents && todayEvents.length > 0) {
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

      // Buscar transmissões ao vivo e próximas
      const { data: upcomingStreams, error: streamsError } = await supabase
        .from('live_streams')
        .select('id, title, scheduled_at, is_live, is_active')
        .eq('is_active', true)
        .order('scheduled_at', { ascending: true });

      if (streamsError) {
        console.error('Error fetching streams:', streamsError);
      } else if (upcomingStreams && upcomingStreams.length > 0) {
        upcomingStreams.forEach(stream => {
          // Transmissão ao vivo agora
          if (stream.is_live) {
            const config = getNotificationConfig('live_stream');
            const notificationId = `live_now_${stream.id}`;
            
            allNotifications.push({
              id: notificationId,
              type: 'live_stream',
              title: '🔴 AO VIVO AGORA!',
              message: `${stream.title} - Assista agora!`,
              icon: config.icon,
              url: config.url,
              timestamp: stream.scheduled_at || now.toISOString(),
              isRead: readIds.has(notificationId)
            });
          }
          // Transmissão começando em breve (próximas 2 horas)
          else if (stream.scheduled_at) {
            const scheduledTime = new Date(stream.scheduled_at);
            const minutesUntil = Math.round((scheduledTime.getTime() - now.getTime()) / (1000 * 60));
            
            // Mostrar apenas se for nas próximas 2 horas (120 minutos)
            if (minutesUntil > 0 && minutesUntil <= 120) {
              const config = getNotificationConfig('live_starting_soon');
              const notificationId = `live_soon_${stream.id}_${today}`;
              
              let timeMessage = '';
              if (minutesUntil < 60) {
                timeMessage = `Começa em ${minutesUntil} minutos!`;
              } else {
                const hours = Math.floor(minutesUntil / 60);
                timeMessage = `Começa em ${hours}h`;
              }
              
              allNotifications.push({
                id: notificationId,
                type: 'live_starting_soon',
                title: '🔴 Live começando em breve!',
                message: `${stream.title} - ${timeMessage}`,
                icon: config.icon,
                url: config.url,
                timestamp: stream.scheduled_at,
                isRead: readIds.has(notificationId)
              });
            }
          }
        });
      }

      // Criar notificação diária do versículo do dia (sempre no topo e não lida)
      const { data: allVerses, error: versesError } = await supabase
        .from('daily_verses')
        .select('id, verse_text, verse_reference, created_at')
        .eq('is_active', true)
        .order('created_at');

      if (versesError) {
        console.error('Error fetching verses:', versesError);
      } else if (allVerses && allVerses.length > 0) {
        // Criar uma notificação única para hoje
        const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const seed = dayOfYear + (now.getFullYear() * 365);
        const verseIndex = seed % allVerses.length;
        const todayVerse = allVerses[verseIndex];
        
        const config = getNotificationConfig('daily_verse');
        const todayDate = now.toISOString().split('T')[0];
        const notificationId = `daily_verse_${todayDate}`;
        
        // Criar notificação com timestamp atual para aparecer no topo
        // A palavra do dia sempre aparece como não lida
        allNotifications.push({
          id: notificationId,
          type: 'daily_verse',
          title: config.title,
          message: `${todayVerse.verse_reference} - Confira a palavra de hoje!`,
          icon: config.icon,
          url: config.url,
          timestamp: now.toISOString(),
          isRead: false // Sempre não lida para garantir que apareça
        });
      }

      // Buscar novos álbuns
      const { data: albums, error: albumsError } = await supabase
        .from('gallery_albums')
        .select('id, created_at, name')
        .eq('is_published', true)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (albumsError) {
        console.error('Error fetching albums:', albumsError);
      } else if (albums) {
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
      const { data: testimonies, error: testimoniesError } = await supabase
        .from('testimonies')
        .select('id, created_at, name')
        .eq('is_approved', true)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (testimoniesError) {
        console.error('Error fetching testimonies:', testimoniesError);
      } else if (testimonies) {
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
      const { data: prayers, error: prayersError } = await supabase
        .from('public_prayer_requests')
        .select('id, created_at, display_name')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (prayersError) {
        console.error('Error fetching prayers:', prayersError);
      } else if (prayers) {
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

      // Buscar notificações personalizadas
      const { data: customNotifs, error: customError } = await supabase
        .from('custom_notifications')
        .select('id, title, message, icon, url, created_at')
        .eq('is_active', true)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (customError) {
        console.error('Error fetching custom notifications:', customError);
      } else if (customNotifs) {
        customNotifs.forEach(notif => {
          allNotifications.push({
            id: `custom_${notif.id}`,
            type: 'daily_verse', // usando tipo genérico
            title: notif.title,
            message: notif.message,
            icon: notif.icon,
            url: notif.url,
            timestamp: notif.created_at,
            isRead: readIds.has(`custom_${notif.id}`)
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
      
      supabase
        .channel('custom_notifications_changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'custom_notifications' }, (payload: any) => {
          if (payload.new?.is_active) {
            toast.success(`${payload.new.icon} ${payload.new.title}`);
            fetchNotifications();
          }
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