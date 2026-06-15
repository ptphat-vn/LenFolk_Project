'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Users,
  GraduationCap,
  Zap,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { UserDetailDrawer } from '@/components/admin/users-plans/UserDetailDrawer';
import { userApi } from '@/lib/api/user.api';
import { enrollmentApi } from '@/lib/api/enrollment.api';
import { User, Role } from '@/types/user.types';
import { Enrollment } from '@/types/enrollment.types';
import { FilterInput } from '@/common/filter/FilterInput';
import { FilterSelect } from '@/common/filter/FilterSelect';
import { DataTable, Column } from '@/common/table/DataTable';
import { Pagination } from '@/common/pagination/pagination';
import { ActionButton } from '@/common/button/ActionButton';
import { useDebounce } from '@/hooks/useDebounce';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d?: string | null) {
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
  user: { label: 'Người dùng', cls: 'bg-blue-100 text-blue-700' },
};

function enrollUserId(en: Enrollment): string | undefined {
  return typeof en.userId === 'object' ? en.userId?._id : en.userId ?? undefined;
}

const PAGE_SIZE = 12;

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

// ─── User Detail Drawer ───────────────────────────────────────────────────────

export default function UsersPlansPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [subFilter, setSubFilter] = useState<'all' | 'subscribed' | 'free'>(
    'all',
  );
  const [page, setPage] = useState(1);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, enrollRes] = await Promise.allSettled([
        userApi.getUsers({ limit: 500 }),
        enrollmentApi.getAll(),
      ]);
      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data))
        setUsers(usersRes.value.data);
      if (enrollRes.status === 'fulfilled' && Array.isArray(enrollRes.value.data))
        setEnrollments(enrollRes.value.data);
    } catch (e) {
      console.error('[UserPlans] fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Stats
  const stats = useMemo(
    () => ({
      total: users.length,
      learners: users.filter((u) => u.role === 'user').length,
      subscribed: users.filter((u) => u.isSubscribed).length,
      instructors: users.filter((u) => u.role === 'instructor').length,
    }),
    [users],
  );

  // Đếm số enrollment active theo userId
  const enrollCountByUser = useMemo(() => {
    const map = new Map<string, number>();
    enrollments.forEach((en) => {
      const uid = enrollUserId(en);
      if (uid && en.status === 'active') map.set(uid, (map.get(uid) ?? 0) + 1);
    });
    return map;
  }, [enrollments]);

  // Filtered
  const filtered = useMemo(
    () =>
      users.filter((u) => {
        if (
          debouncedSearch &&
          !u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
          !u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
          return false;
        if (roleFilter !== 'all' && u.role !== roleFilter) return false;
        if (subFilter === 'subscribed' && !u.isSubscribed) return false;
        if (subFilter === 'free' && u.isSubscribed) return false;
        return true;
      }),
    [users, search, roleFilter, subFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [debouncedSearch, roleFilter, subFilter]);

  const columns: Column<User>[] = [
    {
      header: 'Người dùng',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2d6a4f] to-[#1a3a2a] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
            {u.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="text-[13px] font-medium text-gray-900">{u.name}</p>
            <p className="text-[11px] text-gray-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Vai trò',
      render: (u) => {
        const role = ROLE_STYLE[u.role] ?? {
          label: u.role,
          cls: 'bg-gray-100 text-gray-600',
        };
        return (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${role.cls}`}
          >
            {role.label}
          </span>
        );
      },
    },
    {
      header: 'Đã đăng ký',
      render: (u) => {
        const count = enrollCountByUser.get(u._id) ?? 0;
        return u.isSubscribed || count > 0 ? (
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#2d6a4f]" />
            <span className="text-[13px] font-medium text-gray-800">
              {count > 0 ? `${count} mục` : 'Đã đăng ký'}
            </span>
          </div>
        ) : (
          <span className="text-[12px] text-gray-400">Chưa đăng ký</span>
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
            {isActive ? 'Hoạt động' : 'Đã khóa'}
          </span>
        );
      },
    },
    {
      header: 'Tham gia',
      render: (u) => (
        <span className="text-[12px] text-gray-400">{formatDate(u.createdAt)}</span>
      ),
    },
    {
      header: '',
      className: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => setSelectedUser(u)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
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
            Người dùng & Gói đăng ký
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Xem học viên và gói đang sử dụng
          </p>
        </div>
        <ActionButton icon={RefreshCw} variant="outline" onClick={fetchAll}>
          Làm mới
        </ActionButton>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            icon: Users,
            label: 'Tổng người dùng',
            value: stats.total,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
          },
          {
            icon: GraduationCap,
            label: 'Học viên',
            value: stats.learners,
            iconBg: 'bg-violet-50',
            iconColor: 'text-violet-600',
          },
          {
            icon: Zap,
            label: 'Có gói đăng ký',
            value: stats.subscribed,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-[#2d6a4f]',
          },
          {
            icon: Users,
            label: 'Giảng viên',
            value: stats.instructors,
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}
              >
                <c.icon className={`w-5 h-5 ${c.iconColor}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{c.value}</p>
                <p className="text-[12px] text-gray-500">{c.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Table Section */}
      <motion.div
        variants={item}
        className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
      >
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <FilterInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm tên, email..."
            className="flex-1 min-w-48"
          />
          <FilterSelect
            value={roleFilter}
            onChange={(v) => setRoleFilter(v as Role | 'all')}
            options={(['user', 'instructor', 'admin'] as Role[]).map((r) => ({
              value: r,
              label: ROLE_STYLE[r].label,
            }))}
            placeholder="Tất cả vai trò"
            className="w-40"
          />
          <FilterSelect
            value={subFilter}
            onChange={(v) => setSubFilter(v as 'all' | 'subscribed' | 'free')}
            options={[
              { value: 'subscribed', label: 'Có gói đăng ký' },
              { value: 'free', label: 'Chưa đăng ký' },
            ]}
            placeholder="Tất cả"
            className="w-40"
          />
          <span className="text-[12px] text-gray-400 ml-auto">
            {filtered.length} người dùng
          </span>
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          emptyIcon={Users}
          emptyMessage="Không tìm thấy người dùng"
          keyExtractor={(u) => u._id}
          indexOffset={(page - 1) * PAGE_SIZE}
          onRowClick={(u) => setSelectedUser(u)}
        />

        {/* Pagination */}
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

      {/* User Detail Drawer */}
      <UserDetailDrawer
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        enrollments={
          selectedUser
            ? enrollments.filter((en) => enrollUserId(en) === selectedUser._id)
            : []
        }
      />
    </motion.div>
  );
}
