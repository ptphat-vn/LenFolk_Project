'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { motion, Variants } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Plus,
 
  Users,
  ShieldCheck,
  GraduationCap,
  UserCheck,
 
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
import { FilterInput } from '@/common/filter/FilterInput';
import { FilterSelect } from '@/common/filter/FilterSelect';
import { ActionButton } from '@/common/button/ActionButton';
import { DataTable, Column } from '@/common/table/DataTable';
import { Pagination } from '@/common/pagination/pagination';

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
  const debouncedSearch = useDebounce(search, 500);
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
        debouncedSearch &&
        !u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        !u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
        return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter === 'active' && u.isActive === false) return false;
      if (statusFilter === 'inactive' && u.isActive !== false) return false;
      return true;
    });
  }, [users, debouncedSearch, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => setPage(1), [debouncedSearch, roleFilter, statusFilter]);

  // Handlers
  const handleSave = async (
    data: CreateUserInput | UpdateUserInput,
    id?: string,
  ) => {
    try {
      if (id) {
        const res = await userApi.updateUser(id, data as UpdateUserInput);
        toast.success(res.message || 'Cập nhật người dùng thành công');
      } else {
        const res = await userApi.createUser(data as CreateUserInput);
        toast.success(res.message || 'Tạo người dùng thành công');
      }
      await fetchUsers();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Có lỗi xảy ra');
      throw e;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await userApi.deleteUser(deleteTarget._id);
      toast.success(res.message || 'Đã xóa người dùng');
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (e: any) {
      console.error('[Users] delete error:', e);
      toast.error(e.response?.data?.message || 'Lỗi khi xóa người dùng');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const res = await userApi.updateUser(user._id, { isActive: !user.isActive });
      toast.success(res.message || 'Đã cập nhật trạng thái người dùng');
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isActive: !u.isActive } : u,
        ),
      );
    } catch (e: any) {
      console.error('[Users] toggle error:', e);
      toast.error(e.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'Người dùng',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2d6a4f] to-[#1a3a2a] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
            {u.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <span className="text-[13px] font-medium text-gray-900">
            {u.name}
          </span>
        </div>
      ),
    },
    {
      header: 'Email',
      render: (u) => <span className="text-[13px] text-gray-500">{u.email}</span>,
    },
    {
      header: 'Vai trò',
      render: (u) => {
        const role = ROLE_STYLE[u.role] ?? {
          label: u.role,
          cls: 'bg-gray-100 text-gray-500',
        };
        return (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${role.cls}`}>
            {role.label}
          </span>
        );
      },
    },
    {
      header: 'Trạng thái',
      render: (u) => {
        const isActive = u.isActive !== false;
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-400'}`}
            />
            {isActive ? 'Hoạt động' : 'Đã khoá'}
          </span>
        );
      },
    },
    {
      header: 'Ngày tạo',
      render: (u) => <span className="text-[13px] text-gray-400">{formatDate(u.createdAt)}</span>,
    },
    {
      header: '',
      render: (u) => (
        <RowActions
          user={u}
          onEdit={() => {
            setEditTarget(u);
            setFormOpen(true);
          }}
          onDelete={() => setDeleteTarget(u)}
          onToggleActive={() => handleToggleActive(u)}
        />
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
          <h1 className="text-xl font-bold text-gray-900">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Toàn bộ tài khoản trên nền tảng LenFolk
          </p>
        </div>
        <ActionButton
          icon={Plus}
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
        >
          Thêm người dùng
        </ActionButton>
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

      {/* Filters & Table */}
      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      >
        <div className="flex flex-wrap items-center gap-3 p-4">
          <FilterInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm kiếm tên, email..."
            className="flex-1 min-w-55"
          />

          <FilterSelect
            value={roleFilter}
            onChange={(val) => setRoleFilter(val as Role | 'all')}
            options={ROLES.map((r) => ({ label: ROLE_STYLE[r].label, value: r }))}
            placeholder="Tất cả vai all"
            icon
          />

          <FilterSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as 'active' | 'inactive' | 'all')}
            options={[
              { label: 'Đang hoạt động', value: 'active' },
              { label: 'Đã khoá', value: 'inactive' },
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
          emptyIcon={Users}
          emptyMessage="Không tìm thấy người dùng nào"
          keyExtractor={(u) => u._id}
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
