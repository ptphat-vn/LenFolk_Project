export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

/** Schema Progress trả về từ API */
export interface Progress {
  _id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  status: ProgressStatus;
  watchedSeconds?: number;
  completionPercent?: number;
  bestPracticeScore?: number;
  attemptCount?: number;
  lastAccessedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Body dùng để tạo tiến độ (POST /progress)
 *  userId được inject từ JWT — không cần gửi lên
 */
export interface CreateProgressInput {
  courseId: string;
  lessonId: string;
  status?: ProgressStatus;
  watchedSeconds?: number;   // tối thiểu 0
  completionPercent?: number; // 0-100
}

/** Body dùng để cập nhật tiến độ (PATCH /progress/:id) */
export interface UpdateProgressInput {
  status?: ProgressStatus;
  watchedSeconds?: number;
  completionPercent?: number;
  completedAt?: string;
}

/** Query params cho GET /progress */
export interface GetProgressQuery {
  courseId?: string;
  status?: ProgressStatus;
}
