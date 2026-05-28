'use client';

import { MOCK_PATHS } from '@/lib/mock-content';
import { LearningPath, PathCategory } from '@/types/content.types';
import { BookOpen, Plus } from 'lucide-react';
import { useState } from 'react';
import { PathCard } from './PathCard';
import { PathFormDialog } from './PathFormDialog';
import { Button } from '@/components/ui/button';

interface PathListProps {
  category: PathCategory;
  categoryLabel: string;
}

export function PathList({ category, categoryLabel }: PathListProps) {
  const [paths, setPaths] = useState<LearningPath[]>(
    MOCK_PATHS.filter((p) => p.category === category),
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LearningPath | null>(null);

  const handleEdit = (path: LearningPath) => {
    setEditTarget(path);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setPaths((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSave = (data: Partial<LearningPath>) => {
    if (editTarget) {
      setPaths((prev) =>
        prev.map((p) =>
          p.id === editTarget.id
            ? {
                ...p,
                ...data,
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : p,
        ),
      );
    } else {
      const newPath: LearningPath = {
        id: `P${String(Date.now()).slice(-4)}`,
        totalLessons: 0,
        totalDuration: 0,
        enrolledCount: 0,
        completionRate: 0,
        lessonIds: [],
        createdAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        ...data,
      } as LearningPath;
      setPaths((prev) => [newPath, ...prev]);
    }
  };

  const published = paths.filter((p) => p.status === 'published').length;
  const draft = paths.filter((p) => p.status === 'draft').length;

  return (
    <div className="space-y-4">
      {/* Sub-header stats + action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[13px] text-gray-500">
          <span>
            <b className="text-gray-900">{paths.length}</b> lộ trình
          </span>
          <span className="text-gray-300">|</span>
          <span>
            <b className="text-emerald-600">{published}</b> xuất bản
          </span>
          <span>·</span>
          <span>
            <b className="text-amber-600">{draft}</b> nháp
          </span>
        </div>
        <Button
          size="sm"
          onClick={handleCreate}
          className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] h-8 gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm lộ trình
        </Button>
      </div>

      {/* Grid */}
      {paths.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-white border border-gray-200 rounded-xl">
          <BookOpen className="w-10 h-10 mb-3 text-gray-300" />
          <p className="text-[14px] font-medium text-gray-500">
            Chưa có lộ trình nào
          </p>
          <p className="text-[12px] text-gray-400 mt-1 mb-4">
            Tạo lộ trình đầu tiên trong nhóm {categoryLabel}
          </p>
          <Button
            size="sm"
            onClick={handleCreate}
            className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo ngay
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {paths.map((p) => (
            <PathCard
              key={p.id}
              path={p}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <PathFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        path={editTarget}
        category={category}
        onSave={handleSave}
      />
    </div>
  );
}
