import { Badge } from '@/components/ui/badge';
import {
  LessonLevel,
  LessonStatus,
  LessonType,
  ApprovalStatus,
  ContentType,
} from '@/types/content.types';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_MAP: Record<LessonStatus, { label: string; variant: string }> = {
  published: {
    label: 'Đã xuất bản',
    variant: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  draft: {
    label: 'Bản nháp',
    variant: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  archived: {
    label: 'Lưu trữ',
    variant: 'bg-gray-100 text-gray-500 border-gray-200',
  },
};

const LEVEL_MAP: Record<LessonLevel, { label: string; variant: string }> = {
  beginner: {
    label: 'Căn bản',
    variant: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  intermediate: {
    label: 'Trung cấp',
    variant: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  advanced: {
    label: 'Nâng cao',
    variant: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

const TYPE_MAP: Record<LessonType, { label: string; variant: string }> = {
  video: {
    label: 'Video',
    variant: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  exercise: {
    label: 'Bài tập',
    variant: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  theory: {
    label: 'Lý thuyết',
    variant: 'bg-purple-50 text-purple-700 border-purple-200',
  },
};

const APPROVAL_MAP: Record<ApprovalStatus, { label: string; variant: string }> =
  {
    pending: {
      label: 'Chờ duyệt',
      variant: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    approved: {
      label: 'Đã duyệt',
      variant: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    rejected: {
      label: 'Từ chối',
      variant: 'bg-red-50 text-red-700 border-red-200',
    },
  };

interface StatusBadgeProps {
  status: LessonStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_MAP[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.variant}`}
    >
      {config.label}
    </span>
  );
}

interface LevelBadgeProps {
  level: LessonLevel;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  const config = LEVEL_MAP[level];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.variant}`}
    >
      {config.label}
    </span>
  );
}

interface TypeBadgeProps {
  type: LessonType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const config = TYPE_MAP[type];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.variant}`}
    >
      {config.label}
    </span>
  );
}

interface ApprovalBadgeProps {
  status: ApprovalStatus;
}

export function ApprovalBadge({ status }: ApprovalBadgeProps) {
  const config = APPROVAL_MAP[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.variant}`}
    >
      {config.label}
    </span>
  );
}

// ─── ContentType Badge (for submissions: lesson / learning_path / exercise) ───
const CONTENT_TYPE_MAP: Record<
  ContentType,
  { label: string; variant: string }
> = {
  lesson: {
    label: 'Bài học',
    variant: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  learning_path: {
    label: 'Lộ trình',
    variant: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  exercise: {
    label: 'Bài tập',
    variant: 'bg-orange-50 text-orange-700 border-orange-200',
  },
};

interface ContentTypeBadgeProps {
  type: ContentType;
}

export function ContentTypeBadge({ type }: ContentTypeBadgeProps) {
  const config = CONTENT_TYPE_MAP[type] ?? {
    label: type,
    variant: 'bg-gray-100 text-gray-500 border-gray-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.variant}`}
    >
      {config.label}
    </span>
  );
}

// ─── Label helpers ────────────────────────────────────────────────────────────
export const levelLabel = (l: LessonLevel) => LEVEL_MAP[l].label;
export const statusLabel = (s: LessonStatus) => STATUS_MAP[s].label;
export const typeLabel = (t: LessonType) => TYPE_MAP[t].label;
export const approvalLabel = (s: ApprovalStatus) => APPROVAL_MAP[s].label;
