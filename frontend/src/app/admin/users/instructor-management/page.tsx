'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { InstructorProfile } from '@/types/instructor.types';
import { instructorApi } from '@/lib/api/instructor.api';
import {
  UserCheck,
  Star,
  Users,
  BookOpen,
  Trash2,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { FilterInput } from '@/common/filter/FilterInput';
import { DataTable, Column } from '@/common/table/DataTable';

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  async function fetchInstructors() {
    try {
      setLoading(true);
      const res = await instructorApi.getAll();
      setInstructors(res.data || []);
    } catch (error) {
      console.error('Failed to fetch instructors', error);
      toast.error('Lỗi khi tải dữ liệu giảng viên');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInstructors();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Bạn có chắc chắn muốn xóa hồ sơ giảng viên này? Hành động này không thể hoàn tác.',
      )
    )
      return;

    try {
      setIsDeleting(id);
      await instructorApi.delete(id);
      toast.success('Đã xóa hồ sơ giảng viên');
      fetchInstructors();
    } catch (error) {
      console.error('Failed to delete instructor', error);
      toast.error('Lỗi khi xóa hồ sơ');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredInstructors = instructors.filter((inst) => {
    const searchLower = debouncedSearch.toLowerCase();
    return (
      inst.userId.toLowerCase().includes(searchLower) ||
      (inst.expertise || '').toLowerCase().includes(searchLower)
    );
  });

  const columns: Column<InstructorProfile>[] = [
    {
      header: 'User ID',
      render: (inst) => (
        <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">
          {inst.userId}
        </span>
      ),
    },
    {
      header: 'Chuyên môn',
      render: (inst) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {inst.expertise || 'Chưa cập nhật'}
          </span>
          {inst.bio && (
            <span
              className="text-xs text-gray-500 line-clamp-1 max-w-50"
              title={inst.bio}
            >
              {inst.bio}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Thông số',
      render: (inst) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <BookOpen className="w-3.5 h-3.5 text-[#2d6a4f]" />
            <span>{inst.totalCourses || 0} khóa học</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>{inst.totalStudents || 0} học viên</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {inst.rating ? inst.rating.toFixed(1) : 'Chưa có'} điểm
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Liên kết',
      render: (inst) =>
        inst.websiteUrl ? (
          <a
            href={inst.websiteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#2d6a4f] hover:underline"
          >
            <Globe className="w-3.5 h-3.5" />
            Website
          </a>
        ) : (
          <span className="text-gray-400 italic text-xs">Không có</span>
        ),
    },
    {
      header: 'Ngày đăng ký',
      render: (inst) => (
        <span className="text-gray-500">
          {inst.createdAt
            ? new Date(inst.createdAt).toLocaleDateString('vi-VN')
            : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      className: 'text-right',
      render: (inst) => (
        <div className="flex justify-end">
          <button
            onClick={() => handleDelete(inst._id)}
            disabled={isDeleting === inst._id}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Xóa hồ sơ"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#2d6a4f]" />
            Quản lý giảng viên
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Xem và quản lý hồ sơ của các giảng viên trên hệ thống
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <FilterInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm theo ID User, chuyên môn..."
            className="w-full sm:w-80"
          />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredInstructors}
          isLoading={loading}
          emptyIcon={UserCheck}
          emptyMessage="Không tìm thấy hồ sơ giảng viên nào"
          keyExtractor={(inst) => inst._id}
        />
      </div>
    </div>
  );
}
