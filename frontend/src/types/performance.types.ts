export type PerformanceStatus = 'pending' | 'published' | 'archived';

export interface Performance {
  _id: string;
  instructorId?: string | { _id: string; name?: string };
  title: string;
  description?: string;
  thumbnail?: string;
  videoUrl?: string;
  isFree: boolean;
  genre?: string;
  duration?: number;
  adminCommissionPercentage?: number;
  status: PerformanceStatus;
  tags?: string[];
  isFeatured?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Subscription plan liên kết — có trong cả getAll và getOne */
  subscription?: {
    _id: string;
    price: number;
    currency: string;
    billingCycle: string;
    name: string;
    isActive: boolean;
  } | null;
}

export interface CreatePerformanceInput {
  title: string;
  description?: string;
  thumbnail?: string;
  videoUrl?: string;
  isFree?: boolean;
  genre?: string;
  duration?: number;
  status?: PerformanceStatus;
  adminCommissionPercentage?: number;
  tags?: string[];
  isFeatured?: boolean;
  /** Giá tiết mục — BE dùng để tạo/cập nhật Subscription plan tự động */
  price?: number;
  /** Chu kỳ thanh toán — bắt buộc khi có price */
  billingCycle?: 'monthly' | 'quarterly' | 'yearly';
}

export interface ApprovePerformanceInput {
  /** % hoa hồng admin lấy (0-100, mặc định 30 nếu không gửi) */
  adminCommissionPercentage?: number;
}

export interface RejectPerformanceInput {
  rejectReason?: string;
}

export interface GetPerformancesQuery {
  page?: number;
  limit?: number;
  sort?: string;
  status?: PerformanceStatus;
  genre?: string;
  isFree?: boolean;
}
