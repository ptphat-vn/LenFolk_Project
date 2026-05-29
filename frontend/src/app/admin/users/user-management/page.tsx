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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { StatCard } from '@/components/admin/users/StatCard';
import { UserFormModal } from '@/components/admin/users/UserFormModal';
import { UserDeleteConfirmModal } from '@/components/admin/users/UserDeleteConfirmModal';
import { RowActions } from '@/components/admin/users/RowActions';
import { userApi } from '@/lib/api/user.api';
import {
  User,
  Role,
  CreateUserInput,
  UpdateUserInput,
} from '@/types/user.types';

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
  admin: { label: 'Admin', cls: 'bg-[#1a3a2a] text-white' },
  instructor: { label: 'Giảng viên', cls: 'bg-violet-100 text-violet-700' },
  moderator: { label: 'Moderator', cls: 'bg-amber-100 text-amber-700' },
  learner: { label: 'Học viên', cls: 'bg-blue-100 text-blue-700' },
  guest: { label: 'Khách', cls: 'bg-gray-100 text-gray-500' },
};

const ROLES: Role[] = ['admin', 'instructor', 'moderator', 'learner', 'guest'];

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

// ─── Sub-components ───────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
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

  useEffect(() => {
    fetchUsers();
  }, []);

  // Stats
  const stats = useMemo(
    () => ({
      total: users.length,
      instructors: users.filter((u) => u.role === 'instructor').length,
      learners: users.filter((u) => u.role === 'learner').length,
      active: users.filter((u) => u.isActive !== false).length,
    }),
    [users],
  );

  // Filtered
  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (
        search &&
        !u.name.toLowerCase().includes(search.toLowerCase()) &&
        !u.email.toLowerCase().includes(search.toLowerCase())
      )
        return false;
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
  const handleSave = async (
    data: CreateUserInput | UpdateUserInput,
    id?: string,
  ) => {
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
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
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
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isActive: !u.isActive } : u,
        ),
      );
    } catch (e) {
      console.error('[Users] toggle error:', e);
    }
  };

  return (
    <motion.div
      className="p-6 space-y-6 max-w-350"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Toàn bộ tài khoản trên nền tảng LenFolk
          </p>
        </div>
        <button
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm người dùng
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          icon={Users}
          label="Tổng người dùng"
          value={stats.total}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={GraduationCap}
          label="Giảng viên"
          value={stats.instructors}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <StatCard
          icon={UserCheck}
          label="Học viên"
          value={stats.learners}
          iconBg="bg-emerald-50"
          iconColor="text-[#2d6a4f]"
        />
        <StatCard
          icon={ShieldCheck}
          label="Đang hoạt động"
          value={stats.active}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-xl shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-3 p-4">
          {/* Search */}
          <div className="relative flex-1 min-w-55">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tên, email..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-gray-50"
            />
          </div>

          {/* Role filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | 'all')}
              className="h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white"
            >
              <option value="all">Tất cả vai trò</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_STYLE[r].label}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã khoá</option>
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
                {[
                  'Người dùng',
                  'Email',
                  'Vai trò',
                  'Trạng thái',
                  'Ngày tạo',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-gray-100 rounded-md w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-[14px]">Không tìm thấy người dùng nào</p>
                  </td>
                </tr>
              ) : (
                paginated.map((u) => {
                  const role = ROLE_STYLE[u.role] ?? {
                    label: u.role,
                    cls: 'bg-gray-100 text-gray-500',
                  };
                  const isActive = u.isActive !== false;
                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2d6a4f] to-[#1a3a2a] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                            {u.name?.[0]?.toUpperCase() ?? 'U'}
                          </div>
                          <span className="text-[13px] font-medium text-gray-900">
                            {u.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-500">
                        {u.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${role.cls}`}
                        >
                          {role.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-400'}`}
                          />
                          {isActive ? 'Hoạt động' : 'Đã khoá'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-400">
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <RowActions
                          user={u}
                          onEdit={() => {
                            setEditTarget(u);
                            setFormOpen(true);
                          }}
                          onDelete={() => setDeleteTarget(u)}
                          onToggleActive={() => handleToggleActive(u)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-[12px] font-medium rounded-lg border transition-colors ${p === page ? 'bg-[#1a3a2a] text-white border-transparent' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
        <UserDeleteConfirmModal
          user={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </motion.div>
  );
}
