// Auto-generated from Swagger

export interface Badge {
  _id?: string;
  name?: string;
  icon?: string;
  description?: string;
  type?: string;
  conditionKey?: string;
  conditionValue?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBadgeInput {
  name: string;
  icon: string;
  description?: string;
  type: string;
  conditionKey: string;
  conditionValue: number;
  isActive?: boolean;
}

