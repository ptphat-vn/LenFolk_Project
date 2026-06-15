import { Currency } from './course.types';

/** SePay xác nhận tự động qua webhook — không còn `reviewing`. */
export type TransactionStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type TransactionType = 'course' | 'performance' | 'subscription';

/** Ref người dùng được populate khi GET (userId, reviewedBy) */
export interface PopulatedTxUser {
  _id: string;
  name?: string;
  email?: string;
}

/** Khi GET, các ref được populate thành object; khi gửi lên vẫn dùng id (string). */
export type TxUserRef = string | PopulatedTxUser;
export type TxCourseRef = string | { _id: string; title?: string };
export type TxPerformanceRef = string | { _id: string; title?: string };
export type TxCouponRef = string | { _id: string; code?: string };

/** Schema TransactionRecord trả về từ API (các ref được populate) */
export interface TransactionRecord {
  _id: string;
  userId: TxUserRef;
  /** Ref tới Enrollment (thay cho userSubscriptionId cũ) */
  enrollmentId?: string | null;
  courseId?: TxCourseRef | null;
  performanceId?: TxPerformanceRef | null;
  transactionType?: TransactionType;
  amount: number;
  currency?: Currency;
  paymentMethod?: string;
  status: TransactionStatus;
  couponId?: TxCouponRef | null;
  discountAmount?: number;
  reviewedBy?: TxUserRef | null;
  payCode?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Lấy tên hiển thị từ ref user đã populate (hoặc id nếu chưa populate) */
export function txUserName(ref: TxUserRef | null | undefined): string {
  if (!ref) return '—';
  if (typeof ref === 'string') return ref;
  return ref.name || ref.email || ref._id;
}

/** Lấy email từ ref user đã populate */
export function txUserEmail(ref: TxUserRef | null | undefined): string | undefined {
  return ref && typeof ref !== 'string' ? ref.email : undefined;
}

/** Lấy tiêu đề khóa học / tiết mục đã populate */
export function txItemTitle(ref: TxCourseRef | TxPerformanceRef | null | undefined): string | undefined {
  if (!ref) return undefined;
  return typeof ref === 'string' ? ref : ref.title;
}

/** Lấy mã coupon đã populate */
export function txCouponCode(ref: TxCouponRef | null | undefined): string | undefined {
  if (!ref) return undefined;
  return typeof ref === 'string' ? ref : ref.code;
}

/** Body dùng để Admin cập nhật giao dịch (PATCH /transaction-records/:id) — vd refund thủ công */
export interface UpdateTransactionRecordInput {
  status?: TransactionStatus;
  amount?: number;
  paymentMethod?: string;
  paidAt?: string;
}

/** Query params cho GET /transaction-records */
export interface GetTransactionRecordsQuery {
  userId?: string;
  status?: TransactionStatus;
}
