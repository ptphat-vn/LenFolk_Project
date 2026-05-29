// Auto-generated from Swagger

export interface TransactionRecord {
  _id?: string;
  userId?: string;
  userSubscriptionId?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  gatewayTxId?: string;
  status?: string;
  gatewayProvider?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ZaloPayCreateOrderInput {
  amount?: number;
  item?: object[];
  description?: string;
  redirecturl?: string;
}

export interface ZaloPayCallbackInput {
  data: string;
  mac: string;
}

