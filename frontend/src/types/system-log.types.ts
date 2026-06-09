import { Role } from './user.types';

export interface AuditActor {
  _id: string;
  name?: string;
  email?: string;
  role?: Role;
}

export interface AuditLog {
  _id: string;
  actorId: string | AuditActor;
  actorRole: Role;
  action: string;
  resource: string;
  resourceId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
  createdAt?: string;
}

export interface CreateAuditLogInput {
  actorId: string;
  actorRole: Role;
  action: string;
  resource: string;
  resourceId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
}
