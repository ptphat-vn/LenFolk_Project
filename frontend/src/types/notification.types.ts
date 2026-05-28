// Auto-generated from Swagger

export interface Notification {
  _id?: string;
  userId?: string;
  title?: string;
  body?: string;
  type?: string;
  isRead?: boolean;
  data?: object;
  readAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNotificationInput {
  userId: string;
  title: string;
  body: string;
  type: string;
  isRead?: boolean;
  data?: object;
}

