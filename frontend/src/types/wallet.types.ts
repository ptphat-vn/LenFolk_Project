// ── Wallet & Payouts ────────────────────────────────────────────────────────

export type PayoutStatus = 'pending' | 'approved' | 'rejected';

/** Thông tin ngân hàng của instructor */
export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

/** Schema Wallet của instructor trả về từ API */
export interface Wallet {
  _id: string;
  instructorId: string;
  balance: number;        // số dư hiện tại (VND)
  totalEarned: number;    // tổng thu nhập tích lũy (VND)
  currency: string;       // 'VND'
  createdAt?: string;
  updatedAt?: string;
}

/** Schema PayoutRequest — yêu cầu rút tiền của instructor */
export interface PayoutRequest {
  _id: string;
  /** string khi chưa populate; object khi admin list populate name/email */
  instructorId: string | { _id?: string; name?: string; email?: string };
  amount: number;
  status: PayoutStatus;
  bankDetails: BankDetails;
  adminNote?: string | null;
  processedBy?: string | null;  // Admin ID đã xử lý
  processedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để tạo yêu cầu rút tiền (POST /wallets/payout) */
export interface CreatePayoutRequestInput {
  amount: number;
}

/** Body dùng để Admin duyệt / từ chối yêu cầu rút tiền */
export interface ReviewPayoutInput {
  status: 'approved' | 'rejected';
  adminNote?: string;
}

/** Response của GET /wallets/me */
export interface WalletMeResponse {
  wallet: Wallet;
  payouts: PayoutRequest[];
}
