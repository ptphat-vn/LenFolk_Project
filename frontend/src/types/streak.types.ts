// Auto-generated from Swagger

export interface Streak {
  _id?: string;
  userId?: string;
  currentStreak?: number;
  longestStreak?: number;
  totalActiveDays?: number;
  lastActiveDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStreakInput {
  userId: string;
  currentStreak?: number;
  longestStreak?: number;
  totalActiveDays?: number;
  lastActiveDate?: string;
}

