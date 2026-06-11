import { Currency } from './course.types';

export type TransactionStatus = 'pending' | 'reviewing' | 'success' | 'failed' | 'refunded';
export type TransactionType = 'course' | 'performance' | 'subscription';

/** Schema TransactionRecord trả về từ API */
export interface TransactionRecord {
  _id: string;
  userId: string;
  /** Ref tới Enrollment (thay cho userSubscriptionId cũ) */
  enrollmentId?: string | null;
  courseId?: string | null;
  performanceId?: string | null;
  transactionType?: TransactionType;
  amount: number;
  currency?: Currency;
  paymentMethod?: string;
  status: TransactionStatus;
  couponId?: string | null;
  discountAmount?: number;
  paidAt?: string;
  proofImageUrl?: string | null;  // ảnh chứng minh chuyển khoản
  reviewedBy?: string | null;      // Admin ID đã duyệt/từ chối
  reviewedAt?: string | null;
  rejectReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để Admin cập nhật trạng thái giao dịch (PATCH /transaction-records/:id) */
export interface UpdateTransactionRecordInput {
  status?: TransactionStatus;
  paidAt?: string;
}

/** Body dùng để Admin từ chối giao dịch (PATCH /transaction-records/:id/reject) */
export interface RejectTransactionInput {
  rejectReason?: string;
}

/** Query params cho GET /transaction-records */
export interface GetTransactionRecordsQuery {
  userId?: string;
  status?: TransactionStatus;
}
