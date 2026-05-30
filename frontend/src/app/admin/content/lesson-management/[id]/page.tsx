'use client';

import { useCallback, useEffect, useState } from 'react';
import { lessonApi } from '@/lib/api/lesson.api';
import { courseApi } from '@/lib/api/course.api';
import { Lesson } from '@/types/lesson.types';
import { Course } from '@/types/course.types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Layers,
  Mic,
  Tag,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function LessonDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  const fetchLesson = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await lessonApi.getById(id);
      const data = res.data;
      if (!data) {
        setNotFoundFlag(true);
        return;
      }
      setLesson(data);
      try {
        const courseRes = await courseApi.getById(data.courseId);
        setCourse(courseRes.data ?? null);
      } catch {
        // course info is optional
      }
    } catch {
      toast.error('Lỗi khi tải bài học');
      setNotFoundFlag(true);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLesson();
  }, [fetchLesson]);

  if (notFoundFlag) notFound();

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="p-6 space-y-5 w-full">
      {/* Breadcrumb */}
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
          {isLoading ? (
            <Skeleton className="h-4 w-40 inline-block" />
          ) : (
            lesson?.title
          )}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* ── Main content (left 2/3) ── */}
        <div className="col-span-2 space-y-4">
          {/* Hero card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="h-40 bg-linear-to-br from-[#1a3a2a] to-[#2d6a4f] flex items-center justify-center">
              <BookOpen className="w-14 h-14 text-white/30" />
            </div>
            <div className="px-6 py-5">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : lesson ? (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          lesson.status === 'published'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {lesson.status === 'published'
                          ? 'Đã xuất bản'
                          : 'Bản nháp'}
                      </span>
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          lesson.isFree
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {lesson.isFree ? 'Miễn phí' : 'Trả phí'}
                      </span>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900 leading-snug">
                      {lesson.title}
                    </h1>
                    {lesson.description && (
                      <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">
                        {lesson.description}
                      </p>
                    )}
                  </div>
                  <Link href="/admin/content/lesson-management">
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-[13px] gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Quản lý
                    </Button>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          {/* Video preview */}
          {lesson?.videoUrl && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Video className="w-4 h-4 text-[#2d6a4f]" />
                Video bài học
              </h3>
              <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-[13px] text-gray-400 px-4 text-center break-all">
                  {lesson.videoUrl}
                </p>
              </div>
            </div>
          )}

          {/* Audio */}
          {lesson?.audioUrl && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Mic className="w-4 h-4 text-[#2d6a4f]" />
                Audio bài học
              </h3>
              <div className="h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-[13px] text-gray-400 px-4 text-center break-all">
                  {lesson.audioUrl}
                </p>
              </div>
            </div>
          )}

          {/* Techniques */}
          {lesson?.techniques && lesson.techniques.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-[#2d6a4f]" />
                Kỹ thuật
              </h3>
              <div className="flex flex-wrap gap-2">
                {lesson.techniques.map((t) => (
                  <span
                    key={t}
                    className="text-[12px] bg-[#1a3a2a]/8 text-[#2d6a4f] px-2.5 py-1 rounded-full font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar (right 1/3) ── */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-3">
            <h3 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
              Thông tin
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : lesson ? (
              <>
                {[
                  {
                    icon: Layers,
                    label: 'Khoá học',
                    value: course?.title ?? lesson.courseId,
                    color: 'text-[#2d6a4f]',
                    bg: 'bg-emerald-50',
                  },
                  {
                    icon: BookOpen,
                    label: 'Thứ tự bài',
                    value: `#${lesson.order}`,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                  },
                  {
                    icon: Clock,
                    label: 'Thời lượng',
                    value: formatDuration(lesson.duration),
                    color: 'text-violet-600',
                    bg: 'bg-violet-50',
                  },
                  {
                    icon: Calendar,
                    label: 'Tạo ngày',
                    value: lesson.createdAt
                      ? new Date(lesson.createdAt).toLocaleDateString('vi-VN')
                      : '—',
                    color: 'text-gray-500',
                    bg: 'bg-gray-50',
                  },
                  {
                    icon: Calendar,
                    label: 'Cập nhật',
                    value: lesson.updatedAt
                      ? new Date(lesson.updatedAt).toLocaleDateString('vi-VN')
                      : '—',
                    color: 'text-gray-500',
                    bg: 'bg-gray-50',
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
                        <p className="text-[11px] text-gray-400">
                          {item.label}
                        </p>
                        <p className="text-[13px] font-medium text-gray-800 truncate max-w-36">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : null}
          </div>

          {lesson && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-2">
              <h3 className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Trạng thái
              </h3>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-4 h-4 ${lesson.status === 'published' ? 'text-emerald-500' : 'text-amber-400'}`}
                />
                <span className="text-[13px] font-medium text-gray-800">
                  {lesson.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={`w-2 h-2 rounded-full ${lesson.isFree ? 'bg-blue-400' : 'bg-gray-400'}`}
                />
                <span className="text-[13px] text-gray-600">
                  {lesson.isFree ? 'Nội dung miễn phí' : 'Nội dung trả phí'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
