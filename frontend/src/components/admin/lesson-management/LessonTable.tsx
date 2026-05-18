'use client';

import { ConfirmDialog } from '@/components/admin/content-approval/ConfirmDialog';
import {
  LevelBadge,
  StatusBadge,
  TypeBadge,
} from '@/components/admin/content-approval/ContentBadges';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Lesson } from '@/types/content.types';
import {
  BookOpen,
  Clock,
  Edit2,
  EllipsisVertical,
  Eye,
  FolderSearch,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LessonTableProps {
  lessons: Lesson[];
  onEdit: (lesson: Lesson) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export function LessonTable({
  lessons,
  onEdit,
  onDelete,
  isLoading,
}: LessonTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-[40%]">
                  Bài học
                </th>
                <th className="px-4 py-3 w-[10%]" />
                <th className="px-4 py-3 w-[10%]" />
                <th className="px-4 py-3 w-[12%]" />
                <th className="px-4 py-3 w-[10%]" />
                <th className="px-4 py-3 w-[10%]" />
                <th className="px-4 py-3 w-[8%]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-4 w-10 ml-auto" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Skeleton className="h-1.5 w-16 rounded-full" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Skeleton className="h-6 w-12 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm py-20 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
          <FolderSearch className="w-7 h-7 text-gray-300" />
        </div>
        <p className="text-[14px] font-medium text-gray-500">
          Không tìm thấy bài học nào
        </p>
        <p className="text-[12px] text-gray-400">
          Thử thay đổi bộ lọc hoặc thêm bài học mới
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-[40%]">
                  Bài học
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-[10%]">
                  Loại
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-[10%]">
                  Cấp độ
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-[12%]">
                  Trạng thái
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 w-[10%]">
                  Lượt xem
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 w-[10%]">
                  Hoàn thành
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 w-[8%]">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lessons.map((lesson) => (
                <tr
                  key={lesson.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  {/* Title */}
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#1a3a2a]/8 flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4 text-[#2d6a4f]" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/content/lesson-management/${lesson.id}`}
                          className="font-medium text-gray-900 hover:text-[#2d6a4f] transition-colors line-clamp-1"
                        >
                          {lesson.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-gray-400">
                            {lesson.author}
                          </span>
                          <span className="text-gray-200">·</span>
                          <span className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Clock className="w-3 h-3" />
                            {lesson.duration} phút
                          </span>
                          {lesson.pathTitle && (
                            <>
                              <span className="text-gray-200">·</span>
                              <span className="text-[11px] text-[#2d6a4f] truncate max-w-30">
                                {lesson.pathTitle}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <TypeBadge type={lesson.type} />
                  </td>

                  {/* Level */}
                  <td className="px-4 py-3">
                    <LevelBadge level={lesson.level} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={lesson.status} />
                  </td>

                  {/* Views */}
                  <td className="px-4 py-3 text-right">
                    <span className="font-medium text-gray-700">
                      {lesson.viewCount.toLocaleString('en-US')}
                    </span>
                  </td>

                  {/* Completion */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2d6a4f] rounded-full"
                          style={{ width: `${lesson.completionRate}%` }}
                        />
                      </div>
                      <span className="text-gray-600 tabular-nums w-8 text-right">
                        {lesson.completionRate}%
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <EllipsisVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/admin/content/lesson-management/${lesson.id}`,
                            )
                          }
                          className="gap-2 cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                          Chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit(lesson)}
                          className="gap-2 cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4 text-blue-500" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(lesson.id)}
                          className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
          <span className="text-[12px] text-gray-400">
            Hiển thị {lessons.length} bài học
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-7 text-[12px] px-3"
            >
              ← Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 text-[12px] bg-[#1a3a2a] text-white border-[#1a3a2a]"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-7 text-[12px] px-3"
            >
              Sau →
            </Button>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Xóa bài học này?"
        description="Hành động này không thể hoàn tác. Bài học và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn."
        confirmLabel="Xóa bài học"
        variant="danger"
        onConfirm={() => {
          if (deleteId) onDelete(deleteId);
          setDeleteId(null);
        }}
      />
    </>
  );
}
