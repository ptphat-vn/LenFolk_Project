'use client';

import { ConfirmDialog } from '@/components/admin/content-approval/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { CurriculumItem } from '@/types/content.types';
import { Edit2, GripVertical, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
  item: CurriculumItem;
  onEdit: (item: CurriculumItem) => void;
  onDelete: (id: string) => void;
}

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  lesson: {
    label: 'Bài học',
    cls: 'bg-white border border-gray-200 text-gray-700',
  },
  exercise: {
    label: 'Luyện tập',
    cls: 'bg-amber-50 border border-amber-200 text-amber-700',
  },
};

export function CurriculumItemRow({ item, onEdit, onDelete }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const badge = TYPE_BADGE[item.type] ?? TYPE_BADGE.lesson;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-start gap-3 group hover:shadow-md transition-shadow">
        {/* Drag handle */}
        <div className="mt-1.5 text-gray-300 hover:text-gray-500 cursor-grab shrink-0">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Number circle */}
        <div className="w-8 h-8 rounded-full bg-[#1a3a2a] text-white text-[13px] font-bold flex items-center justify-center shrink-0 mt-0.5">
          {item.order}
        </div>

        {/* Session badge */}
        <span className="mt-1.5 text-[12px] font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
          {item.session}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-gray-900 leading-snug mb-1.5">
            {item.title}
          </p>
          <span
            className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full mb-2 ${badge.cls}`}
          >
            {badge.label}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`block w-full text-left text-[12px] text-gray-500 leading-relaxed hover:text-gray-700 transition-colors ${
              expanded ? '' : 'line-clamp-1'
            }`}
          >
            {item.description}
          </button>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-1 shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-7 px-2.5 text-[12px] gap-1 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
          >
            <Edit2 className="w-3 h-3" />
            Chỉnh sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="h-7 px-2.5 text-[12px] gap-1 text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600"
          >
            <Trash2 className="w-3 h-3" />
            Xóa
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Xóa bài học"
        description={`Bạn có chắc muốn xóa "${item.title}" khỏi lộ trình không?`}
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={() => onDelete(item.id)}
      />
    </>
  );
}
