export type Currency = 'VND' | 'USD';
export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';
export type UserSubscriptionStatus = 'pending' | 'trial' | 'active' | 'expired' | 'cancelled';

/** Schema Subscription plan trả về từ API */
export interface Subscription {
  _id: string;
  name: string;
  description?: string;
  itemType?: 'course' | 'performance';
  courseId?: string;       // ID khóa học được mở khóa khi mua gói này
  performanceId?: string;  // ID tiết mục được mở khóa
  price: number;
  currency?: Currency;
  billingCycle: BillingCycle;
  features?: string[];
  qrCodeUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để Admin tạo / cập nhật gói subscription */
export interface CreateSubscriptionInput {
  name: string;
  itemType?: 'course' | 'performance';
  courseId?: string;
  performanceId?: string;
  description?: string;
  price: number;            // tối thiểu 0
  currency?: Currency;
  billingCycle: BillingCycle;
  features?: string[];
  qrCodeUrl?: string;
  qrCode?: File;
  isActive?: boolean;
}

/** Schema UserSubscription — bản ghi subscription của từng user */
export interface UserSubscription {
  _id: string;
  userId: string;
  subscriptionId: string;   // Ref tới Subscription plan
  status: UserSubscriptionStatus;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Response khi user gửi yêu cầu mua gói (POST /subscriptions/:id/request) */
export interface RequestSubscriptionResponse {
  message: string;
  transactionRecordId: string;
  userSubscriptionId: string;
  qrCodeUrl?: string | null;
}
