/** Schema Streak trả về từ API */
export interface Streak {
  _id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  lastActiveDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để khởi tạo streak (POST /streaks)
 *  userId được inject từ JWT — không cần gửi lên
 */
export interface CreateStreakInput {
  currentStreak?: number;   // tối thiểu 0
  longestStreak?: number;   // tối thiểu 0
  totalActiveDays?: number; // tối thiểu 0
  lastActiveDate?: string;
}

/** Body dùng để cập nhật streak (PATCH /streaks/:id) */
export interface UpdateStreakInput {
  currentStreak?: number;
  longestStreak?: number;
  totalActiveDays?: number;
  lastActiveDate?: string;
}
