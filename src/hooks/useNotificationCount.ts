import { useInAppNotifications } from './useInAppNotifications';

export const useNotificationCount = () => {
  const { unreadCount, loading } = useInAppNotifications();

  return { count: unreadCount, isLoading: loading };
};