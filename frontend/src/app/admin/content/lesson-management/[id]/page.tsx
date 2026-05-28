import {
  LevelBadge,
  StatusBadge,
  TypeBadge,
} from '@/components/admin/content-approval/ContentBadges';
import { Button } from '@/components/ui/button';
import { MOCK_LESSONS } from '@/lib/mock-content';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Eye,
  Mail,
  Map,
  Tag,
  TrendingUp,
  User,
  Video,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lesson = MOCK_LESSONS.find((l) => l.id === id);
  return { title: lesson ? `${lesson.title} | Lenfolk Admin` : 'Bài học' };
}

export default async function LessonDetailPage({ params }: Props) {
  const { id } = await params;
  const lesson = MOCK_LESSONS.find((l) => l.id === id);
  if (!lesson) notFound();

  const relatedLessons = MOCK_LESSONS.filter(
    (l) => l.id !== lesson.id && l.pathId === lesson.pathId,
  ).slice(0, 4);

  return (
    <div className="p-6 space-y-5 max-w-350">
      {/* Breadcrumb + Back */}
      <div className="flex items-center gap-2 text-[13px] text-gray-500">
        <Link
          href="/admin/content/lesson-management"
          className="flex items-center gap-1.5 hover:text-[#2d6a4f] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quản lý bài học
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-75">
          {lesson.title}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* ── Main content (left 2/3) ── */}
        <div className="col-span-2 space-y-4">
          {/* Hero card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Placeholder thumbnail */}
            <div className="h-48 bg-linear-to-br from-[#1a3a2a] to-[#2d6a4f] flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-white/30" />
            </div>
            <div className="px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <TypeBadge type={lesson.type} />
                    <LevelBadge level={lesson.level} />
                    <StatusBadge status={lesson.status} />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 leading-snug">
                    {lesson.title}
                  </h1>
                  <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                    {lesson.description}
                  </p>
                </div>
                <Link
                  href={`/admin/content/lesson-management?edit=${lesson.id}`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-[13px] gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Chỉnh sửa
                  </Button>
                </Link>
              </div>

              {/* Tags */}
              {lesson.tags.length > 0 && (
                <div className="flex items-center flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100">
                  <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  {lesson.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Video preview */}
          {lesson.videoUrl && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Video className="w-4 h-4 text-[#2d6a4f]" />
                Video bài học
              </h3>
              <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-[13px] text-gray-400">{lesson.videoUrl}</p>
              </div>
            </div>
          )}

          {/* Related lessons */}
          {relatedLessons.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Map className="w-4 h-4 text-[#2d6a4f]" />
                Bài học cùng lộ trình
                <span className="text-[12px] font-normal text-gray-400">
                  ({lesson.pathTitle})
                </span>
              </h3>
              <div className="space-y-2">
                {relatedLessons.map((r) => (
                  <Link
                    key={r.id}
                    href={`/admin/content/lesson-management/${r.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1a3a2a]/8 flex items-center justify-center shrink-0">
                      <BookOpen className="w-4 h-4 text-[#2d6a4f]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-900 group-hover:text-[#2d6a4f] transition-colors truncate">
                        {r.title}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {r.author} · {r.duration} phút
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar (right 1/3) ── */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
              Thống kê
            </h3>
            {[
              {
                icon: Eye,
                label: 'Lượt xem',
                value: lesson.viewCount.toLocaleString(),
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: CheckCircle2,
                label: 'Tỉ lệ hoàn thành',
                value: `${lesson.completionRate}%`,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
              },
              {
                icon: Clock,
                label: 'Thời lượng',
                value: `${lesson.duration} phút`,
                color: 'text-violet-600',
                bg: 'bg-violet-50',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900">
                      {item.value}
                    </p>
                    <p className="text-[11px] text-gray-400">{item.label}</p>
                  </div>
                </div>
              );
            })}

            {/* Completion progress bar */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-[12px] mb-1.5">
                <span className="text-gray-500">Tiến độ hoàn thành</span>
                <span className="font-semibold text-[#2d6a4f]">
                  {lesson.completionRate}%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2d6a4f] rounded-full"
                  style={{ width: `${lesson.completionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
              Thông tin
            </h3>
            {[
              { icon: User, label: 'Giảng viên', value: lesson.author },
              { icon: Mail, label: 'Email', value: lesson.authorEmail },
              {
                icon: Map,
                label: 'Lộ trình',
                value: lesson.pathTitle ?? '—',
              },
              {
                icon: Calendar,
                label: 'Tạo ngày',
                value: lesson.createdAt,
              },
              {
                icon: Calendar,
                label: 'Cập nhật',
                value: lesson.updatedAt,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-2.5">
                  <Icon className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-gray-400">{item.label}</p>
                    <p className="text-[13px] font-medium text-gray-800">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick actions */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-2">
            <h3 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Hành động
            </h3>
            <Button
              size="sm"
              className="w-full bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] justify-start gap-2"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Chỉnh sửa bài học
            </Button>
            {lesson.status === 'draft' && (
              <Button
                size="sm"
                variant="outline"
                className="w-full text-[13px] justify-start gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Xuất bản ngay
              </Button>
            )}
            {lesson.status === 'published' && (
              <Button
                size="sm"
                variant="outline"
                className="w-full text-[13px] justify-start gap-2 text-gray-500 hover:bg-gray-50"
              >
                <Clock className="w-3.5 h-3.5" />
                Lưu trữ bài học
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
