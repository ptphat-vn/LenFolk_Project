'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Clock, Plus, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Lesson } from '@/types/content.types';
import { LessonFilters, LessonFilterState } from '../../../../components/admin/lesson-management/LessonFilters';
import { LessonFormDialog } from '../../../../components/admin/lesson-management/LessonFormDialog';
import { LessonTable } from '../../../../components/admin/lesson-management/LessonTable';
import { MOCK_LESSONS } from '@/lib/mock-content';
import { Button } from '@/components/ui/button';

export default function LessonManagementPage() {
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [filters, setFilters] = useState<LessonFilterState>({
    search: '',
    status: 'all',
    level: 'all',
    type: 'all',
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const stats = useMemo(
    () => ({
      total: lessons.length,
      published: lessons.filter((l) => l.status === 'published').length,
      draft: lessons.filter((l) => l.status === 'draft').length,
      totalViews: lessons.reduce((s, l) => s + l.viewCount, 0),
    }),
    [lessons],
  );

  const filtered = useMemo(() => {
    return lessons.filter((l) => {
      if (
        filters.search &&
        !l.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !l.author.toLowerCase().includes(filters.search.toLowerCase())
      )
        return false;
      if (filters.status !== 'all' && l.status !== filters.status) return false;
      if (filters.level !== 'all' && l.level !== filters.level) return false;
      if (filters.type !== 'all' && l.type !== filters.type) return false;
      return true;
    });
  }, [lessons, filters]);

  const handleEdit = (lesson: Lesson) => {
    setEditTarget(lesson);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSave = (data: Partial<Lesson>) => {
    if (editTarget) {
      setLessons((prev) =>
        prev.map((l) =>
          l.id === editTarget.id
            ? {
                ...l,
                ...data,
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : l,
        ),
      );
    } else {
      const newLesson: Lesson = {
        id: `L${String(Date.now()).slice(-4)}`,
        viewCount: 0,
        completionRate: 0,
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        tags: [],
        ...data,
      } as Lesson;
      setLessons((prev) => [newLesson, ...prev]);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-350">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý bài học</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Toàn bộ nội dung bài học trên nền tảng Lenfolk
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] h-9"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Thêm bài học
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3"
              >
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-10" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))
          : [
              {
                label: 'Tổng bài học',
                value: stats.total,
                icon: BookOpen,
                iconBg: 'bg-blue-50',
                iconColor: 'text-blue-600',
              },
              {
                label: 'Đã xuất bản',
                value: stats.published,
                icon: TrendingUp,
                iconBg: 'bg-emerald-50',
                iconColor: 'text-[#2d6a4f]',
              },
              {
                label: 'Bản nháp',
                value: stats.draft,
                icon: Clock,
                iconBg: 'bg-amber-50',
                iconColor: 'text-amber-600',
              },
              {
                label: 'Tổng lượt xem',
                value: stats.totalViews.toLocaleString('en-US'),
                icon: TrendingUp,
                iconBg: 'bg-violet-50',
                iconColor: 'text-violet-600',
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3"
                >
                  <div
                    className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-4 h-4 ${s.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 leading-none">
                      {s.value}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {s.label}
                    </p>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Filters */}
      <LessonFilters
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />

      {/* Table */}
      <LessonTable
        lessons={filtered}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Form Dialog */}
      <LessonFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lesson={editTarget}
        onSave={handleSave}
      />
    </div>
  );
}
