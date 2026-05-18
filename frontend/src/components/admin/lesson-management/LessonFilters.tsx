'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

export interface LessonFilterState {
  search: string;
  status: string;
  level: string;
  type: string;
}

interface LessonFiltersProps {
  filters: LessonFilterState;
  onChange: (filters: LessonFilterState) => void;
  resultCount: number;
}

export function LessonFilters({
  filters,
  onChange,
  resultCount,
}: LessonFiltersProps) {
  const set = (key: keyof LessonFilterState, value: string) =>
    onChange({ ...filters, [key]: value });

  const hasActive =
    filters.search ||
    filters.status !== 'all' ||
    filters.level !== 'all' ||
    filters.type !== 'all';

  const reset = () =>
    onChange({ search: '', status: 'all', level: 'all', type: 'all' });

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Tìm kiếm bài học..."
            className="pl-8 h-8 text-[13px] border-gray-200 focus-visible:ring-[#2d6a4f]/30"
          />
        </div>

        {/* Status */}
        <Select value={filters.status} onValueChange={(v) => set('status', v)}>
          <SelectTrigger className="h-8 w-35 text-[13px] border-gray-200">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="published">Đã xuất bản</SelectItem>
            <SelectItem value="draft">Bản nháp</SelectItem>
            <SelectItem value="archived">Lưu trữ</SelectItem>
          </SelectContent>
        </Select>

        {/* Level */}
        <Select value={filters.level} onValueChange={(v) => set('level', v)}>
          <SelectTrigger className="h-8 w-32.5 text-[13px] border-gray-200">
            <SelectValue placeholder="Cấp độ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi cấp độ</SelectItem>
            <SelectItem value="beginner">Căn bản</SelectItem>
            <SelectItem value="intermediate">Trung cấp</SelectItem>
            <SelectItem value="advanced">Nâng cao</SelectItem>
          </SelectContent>
        </Select>

        {/* Type */}
        <Select value={filters.type} onValueChange={(v) => set('type', v)}>
          <SelectTrigger className="h-8 w-30 text-[13px] border-gray-200">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi loại</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="exercise">Bài tập</SelectItem>
            <SelectItem value="theory">Lý thuyết</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear */}
        {hasActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-8 px-2 text-[12px] text-gray-400 hover:text-gray-700"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Xóa bộ lọc
          </Button>
        )}

        <span className="ml-auto text-[12px] text-gray-400">
          {resultCount} kết quả
        </span>
      </div>
    </div>
  );
}
