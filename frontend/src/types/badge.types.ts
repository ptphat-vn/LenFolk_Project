export type BadgeType = 'streak' | 'completion' | 'practice' | 'achievement';

/** Schema Badge trả về từ API */
export interface Badge {
  _id: string;
  name: string;
  icon: string;
  description?: string;
  type: BadgeType;
  conditionKey: string;
  conditionValue: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để tạo / cập nhật badge (Admin only) */
export interface CreateBadgeInput {
  name: string;
  icon: string;
  description?: string;
  type: BadgeType;
  conditionKey: string;
  conditionValue: number;  // tối thiểu 0
  isActive?: boolean;
}
