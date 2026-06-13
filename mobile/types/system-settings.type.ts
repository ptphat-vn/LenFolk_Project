export type SystemSetting = {
  _id: string;
  key: string;
  paymentQrUrl: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  transferNote: string | null;
  defaultCommissionPercentage: number;
  createdAt: string;
  updatedAt: string;
};
