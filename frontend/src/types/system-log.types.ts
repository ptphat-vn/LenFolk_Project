// Auto-generated from Swagger

export interface AuditLog {
  _id?: string;
  actorId?: string;
  actorRole?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  before?: object;
  after?: object;
  ipAddress?: string;
  createdAt?: string;
}

export interface CreateAuditLogInput {
  actorId: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  before?: object;
  after?: object;
  ipAddress?: string;
}

export interface ModeratorLog {
  _id?: string;
  moderatorId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  reason?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateModeratorLogInput {
  moderatorId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  note?: string;
}

