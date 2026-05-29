'use client';

import { useEffect, useState } from 'react';
import { InstructorProfile } from '@/types/instructor.types';
import { instructorApi } from '@/lib/api/instructor.api';
import {
  Search,
  UserCheck,
  Star,
  Users,
  BookOpen,
  Trash2,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInstructorsPage() {
  const [instructors, setInstructors] = useState<InstructorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
    const searchLower = search.toLowerCase();
    return (
      inst.userId.toLowerCase().includes(searchLower) ||
      (inst.expertise || '').toLowerCase().includes(searchLower)
    );
  });

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
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo ID User, chuyên môn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Chuyên môn</th>
                <th className="px-6 py-4">Thông số</th>
                <th className="px-6 py-4">Liên kết</th>
                <th className="px-6 py-4">Ngày đăng ký</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin mb-4" />
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredInstructors.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <UserCheck className="w-12 h-12 text-gray-300 mb-3" />
                      <p>Không tìm thấy hồ sơ giảng viên nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInstructors.map((inst) => (
                  <tr
                    key={inst._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {inst.userId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {inst.expertise || 'Chưa cập nhật'}
                        </span>
                        {inst.bio && (
                          <span
                            className="text-xs text-gray-500 line-clamp-1 max-w-[200px]"
                            title={inst.bio}
                          >
                            {inst.bio}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
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
                            {inst.rating ? inst.rating.toFixed(1) : 'Chưa có'}{' '}
                            điểm
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {inst.websiteUrl ? (
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
                        <span className="text-gray-400 italic text-xs">
                          Không có
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {inst.createdAt
                        ? new Date(inst.createdAt).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(inst._id)}
                        disabled={isDeleting === inst._id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Xóa hồ sơ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
