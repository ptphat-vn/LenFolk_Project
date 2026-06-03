export type PerformanceStatus = 'draft' | 'pending' | 'published' | 'archived';

export interface Performance {
  _id: string;
  instructorId?: string;
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
}

export interface CreatePerformanceInput {
  title: string;
  description?: string;
  thumbnail?: string;
  videoUrl?: string;
  isFree?: boolean;
  genre?: string;
  duration?: number;
  adminCommissionPercentage?: number;
  status?: PerformanceStatus;
  tags?: string[];
  isFeatured?: boolean;
}

export interface GetPerformancesQuery {
  page?: number;
  limit?: number;
  sort?: string;
  status?: PerformanceStatus;
  genre?: string;
  isFree?: boolean;
}
