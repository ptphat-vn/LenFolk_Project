import { Role } from './user.types';

export type ModeratorAction =
  | 'approve_comment'
  | 'delete_comment'
  | 'warn_user'
  | 'ban_user'
  | 'unban_user'
  | 'resolve_report'
  | 'dismiss_report';

export type ModeratorTargetType = 'user' | 'comment' | 'report' | 'course' | 'lesson';

/** Schema AuditLog trả về từ API */
export interface AuditLog {
  _id: string;
  actorId: string;
  actorRole: Role;
  action: string;        // ví dụ: "DELETE_USER", "UPDATE_USER_ROLE"
  resource: string;      // ví dụ: "User", "Course"
  resourceId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string;
  createdAt?: string;
}

/** Body dùng để tạo AuditLog (POST /audit-logs) */
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

/** Schema ModeratorLog trả về từ API */
export interface ModeratorLog {
  _id: string;
  moderatorId: string;
  action: ModeratorAction;
  targetType: ModeratorTargetType;
  targetId: string;
  reason?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để tạo ModeratorLog */
export interface CreateModeratorLogInput {
  moderatorId: string;
  action: ModeratorAction;
  targetType: ModeratorTargetType;
  targetId: string;
  reason?: string;
  note?: string;
}
