'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { InstructorProfile, CreateInstructorProfileInput } from '@/types/instructor.types';
import { instructorApi } from '@/lib/api/instructor.api';
import {
  UserCheck,
  Star,
  Users,
  BookOpen,
  Trash2,
  Globe,
  Loader2,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { FilterInput } from '@/common/filter/FilterInput';
import { DataTable, Column } from '@/common/table/DataTable';
import { ActionButton } from '@/common/button/ActionButton';
import { Plus, Pencil } from 'lucide-react';
import { InstructorFormModal } from '@/components/admin/users/InstructorFormModal';

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InstructorProfile | null>(null);

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

  const handleSave = async (data: CreateInstructorProfileInput, id?: string) => {
    try {
      if (id) {
        await instructorApi.update(id, data);
        toast.success('Đã cập nhật hồ sơ giảng viên');
      } else {
        await instructorApi.create(data);
        toast.success('Đã tạo hồ sơ giảng viên');
      }
      fetchInstructors();
    } catch (error) {
      console.error('Failed to save instructor', error);
      toast.error('Lỗi khi lưu hồ sơ');
      throw error; // Let modal handle loading state
    }
  };

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
              className="text-xs text-gray-500 line-clamp-1 max-w-50 cursor-pointer hover:text-[#2d6a4f]"
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
        <div className="flex justify-end gap-1.5">
          <Link
            href={`/admin/users/instructor-management/${inst._id}`}
            className="p-1.5 rounded-md hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors cursor-pointer"
            title="Xem chi tiết"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              setEditTarget(inst);
              setFormOpen(true);
            }}
            className="p-1.5 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
            title="Chỉnh sửa hồ sơ"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(inst._id)}
            disabled={isDeleting === inst._id}
            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Xóa hồ sơ"
          >
            {isDeleting === inst._id ? (
              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
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
        <ActionButton
          icon={Plus}
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
        >
          Thêm hồ sơ
        </ActionButton>
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

      <InstructorFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editInstructor={editTarget}
      />
    </div>
  );
}
