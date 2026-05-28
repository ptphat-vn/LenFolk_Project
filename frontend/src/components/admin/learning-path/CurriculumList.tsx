'use client';

import { MOCK_CURRICULUM } from '@/lib/mock-content';
import { CurriculumItem, PathCategory } from '@/types/content.types';
import { Bot, BookOpen, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CurriculumItemRow } from './CurriculumItemRow';
import { CurriculumItemFormDialog } from './CurriculumItemFormDialog';
import { AISettingsModal } from './AISettingsModal';

interface CurriculumListProps {
  track: PathCategory;
  trackLabel: string;
}

export function CurriculumList({ track, trackLabel }: CurriculumListProps) {
  const [items, setItems] = useState<CurriculumItem[]>(() =>
    MOCK_CURRICULUM.filter((c) => c.track === track).sort(
      (a, b) => a.order - b.order,
    ),
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CurriculumItem | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const handleEdit = (item: CurriculumItem) => {
    setEditTarget(item);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      return filtered.map((c, i) => ({ ...c, order: i + 1 }));
    });
  };

  const handleSave = (data: Partial<CurriculumItem>) => {
    if (editTarget) {
      setItems((prev) =>
        prev.map((c) => (c.id === editTarget.id ? { ...c, ...data } : c)),
      );
    } else {
      const newItem: CurriculumItem = {
        id: `CI${String(Date.now()).slice(-4)}`,
        track,
        order: items.length + 1,
        session: `Buổi ${items.length + 1}`,
        title: '',
        type: 'lesson',
        description: '',
        ...data,
      };
      setItems((prev) => [...prev, newItem]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Panel header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-gray-900">
          Lộ Trình Học {trackLabel}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAiOpen(true)}
            className="text-[13px] h-8 gap-1.5 border-gray-200"
          >
            <Bot className="w-3.5 h-3.5" />
            Cài Đặt AI
          </Button>
          <Button
            size="sm"
            onClick={handleCreate}
            className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] h-8 gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm bài
          </Button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl"
            >
              <Skeleton className="w-4 h-4 shrink-0" />
              <Skeleton className="w-7 h-7 rounded-full shrink-0" />
              <Skeleton className="h-5 w-14 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <BookOpen className="w-10 h-10 mb-3 text-gray-300" />
          <p className="text-[14px] font-medium text-gray-500">
            Chưa có bài học nào
          </p>
          <p className="text-[12px] text-gray-400 mt-1 mb-4">
            Thêm bài học đầu tiên vào lộ trình {trackLabel}
          </p>
          <Button
            size="sm"
            onClick={handleCreate}
            className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm ngay
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <CurriculumItemRow
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CurriculumItemFormDialog
        key={editTarget?.id ?? 'new'}
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editTarget}
        onSave={handleSave}
      />

      <AISettingsModal
        open={aiOpen}
        onOpenChange={setAiOpen}
        trackLabel={trackLabel}
      />
    </div>
  );
}
