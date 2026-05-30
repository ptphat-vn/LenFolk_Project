export type NotificationType = 'lesson' | 'badge' | 'subscription' | 'streak' | 'moderation' | 'system';

/** Schema Notification trả về từ API */
export interface Notification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  data?: Record<string, unknown>;
  readAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để Admin gửi thông báo (POST /notifications) */
export interface CreateNotificationInput {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead?: boolean;
  data?: Record<string, unknown>;
}

/** Body dùng để đánh dấu đã đọc (PATCH /notifications/:id) */
export interface UpdateNotificationInput {
  isRead?: boolean;
  readAt?: string;
}

/** Query params cho GET /notifications */
export interface GetNotificationsQuery {
  isRead?: boolean;
}
