'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ScrollText, Search, Server, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';
import { AuditLog } from '@/types/system-log.types';
import { auditLogApi } from '@/lib/api/system-log.api';

function actorLabel(actor: AuditLog['actorId']) {
  if (typeof actor === 'string') return actor;
  return actor.email || actor.name || actor._id;
}

export default function AdminLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await auditLogApi.getAll();
      setAuditLogs(res.data || []);
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
      toast.error('Lỗi khi tải dữ liệu nhật ký');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhật ký này?')) return;

    try {
      setIsDeleting(id);
      await auditLogApi.delete(id);
      toast.success('Đã xóa nhật ký');
      fetchLogs();
    } catch (error) {
      console.error('Failed to delete log', error);
      toast.error('Lỗi khi xóa nhật ký');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredLogs = useMemo(() => {
    const searchLower = search.toLowerCase();
    return auditLogs.filter((log) => {
      return (
        log.action.toLowerCase().includes(searchLower) ||
        log.resource.toLowerCase().includes(searchLower) ||
        actorLabel(log.actorId).toLowerCase().includes(searchLower) ||
        (log.resourceId || '').toLowerCase().includes(searchLower)
      );
    });
  }, [auditLogs, search]);

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-[#2d6a4f]" />
            Nhật ký hệ thống
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi các thao tác thay đổi dữ liệu được ghi trong audit logs.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <div className="flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 bg-white border-b-2 border-[#2d6a4f] text-[#2d6a4f]">
            <Server className="w-4 h-4" />
            Audit Logs
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hành động, actor, tài nguyên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/20 focus:border-[#2d6a4f] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="px-6 py-4">Tài khoản</th>
                <th className="px-6 py-4">Hành động</th>
                <th className="px-6 py-4">Tài nguyên</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin mb-4" />
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Activity className="w-12 h-12 text-gray-300 mb-3" />
                      <p>Không có nhật ký hệ thống nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-gray-900">
                          {actorLabel(log.actorId)}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-gray-500 mt-1 flex items-center gap-1">
                          <User className="w-3 h-3" /> {log.actorRole}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase bg-gray-100 text-gray-800 border border-gray-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#2d6a4f]">{log.resource}</span>
                        {log.resourceId && (
                          <span className="font-mono text-[10px] text-gray-500 mt-0.5">
                            {log.resourceId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(log._id)}
                        disabled={isDeleting === log._id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
