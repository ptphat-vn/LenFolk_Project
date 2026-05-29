'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Plus,
  Search,
  Users,
  ShieldCheck,
  GraduationCap,
  UserCheck,
  Filter,
  MoreVertical,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { userApi } from '@/lib/api/user.api';
import { User, Role, CreateUserInput, UpdateUserInput } from '@/types/user.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const ROLE_STYLE: Record<Role, { label: string; cls: string }> = {
  admin:      { label: 'Admin',      cls: 'bg-[#1a3a2a] text-white' },
  instructor: { label: 'Giảng viên', cls: 'bg-violet-100 text-violet-700' },
  moderator:  { label: 'Moderator',  cls: 'bg-amber-100 text-amber-700' },
  learner:    { label: 'Học viên',   cls: 'bg-blue-100 text-blue-700' },
  guest:      { label: 'Khách',      cls: 'bg-gray-100 text-gray-500' },
};

const ROLES: Role[] = ['admin', 'instructor', 'moderator', 'learner', 'guest'];

const PAGE_SIZE = 12;

// ─── Animations ───────────────────────────────────────────────────────────────
const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } } };

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, iconBg, iconColor }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; iconBg: string; iconColor: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
          <p className="text-[12px] text-gray-500">{label}</p>
          {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Create / Edit Modal ───────────────────────────────────────────────────────
function UserFormModal({
  open,
  onClose,
  onSave,
  editUser,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateUserInput | UpdateUserInput, id?: string) => Promise<void>;
  editUser: User | null;
}) {
  const isEdit = !!editUser;
  const [form, setForm] = useState({
    name: '',
    email: '',
    passwordHash: '',
    role: 'learner' as Role,
    phoneNumber: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      if (editUser) {
        setForm({
          name: editUser.name,
          email: editUser.email,
          passwordHash: '',
          role: editUser.role,
          phoneNumber: editUser.phoneNumber ?? '',
          isActive: editUser.isActive ?? true,
        });
      } else {
        setForm({ name: '', email: '', passwordHash: '', role: 'learner', phoneNumber: '', isActive: true });
      }
    }
  }, [open, editUser]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEdit && editUser) {
        const body: UpdateUserInput = { name: form.name, role: form.role, phoneNumber: form.phoneNumber || undefined, isActive: form.isActive };
        await onSave(body, editUser._id);
      } else {
        const body: CreateUserInput = { name: form.name, email: form.email, passwordHash: form.passwordHash, role: form.role, phoneNumber: form.phoneNumber || undefined };
        await onSave(body);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">
            {isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">Họ tên *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]" placeholder="Nguyễn Văn A" />
          </div>

          {!isEdit && (
            <>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1">Email *</label>
                <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required type="email"
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1">Mật khẩu *</label>
                <input value={form.passwordHash} onChange={e => setForm(p => ({ ...p, passwordHash: e.target.value }))} required type="password" minLength={6}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]" placeholder="Tối thiểu 6 ký tự" />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Vai trò</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as Role }))}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_STYLE[r].label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input value={form.phoneNumber} onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]" placeholder="0901234567" />
            </div>
          </div>

          {isEdit && (
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}>
                {form.isActive
                  ? <ToggleRight className="w-8 h-8 text-[#2d6a4f]" />
                  : <ToggleLeft className="w-8 h-8 text-gray-400" />}
              </button>
              <span className="text-[13px] text-gray-700">Tài khoản đang <strong>{form.isActive ? 'hoạt động' : 'bị khóa'}</strong></span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-[12px] text-red-600">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-9 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-9 rounded-lg bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] font-medium transition-colors disabled:opacity-60">
              {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo người dùng'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Delete Confirm ────────────────────────────────────────────────────────────
function DeleteConfirmModal({ user, onCancel, onConfirm, deleting }: {
  user: User; onCancel: () => void; onConfirm: () => void; deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-gray-900">Xóa người dùng</h3>
            <p className="text-[12px] text-gray-500 mt-0.5">Hành động này không thể hoàn tác</p>
          </div>
        </div>
        <p className="text-[13px] text-gray-600 mb-5">
          Bạn có chắc muốn xóa <strong>{user.name}</strong> ({user.email})?
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel}
            className="flex-1 h-9 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Hủy
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 h-9 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium transition-colors disabled:opacity-60">
            {deleting ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Row Actions Dropdown ─────────────────────────────────────────────────────
function RowActions({ user, onEdit, onDelete, onToggleActive }: {
  user: User; onEdit: () => void; onDelete: () => void; onToggleActive: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(p => !p)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 w-44">
            <button onClick={() => { onEdit(); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors">
              <Pencil className="w-3.5 h-3.5 text-gray-400" /> Chỉnh sửa
            </button>
            <button onClick={() => { onToggleActive(); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors">
              {user.isActive
                ? <><ToggleLeft className="w-3.5 h-3.5 text-amber-400" /> Khóa tài khoản</>
                : <><ToggleRight className="w-3.5 h-3.5 text-emerald-500" /> Kích hoạt</>}
            </button>
            <div className="my-1 border-t border-gray-100" />
            <button onClick={() => { onDelete(); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Xóa người dùng
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userApi.getUsers({ limit: 500 });
      if (Array.isArray(res.data)) setUsers(res.data);
    } catch (e) {
      console.error('[Users] fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    instructors: users.filter(u => u.role === 'instructor').length,
    learners: users.filter(u => u.role === 'learner').length,
    active: users.filter(u => u.isActive !== false).length,
  }), [users]);

  // Filtered
  const filtered = useMemo(() => {
    return users.filter(u => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter === 'active' && u.isActive === false) return false;
      if (statusFilter === 'inactive' && u.isActive !== false) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => setPage(1), [search, roleFilter, statusFilter]);

  // Handlers
  const handleSave = async (data: CreateUserInput | UpdateUserInput, id?: string) => {
    if (id) {
      await userApi.updateUser(id, data as UpdateUserInput);
    } else {
      await userApi.createUser(data as CreateUserInput);
    }
    await fetchUsers();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await userApi.deleteUser(deleteTarget._id);
      setUsers(prev => prev.filter(u => u._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (e) {
      console.error('[Users] delete error:', e);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await userApi.updateUser(user._id, { isActive: !user.isActive });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
    } catch (e) {
      console.error('[Users] toggle error:', e);
    }
  };

  return (
    <motion.div className="p-6 space-y-6 max-w-[1400px]" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-sm text-gray-500 mt-0.5">Toàn bộ tài khoản trên nền tảng LenFolk</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setFormOpen(true); }}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm người dùng
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}         label="Tổng người dùng"  value={stats.total}       iconBg="bg-blue-50"    iconColor="text-blue-600" />
        <StatCard icon={GraduationCap} label="Giảng viên"       value={stats.instructors} iconBg="bg-violet-50"  iconColor="text-violet-600" />
        <StatCard icon={UserCheck}     label="Học viên"         value={stats.learners}    iconBg="bg-emerald-50" iconColor="text-[#2d6a4f]" />
        <StatCard icon={ShieldCheck}   label="Đang hoạt động"   value={stats.active}      iconBg="bg-amber-50"   iconColor="text-amber-600" />
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-3 p-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm tên, email..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-gray-50"
            />
          </div>

          {/* Role filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as Role | 'all')}
              className="h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white"
            >
              <option value="all">Tất cả vai trò</option>
              {ROLES.map(r => <option key={r} value={r}>{ROLE_STYLE[r].label}</option>)}
            </select>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khóa</option>
          </select>

          <span className="text-[12px] text-gray-400 ml-auto">
            {filtered.length} kết quả
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-gray-100 bg-gray-50">
                {['Người dùng', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tạo', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-4 bg-gray-100 rounded-md w-24" />
                        </td>
                      ))}
                    </tr>
                  ))
                : paginated.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-400">
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-[14px]">Không tìm thấy người dùng nào</p>
                      </td>
                    </tr>
                  )
                  : paginated.map(u => {
                      const role = ROLE_STYLE[u.role] ?? { label: u.role, cls: 'bg-gray-100 text-gray-500' };
                      const isActive = u.isActive !== false;
                      return (
                        <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2d6a4f] to-[#1a3a2a] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                                {u.name?.[0]?.toUpperCase() ?? 'U'}
                              </div>
                              <span className="text-[13px] font-medium text-gray-900">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-[13px] text-gray-500">{u.email}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${role.cls}`}>{role.label}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                              {isActive ? 'Hoạt động' : 'Đã khóa'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[13px] text-gray-400">{formatDate(u.createdAt)}</td>
                          <td className="px-5 py-3.5">
                            <RowActions
                              user={u}
                              onEdit={() => { setEditTarget(u); setFormOpen(true); }}
                              onDelete={() => setDeleteTarget(u)}
                              onToggleActive={() => handleToggleActive(u)}
                            />
                          </td>
                        </tr>
                      );
                    })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <span className="text-[12px] text-gray-400">
              Trang {page} / {totalPages} · {filtered.length} người dùng
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 text-[12px] font-medium rounded-lg border transition-colors ${p === page ? 'bg-[#1a3a2a] text-white border-transparent' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editUser={editTarget}
      />
      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </motion.div>
  );
}
