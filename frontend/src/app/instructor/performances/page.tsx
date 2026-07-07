'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { motion, Variants } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { Plus, PlayCircle } from 'lucide-react';
import { performanceApi } from '@/lib/api/performance.api';
import { Performance } from '@/types/performance.types';
import { FilterInput } from '@/common/filter/FilterInput';
import { FilterSelect } from '@/common/filter/FilterSelect';
import { ActionButton } from '@/common/button/ActionButton';
import { DataTable, Column } from '@/common/table/DataTable';
import { Pagination } from '@/common/pagination/pagination';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import Image from 'next/image';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const PAGE_SIZE = 12;

// ─── Animations ───────────────────────────────────────────────────────────────
const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
};

export default function InstructorPerformancesPage() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'published' | 'pending' | 'archived'
  >('all');
  const [page, setPage] = useState(1);
  const user = useAuthStore((state) => state.user);

  const fetchPerformances = async () => {
    setIsLoading(true);
    try {
      // Nếu API hỗ trợ lọc theo instructorId, thêm vào params ở đây.
      // Tạm thời lấy tất cả và lọc ở client nếu cần, hoặc giả sử API tự lọc nếu gọi bằng role instructor.
      const res = await performanceApi.getAll();
      if (Array.isArray(res.data)) {
        // Lọc các tiết mục của chính giảng viên này (đề phòng API trả về tất cả)
        const myPerformances = res.data.filter((p) =>
          typeof p.instructorId === 'object'
            ? p.instructorId._id === user?._id
            : p.instructorId === user?._id,
        );

        setPerformances(myPerformances);
      }
    } catch (e) {
      console.error('[Performances] fetch error:', e);
      toast.error('Có lỗi xảy ra khi tải danh sách tiết mục');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPerformances();
    }
  }, [user]);

  // Filtered
  const filtered = useMemo(() => {
    return performances.filter((p) => {
      if (
        debouncedSearch &&
        !p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
        return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      return true;
    });
  }, [performances, debouncedSearch, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => setPage(1), [debouncedSearch, statusFilter]);

  const columns: Column<Performance>[] = [
    {
      header: 'Tiết mục',
      render: (p) => (
        <div className="flex items-center gap-3">
          {(p.imageUrls?.[0] || p.thumbnail) ? (
            <Image
              src={(p.imageUrls?.[0] || p.thumbnail)!}
              alt={p.title}
              width={40}
              height={40}
              className="w-10 h-10 rounded-md object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
              <PlayCircle className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <span className="text-[13px] font-medium text-gray-900 line-clamp-2">
            {p.title}
          </span>
        </div>
      ),
    },
    {
      header: 'Thể loại',
      render: (p) => (
        <span className="text-[13px] text-gray-500">{p.genre || '—'}</span>
      ),
    },
    {
      header: 'Trạng thái',
      render: (p) => {
        const statusMap: Record<
          string,
          { label: string; cls: string; dot: string }
        > = {
          published: {
            label: 'Đã xuất bản',
            cls: 'bg-emerald-50 text-emerald-700',
            dot: 'bg-emerald-500',
          },
          pending: {
            label: 'Chờ duyệt',
            cls: 'bg-amber-50 text-amber-700',
            dot: 'bg-amber-500',
          },
          archived: {
            label: 'Đã lưu trữ',
            cls: 'bg-red-50 text-red-600',
            dot: 'bg-red-400',
          },
        };
        const s = statusMap[p.status] || {
          label: p.status,
          cls: 'bg-gray-100 text-gray-500',
          dot: 'bg-gray-400',
        };

        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${s.cls}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        );
      },
    },
    {
      header: 'Loại',
      render: (p) => (
        <span className="text-[12px] text-gray-500 font-medium">
          {p.isFree ? 'Miễn phí' : 'Trả phí'}
        </span>
      ),
    },
    {
      header: 'Ngày tạo',
      render: (p) => (
        <span className="text-[13px] text-gray-400">
          {formatDate(p.createdAt)}
        </span>
      ),
    },
    {
      header: '',
      render: (p) => (
        <div className="flex items-center justify-end">
          <Link
            href={`/instructor/performances/${p._id}/edit`}
            className="text-[12px] font-medium text-blue-600 hover:text-blue-800"
          >
            Sửa
          </Link>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      className="p-6 space-y-6 w-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tiết mục của tôi</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý các tiết mục biểu diễn mà bạn đã tạo
          </p>
        </div>
        <Link href="/instructor/performances/create">
          <ActionButton
            className=" bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            icon={Plus}
          >
            Thêm tiết mục mới
          </ActionButton>
        </Link>
      </motion.div>

      {/* Filters & Table */}
      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="flex flex-wrap items-center gap-3 p-4">
          <FilterInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm tên tiết mục..."
            className="flex-1 min-w-55"
          />

          <FilterSelect
            value={statusFilter}
            onChange={(val) =>
              setStatusFilter(
                val as 'all' | 'published' | 'pending' | 'archived',
              )
            }
            options={[
              { label: 'Tất cả', value: 'all' },
              { label: 'Đã xuất bản', value: 'published' },
              { label: 'Chờ duyệt', value: 'pending' },
              { label: 'Đã lưu trữ', value: 'archived' },
            ]}
            placeholder="Tất cả trạng thái"
          />

          <span className="text-[12px] text-gray-400 ml-auto">
            {filtered.length} kết quả
          </span>
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          emptyIcon={PlayCircle}
          emptyMessage="Bạn chưa tạo tiết mục nào"
          keyExtractor={(p) => p._id}
          indexOffset={(page - 1) * PAGE_SIZE}
        />

        {!isLoading && filtered.length > PAGE_SIZE && (
          <div className="px-5 py-1 border-t border-gray-100">
            <Pagination
              total={filtered.length}
              page={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
              showPageSizeSelector={false}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
