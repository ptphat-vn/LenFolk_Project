import type { InstructorRef } from './course.types';

export type PerformanceStatus = 'pending' | 'published' | 'archived';

export interface PerformanceDocument {
  name: string;
  url: string;
  publicId?: string | null;
  format?: string | null;
  resourceType?: string;
  bytes?: number | null;
}

export interface Performance {
  _id: string;
  instructorId?: InstructorRef;
  title: string;
  description?: string;
  thumbnail?: string;
  imageUrls?: string[];
  videoUrl?: string;
  documents?: PerformanceDocument[];
  isFree: boolean;
  genre?: string;
  duration?: number;
  /** Giá nằm thẳng trên tiết mục — mua đứt 1 lần */
  price?: number;
  currency?: 'VND' | 'USD';
  adminCommissionPercentage?: number;
  status: PerformanceStatus;
  tags?: string[];
  isFeatured?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePerformanceInput {
  title: string;
  description?: string;
  thumbnail?: string;
  imageUrls?: File[];
  existingImageUrls?: string[];
  videoUrl?: string;
  documents?: File[];
  isFree?: boolean;
  genre?: string;
  duration?: number;
  status?: PerformanceStatus;
  adminCommissionPercentage?: number;
  tags?: string[];
  isFeatured?: boolean;
  /** Giá tiết mục — lưu thẳng trên Performance (mua đứt) */
  price?: number;
  currency?: 'VND' | 'USD';
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
