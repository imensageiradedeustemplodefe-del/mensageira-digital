// Este hook agora usa o contexto centralizado
import { useNotifications } from '@/contexts/NotificationContext';

export const useInAppNotifications = () => {
  return useNotifications();
};
