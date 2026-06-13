export type Progress = {
  _id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  status: "not_started" | "in_progress" | "completed";
  watchedSeconds: number;
  completionPercent: number;
  bestPracticeScore: number | null;
  attemptCount: number;
  lastAccessedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
