/** Cấu hình thanh toán dùng chung (1 QR cố định + bank). Singleton. */
export interface SystemSetting {
  key?: string;
  paymentQrUrl?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankAccountName?: string | null;
  transferNote?: string | null;
  defaultCommissionPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** Body cập nhật cấu hình (PUT /system-settings) — multipart, field qrCode là file ảnh. */
export interface UpdateSystemSettingInput {
  qrCode?: File;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  transferNote?: string;
  defaultCommissionPercentage?: number;
}
