import api from './ApiClient';
import { PaginatedResponse } from './BurialService';

export interface AppNotification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: {
    pending_operation_id: number;
    entity_type: string;
    entity_id: number | null;
    operation_type: string;
    requested_by_id: number;
    requested_by_name: string;
    title: string;
    message: string;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export const getNotifications = async (params?: {
  per_page?: number;
  page?: number;
}): Promise<PaginatedResponse<AppNotification>> => {
  const res = await api.get('/api/notifications', { params });
  return res.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const res = await api.get('/api/notifications/unread-count');
  return res.data.count;
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
  await api.post(`/api/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.post('/api/notifications/read-all');
};
