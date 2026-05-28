// Auto-generated from Swagger

export interface Progress {
  _id?: string;
  userId?: string;
  courseId?: string;
  lessonId?: string;
  status?: string;
  watchedSeconds?: number;
  completionPercent?: number;
  bestPracticeScore?: number;
  attemptCount?: number;
  lastAccessedAt?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProgressInput {
  userId: string;
  courseId: string;
  lessonId: string;
  status?: string;
  watchedSeconds?: number;
  completionPercent?: number;
}

