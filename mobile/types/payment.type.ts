// Response trả về khi tạo đơn mua (course hoặc performance) — luồng SePay QR.
// Xem docs: mobile-payment-flow.md (Bước 1).
export type PurchaseResponse = {
  message: string;
  transactionId: string;
  payCode: string;
  sepayQrUrl: string | null;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  originalAmount: number;
  discountAmount: number;
  amountToPay: number;
  currency: "VND" | "USD";
  courseName?: string;
  performanceName?: string;
};

// Response của GET /transaction-records/:id/status — dùng để poll (Bước 3).
export type TransactionStatus = {
  transactionId: string;
  status: "pending" | "success" | "failed" | "refunded";
  isPaid: boolean;
  amount: number;
  currency: "VND" | "USD";
  payCode: string;
  paidAt: string | null;
  transactionType: "course" | "performance";
};
