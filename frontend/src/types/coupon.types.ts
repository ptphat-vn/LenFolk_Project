// ── Coupon ──────────────────────────────────────────────────────────────────

export type DiscountType = 'percent' | 'fixed';
export type CouponApplicableTo = 'course' | 'performance' | 'all';

/** Schema Coupon trả về từ API */
export interface Coupon {
  _id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;          // giá trị giảm giá (% hoặc VND)
  maxUses?: number | null;        // giới hạn lượt dùng (null = không giới hạn)
  usedCount: number;
  validFrom: string;              // ISO date-time
  validTo?: string | null;        // ISO date-time (null = không hết hạn)
  isActive: boolean;
  applicableTo: CouponApplicableTo;
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để Admin tạo / cập nhật coupon */
export interface CreateCouponInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses?: number | null;
  validFrom: string;
  validTo?: string | null;
  isActive?: boolean;
  applicableTo?: CouponApplicableTo;
}

/** Response khi mua khóa học/tiết mục (POST /courses|performances/:id/purchase).
 *  SePay tạo QR động cho từng giao dịch; thanh toán được xác nhận tự động qua webhook.
 *  Các field bank/transferNote có thể null tuỳ cấu hình SEPAY_* phía server. */
export interface CoursePurchaseResponse {
  message: string;
  transactionId: string;
  qrCodeUrl?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  transferNote?: string | null;
  originalAmount: number;
  discountAmount: number;
  amountToPay: number;
  currency: string;
  courseName?: string;
  performanceName?: string;
}

/** Body dùng để mua lẻ khóa học */
export interface CoursePurchaseInput {
  couponCode?: string;
}
