'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Permission, CreatePermissionInput } from '@/types/permission.types';
import { permissionApi } from '@/lib/api/permission.api';
import {
  Shield,
  Plus,
  Trash2,
  Pencil,
  FileText,
  RefreshCw,
  Loader2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { FilterInput } from '@/common/filter/FilterInput';
import { FilterSelect } from '@/common/filter/FilterSelect';
import { DataTable, Column } from '@/common/table/DataTable';
import { ActionButton } from '@/common/button/ActionButton';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pagination } from '@/common/pagination/pagination';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ACTION_COLORS: Record<string, string> = {
  read:   'bg-blue-50 text-blue-700',
  create: 'bg-emerald-50 text-emerald-700',
  update: 'bg-amber-50 text-amber-700',
  delete: 'bg-red-50 text-red-600',
  manage: 'bg-purple-50 text-purple-700',
};

const COMMON_ACTIONS = ['read', 'create', 'update', 'delete', 'manage'];
const PAGE_SIZE = 10;

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

const DEFAULT_FORM: CreatePermissionInput = {
  action: 'read',
  resource: '',
  description: '',
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Permission | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePermissionInput>(DEFAULT_FORM);

  const fetchPermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await permissionApi.getAll();
      setPermissions(res.data || []);
    } catch {
      toast.error('Lỗi khi tải danh sách quyền hạn');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const stats = useMemo(() => {
    const byAction = Object.fromEntries(COMMON_ACTIONS.map((a) => [a, permissions.filter((p) => p.action === a).length]));
    return { total: permissions.length, byAction };
  }, [permissions]);

  const filtered = useMemo(() =>
    permissions.filter((p) => {
      const q = debouncedSearch.toLowerCase();
      if (q && !p.resource.toLowerCase().includes(q) && !p.action.toLowerCase().includes(q) && !(p.description ?? '').toLowerCase().includes(q)) return false;
      if (actionFilter !== 'all' && p.action !== actionFilter) return false;
      return true;
    }),
    [permissions, debouncedSearch, actionFilter]
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [debouncedSearch, actionFilter]);

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setFormOpen(true);
  };

  const openEdit = (perm: Permission) => {
    setEditTarget(perm);
    setForm({ action: perm.action, resource: perm.resource, description: perm.description ?? '' });
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.resource.trim() || !form.action.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    try {
      setIsSaving(true);
      if (editTarget) {
        await permissionApi.update(editTarget._id, form);
        toast.success('Đã cập nhật quyền hạn');
      } else {
        await permissionApi.create(form);
        toast.success('Đã tạo quyền hạn mới');
      }
      setFormOpen(false);
      fetchPermissions();
    } catch {
      toast.error('Lỗi khi lưu quyền hạn');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa quyền này? Các vai trò sử dụng quyền này có thể bị ảnh hưởng.')) return;
    try {
      setIsDeleting(id);
      await permissionApi.delete(id);
      toast.success('Đã xóa quyền hệ thống');
      setPermissions((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error('Lỗi khi xóa quyền');
    } finally {
      setIsDeleting(null);
    }
  };

  // ── Columns ─────────────────────────────────────────────────────────────────
  const columns: Column<Permission>[] = [
    {
      header: 'Tài nguyên',
      render: (p) => (
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="text-[13px] font-semibold text-gray-900">{p.resource}</span>
        </div>
      ),
    },
    {
      header: 'Hành động',
      render: (p) => (
        <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${ACTION_COLORS[p.action] ?? 'bg-gray-100 text-gray-600'}`}>
          {p.action}
        </span>
      ),
    },
    {
      header: 'Mô tả',
      render: (p) => (
        <span className="text-[13px] text-gray-500">{p.description || <span className="italic text-gray-300">Không có mô tả</span>}</span>
      ),
    },
    {
      header: 'Ngày tạo',
      render: (p) => (
        <span className="text-[12px] text-gray-400">
          {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : '—'}
        </span>
      ),
    },
    {
      header: '',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEdit(p)}
            className="p-1.5 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(p._id)}
            disabled={isDeleting === p._id}
            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting === p._id ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div className="p-6 space-y-6 w-full" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Phân quyền & Vai trò</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Quản lý danh sách các quyền hạn trên hệ thống</p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton icon={RefreshCw} variant="outline" onClick={fetchPermissions}>Làm mới</ActionButton>
          <ActionButton icon={Plus} onClick={openCreate}>Tạo quyền mới</ActionButton>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Tổng quyền', value: stats.total, color: 'bg-gray-50 text-gray-600' },
          { label: 'Read', value: stats.byAction.read, color: 'bg-blue-50 text-blue-700' },
          { label: 'Create', value: stats.byAction.create, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Update', value: stats.byAction.update, color: 'bg-amber-50 text-amber-700' },
          { label: 'Delete', value: stats.byAction.delete, color: 'bg-red-50 text-red-600' },
        ].map((c) => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.color}`}>
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{c.value}</p>
                <p className="text-[11px] text-gray-500">{c.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <FilterInput value={search} onChange={setSearch} placeholder="Tìm kiếm tài nguyên, hành động..." className="flex-1 min-w-48" />
          <FilterSelect
            value={actionFilter}
            onChange={setActionFilter}
            options={COMMON_ACTIONS.map((a) => ({ value: a, label: a.toUpperCase() }))}
            placeholder="Tất cả hành động"
            className="w-44"
          />
          <span className="text-[12px] text-gray-400 ml-auto">{filtered.length} quyền</span>
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          emptyIcon={Shield}
          emptyMessage="Chưa có quyền hạn nào"
          keyExtractor={(p) => p._id}
        />
        {!isLoading && filtered.length > PAGE_SIZE && (
          <div className="px-5 py-1 border-t border-gray-100">
            <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} showPageSizeSelector={false} />
          </div>
        )}
      </motion.div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#2d6a4f]" />
              {editTarget ? 'Chỉnh sửa quyền hạn' : 'Tạo quyền hạn mới'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} noValidate className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Tài nguyên (Resource) *</Label>
              <Input value={form.resource} onChange={(e) => setForm({ ...form, resource: e.target.value })} placeholder="vd: course, lesson, user..." />
            </div>
            <div className="space-y-1.5">
              <Label>Hành động (Action) *</Label>
              <select
                value={form.action}
                onChange={(e) => setForm({ ...form, action: e.target.value })}
                className="h-9 px-3 w-full rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white cursor-pointer"
              >
                {COMMON_ACTIONS.map((a) => (
                  <option key={a} value={a}>{a.toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Mô tả</Label>
              <Input value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn về quyền này" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isSaving} className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Đang lưu...' : editTarget ? 'Cập nhật' : 'Tạo quyền'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
