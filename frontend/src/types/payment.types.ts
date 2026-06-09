import { Currency } from './subscription.types';

export type TransactionStatus = 'pending' | 'reviewing' | 'success' | 'failed' | 'refunded';

/** Schema TransactionRecord trả về từ API */
export interface TransactionRecord {
  _id: string;
  userId: string;
  userSubscriptionId: string;
  amount: number;
  currency?: Currency;
  paymentMethod?: string;
  gatewayTxId?: string;
  status: TransactionStatus;
  gatewayProvider?: string;
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
