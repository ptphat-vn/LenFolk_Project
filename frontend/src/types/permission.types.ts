// Auto-generated from Swagger

export interface Permission {
  _id?: string;
  action?: string;
  resource?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePermissionInput {
  action: string;
  resource: string;
  description?: string;
}

