'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/types/badge.types';
import { badgeApi } from '@/lib/api/badge.api';
import {
  Award,
  Search,
  Plus,
  Trash2,
  Edit2,
  Trophy,
  Zap,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  async function fetchBadges() {
    try {
      setLoading(true);
      const res = await badgeApi.getAll();
      setBadges(res.data || []);
    } catch (error) {
      console.error('Failed to fetch badges', error);
      toast.error('Lỗi khi tải dữ liệu huy hiệu');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Bạn có chắc chắn muốn xóa huy hiệu này? Hành động này không thể hoàn tác.',
      )
    )
      return;

    try {
      setIsDeleting(id);
      await badgeApi.delete(id);
      toast.success('Đã xóa huy hiệu');
      fetchBadges();
    } catch (error) {
      console.error('Failed to delete badge', error);
      toast.error('Lỗi khi xóa huy hiệu');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredBadges = badges.filter((b) => {
    const searchLower = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(searchLower) ||
      b.type.toLowerCase().includes(searchLower)
    );
  });

  const getBadgeIcon = (iconName: string) => {
    // A simple mapper for string icon names to Lucide icons
    switch (iconName.toLowerCase()) {
      case 'trophy':
        return <Trophy className="w-5 h-5" />;
      case 'zap':
        return <Zap className="w-5 h-5" />;
      case 'check':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'book':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-[#2d6a4f]" />
            Quản lý Huy hiệu
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các danh hiệu, phần thưởng cho học viên
          </p>
        </div>
        <button
          onClick={() =>
            toast.info('Chức năng thêm huy hiệu đang được phát triển')
          }
          className="bg-[#2d6a4f] hover:bg-[#1a3a2a] text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Thêm huy hiệu mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, loại..."
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
                <th className="px-6 py-4 w-16 text-center">Icon</th>
                <th className="px-6 py-4">Tên Huy Hiệu</th>
                <th className="px-6 py-4">Phân loại</th>
                <th className="px-6 py-4">Điều kiện</th>
                <th className="px-6 py-4">Trạng thái</th>
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
              ) : filteredBadges.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Award className="w-12 h-12 text-gray-300 mb-3" />
                      <p>Không có huy hiệu nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBadges.map((badge) => (
                  <tr
                    key={badge._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-center">
                      <div className="w-10 h-10 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center border border-amber-200">
                        {getBadgeIcon(badge.icon)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {badge.name}
                        </span>
                        {badge.description && (
                          <span
                            className="text-xs text-gray-500 line-clamp-1 max-w-[200px]"
                            title={badge.description}
                          >
                            {badge.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                        {badge.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="text-gray-500 font-mono">
                          {badge.conditionKey}
                        </span>
                        <span className="font-bold text-gray-900">
                          &ge; {badge.conditionValue}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {badge.isActive !== false ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Vô hiệu
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            toast.info('Chức năng sửa đang được phát triển')
                          }
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(badge._id)}
                          disabled={isDeleting === badge._id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Xóa huy hiệu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
