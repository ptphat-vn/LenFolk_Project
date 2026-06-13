export type Notification = {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: "lesson" | "badge" | "subscription" | "streak" | "moderation" | "system";
  isRead: boolean;
  data: any;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
};
