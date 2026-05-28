// ─── Enums ────────────────────────────────────────────────────────────────────
export type LessonLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'video' | 'exercise' | 'theory';
export type LessonStatus = 'published' | 'draft' | 'archived';
export type PathCategory = 'foundation' | 'technique' | 'repertoire';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ContentType = 'lesson' | 'learning_path' | 'exercise';

// ─── Lesson ───────────────────────────────────────────────────────────────────
export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  level: LessonLevel;
  status: LessonStatus;
  duration: number; // minutes
  author: string;
  authorEmail: string;
  tags: string[];
  thumbnail?: string;
  videoUrl?: string;
  viewCount: number;
  completionRate: number;
  pathId?: string;
  pathTitle?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Learning Path ────────────────────────────────────────────────────────────
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: PathCategory;
  level: LessonLevel;
  status: 'published' | 'draft';
  totalLessons: number;
  totalDuration: number; // minutes
  enrolledCount: number;
  completionRate: number;
  instructor: string;
  thumbnail?: string;
  lessonIds: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Commission ───────────────────────────────────────────────────────────────
export interface CommissionConfig {
  rate: number; // percent
  basePrice: number; // VND
  totalEarned: number; // VND
}

// ─── Curriculum ───────────────────────────────────────────────────────────────
export type CurriculumItemType = 'lesson' | 'exercise';

export interface CurriculumItem {
  id: string;
  track: PathCategory;
  order: number;
  session: string; // e.g. 'Buổi 1'
  title: string;
  type: CurriculumItemType;
  description: string;
}

// ─── Content Submission (Approval) ────────────────────────────────────────────
export interface ContentSubmission {
  id: string;
  title: string;
  type: ContentType;
  author: string;
  authorEmail: string;
  submittedAt: string;
  status: ApprovalStatus;
  description: string;
  duration?: number;
  level: LessonLevel;
  previewUrl?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  commission?: CommissionConfig;
}
