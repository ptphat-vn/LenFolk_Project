// Auto-generated from Swagger

export interface Subscription {
  _id?: string;
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  billingCycle?: string;
  features?: string[];
  maxCourses?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSubscriptionInput {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  billingCycle: string;
  features?: string[];
  maxCourses?: number;
  isActive?: boolean;
}

export interface PurchaseSubscriptionInput {
  redirecturl?: string;
}

export interface PurchaseSubscriptionResponse {
  success?: boolean;
  data?: object;
}

