export type Badge = {
  _id: string;
  name: string;
  icon: string;
  description: string | null;
  type: "streak" | "completion" | "practice" | "achievement";
  conditionKey: string;
  conditionValue: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserBadge = {
  _id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
};
