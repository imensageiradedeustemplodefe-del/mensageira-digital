export type NotificationType = 
  | 'daily_verse'
  | 'new_photos'
  | 'live_stream'
  | 'new_testimony'
  | 'new_prayer'
  | 'event_today'
  | 'live_starting_soon';

export interface InAppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  url: string;
  timestamp: string;
  isRead: boolean;
}

export interface NotificationData {
  id: string;
  type: NotificationType;
  created_at: string;
  data?: Record<string, any>;
}
