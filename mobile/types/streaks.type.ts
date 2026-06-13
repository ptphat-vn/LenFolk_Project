export type Streak = {
  _id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate: string | null;
  createdAt: string;
  updatedAt: string;
};
