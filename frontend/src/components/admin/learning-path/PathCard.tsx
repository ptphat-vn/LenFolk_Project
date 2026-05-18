'use client';

import { ConfirmDialog } from '@/components/admin/content-approval/ConfirmDialog';
import { LevelBadge } from '@/components/admin/content-approval/ContentBadges';
import { Button } from '@/components/ui/button';
import { LearningPath } from '@/types/content.types';
import { BookOpen, Clock, Edit2, Eye, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface PathCardProps {
  path: LearningPath;
  onEdit: (path: LearningPath) => void;
  onDelete: (id: string) => void;
}

export function PathCard({ path, onEdit, onDelete }: PathCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isPublished = path.status === 'published';

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
        {/* Header */}
        <div
          className={`h-2 rounded-t-xl ${isPublished ? 'bg-[#2d6a4f]' : 'bg-gray-300'}`}
        />

        <div className="p-5">
          {/* Title row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <LevelBadge level={path.level} />
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                    isPublished
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isPublished ? 'Xuất bản' : 'Bản nháp'}
                </span>
              </div>
              <h3 className="text-[14px] font-semibold text-gray-900 leading-snug">
                {path.title}
              </h3>
            </div>

            {/* Actions — shown on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Link href={`/admin/content/learning-path/${path.id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-gray-400 hover:text-[#2d6a4f] hover:bg-[#2d6a4f]/8"
                  title="Xem chi tiết"
                >
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                onClick={() => onEdit(path)}
                title="Chỉnh sửa"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                onClick={() => setConfirmOpen(true)}
                title="Xóa"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2 mb-4">
            {path.description}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
              <BookOpen className="w-3.5 h-3.5 text-gray-400" />
              {path.totalLessons} bài
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {Math.floor(path.totalDuration / 60)}h{path.totalDuration % 60}m
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              {path.enrolledCount.toLocaleString()}
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[12px]">
              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2d6a4f] rounded-full"
                  style={{ width: `${path.completionRate}%` }}
                />
              </div>
              <span className="text-gray-500 tabular-nums">
                {path.completionRate}%
              </span>
            </div>
          </div>

          {/* Instructor */}
          <div className="mt-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-linear-to-br from-[#2d6a4f] to-[#1a3a2a] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
              {path.instructor[0]}
            </div>
            <span className="text-[12px] text-gray-500">{path.instructor}</span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Xóa lộ trình này?"
        description={`Lộ trình "${path.title}" và tất cả liên kết bài học sẽ bị xóa vĩnh viễn.`}
        confirmLabel="Xóa lộ trình"
        variant="danger"
        onConfirm={() => onDelete(path.id)}
      />
    </>
  );
}
