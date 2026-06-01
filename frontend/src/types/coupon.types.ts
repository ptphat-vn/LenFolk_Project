// ── Coupon ──────────────────────────────────────────────────────────────────

export type DiscountType = 'percent' | 'fixed';
export type CouponApplicableTo = 'subscription' | 'course' | 'all';

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

/** Response khi mua khóa học có áp dụng coupon (POST /courses/:id/purchase) */
export interface CoursePurchaseResponse {
  message: string;
  transactionId: string;
  originalAmount: number;
  discountAmount: number;
  amountToPay: number;
  currency: string;
  courseName: string;
}

/** Body dùng để mua lẻ khóa học */
export interface CoursePurchaseInput {
  couponCode?: string;
}
