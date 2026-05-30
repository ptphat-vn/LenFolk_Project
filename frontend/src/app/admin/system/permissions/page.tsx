'use client';

import { useEffect, useState } from 'react';
import { Permission } from '@/types/permission.types';
import { permissionApi } from '@/lib/api/permission.api';
import { Shield, Search, Plus, Trash2, Edit2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  async function fetchPermissions() {
    try {
      setLoading(true);
      const res = await permissionApi.getAll();
      setPermissions(res.data || []);
    } catch (error) {
      console.error('Failed to fetch permissions', error);
      toast.error('Lỗi khi tải danh sách quyền hạn');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Bạn có chắc chắn muốn xóa quyền này? Các vai trò sử dụng quyền này có thể bị ảnh hưởng.',
      )
    )
      return;

    try {
      setIsDeleting(id);
      await permissionApi.delete(id);
      toast.success('Đã xóa quyền hệ thống');
      fetchPermissions();
    } catch (error) {
      console.error('Failed to delete permission', error);
      toast.error('Lỗi khi xóa quyền');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredPermissions = permissions.filter((p) => {
    const searchLower = search.toLowerCase();
    return (
      p.action.toLowerCase().includes(searchLower) ||
      p.resource.toLowerCase().includes(searchLower) ||
      (p.description || '').toLowerCase().includes(searchLower)
    );
  });

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'read':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'create':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'update':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'delete':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'manage':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#2d6a4f]" />
            Phân quyền & Vai trò
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý danh sách các quyền hạn (Permissions) trên hệ thống
          </p>
        </div>
        <button
          onClick={() =>
            toast.info('Chức năng thêm quyền đang được phát triển')
          }
          className="bg-[#2d6a4f] hover:bg-[#1a3a2a] text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Tạo quyền mới
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hành động, tài nguyên..."
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
                <th className="px-6 py-4">Tài nguyên (Resource)</th>
                <th className="px-6 py-4">Hành động (Action)</th>
                <th className="px-6 py-4">Mô tả</th>
                <th className="px-6 py-4">Ngày tạo</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin mb-4" />
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPermissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Shield className="w-12 h-12 text-gray-300 mb-3" />
                      <p>Không có quyền hệ thống nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((permission) => (
                  <tr
                    key={permission._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {permission.resource}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getActionColor(permission.action)}`}
                      >
                        {permission.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">
                        {permission.description || (
                          <span className="italic text-gray-400">
                            Không có mô tả
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {permission.createdAt
                        ? new Date(permission.createdAt).toLocaleDateString(
                            'vi-VN',
                          )
                        : 'N/A'}
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
                          onClick={() => handleDelete(permission._id)}
                          disabled={isDeleting === permission._id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Xóa quyền"
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
