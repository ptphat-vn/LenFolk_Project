'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Users,
  Zap,
  Eye,
  RefreshCw,
  ChevronDown,
  Music,
  Layers,
} from 'lucide-react';
import { UserDetailDrawer } from '@/components/admin/users-plans/UserDetailDrawer';
import { userApi } from '@/lib/api/user.api';
import { enrollmentApi } from '@/lib/api/enrollment.api';
import { User } from '@/types/user.types';
import { Enrollment } from '@/types/enrollment.types';
import { FilterInput } from '@/common/filter/FilterInput';
import { FilterSelect } from '@/common/filter/FilterSelect';
import { DataTable, Column } from '@/common/table/DataTable';
import { Pagination } from '@/common/pagination/pagination';
import { ActionButton } from '@/common/button/ActionButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

function enrollUserId(en: Enrollment): string | undefined {
  return typeof en.userId === 'object'
    ? en.userId?._id
    : (en.userId ?? undefined);
}

/** Tên item đã populate trong enrollment (courseId.title / performanceId.title) */
function enrollItemTitle(en: Enrollment): string | undefined {
  const ref = en.itemType === 'course' ? en.courseId : en.performanceId;
  return typeof ref === 'object' ? (ref?.title ?? undefined) : undefined;
}

// ─── Gói đăng ký ──────────────────────────────────────────────────────────────
// Foundation = gói mặc định miễn phí — user chưa mua khoá học nào (courseId null)
// Technique  = đã mua khoá học
// Tác phẩm   = đã mua tiết mục (mua đứt từng bài)
type PackageKey = 'foundation' | 'technique' | 'performance';

const PACKAGE_STYLE: Record<
  PackageKey,
  { label: string; cls: string; dot: string; icon: typeof Zap }
> = {
  foundation: {
    label: 'Foundation',
    cls: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
    icon: Layers,
  },
  technique: {
    label: 'Technique',
    cls: 'bg-emerald-50 text-emerald-700',
    dot: 'bg-emerald-500',
    icon: Zap,
  },
  performance: {
    label: 'Tác phẩm',
    cls: 'bg-amber-50 text-amber-700',
    dot: 'bg-amber-500',
    icon: Music,
  },
};

const PACKAGE_KEYS: PackageKey[] = ['foundation', 'technique', 'performance'];

interface UserPackage {
  key: PackageKey;
  /** Tên các item cụ thể trong gói — hiện ở dropdown chi tiết */
  items: string[];
}

/** Suy ra danh sách gói của 1 user từ các enrollment đang active */
function derivePackages(userEnrollments: Enrollment[]): UserPackage[] {
  const courses = userEnrollments.filter(
    (en) => en.itemType === 'course' && !!en.courseId,
  );
  const performances = userEnrollments.filter(
    (en) => en.itemType === 'performance',
  );

  const packages: UserPackage[] = [
    courses.length > 0
      ? {
          key: 'technique',
          items: courses.map((en) => enrollItemTitle(en) || 'Khóa học'),
        }
      : { key: 'foundation', items: [] },
  ];

  if (performances.length > 0)
    packages.push({
      key: 'performance',
      items: performances.map((en) => enrollItemTitle(en) || 'Tiết mục'),
    });

  return packages;
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

// ─── Ô "Gói đăng ký" ──────────────────────────────────────────────────────────
// 1 gói → hiện tên gói. Nhiều gói → hiện "N gói", bấm vào xem dropdown chi tiết.
function PackageCell({ packages }: { packages: UserPackage[] }) {
  if (packages.length === 0)
    return <span className="text-[12px] text-gray-400">—</span>;

  const isMulti = packages.length > 1;
  const single = packages[0];
  const SingleIcon = PACKAGE_STYLE[single.key].icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full cursor-pointer transition-opacity hover:opacity-80 ${
            isMulti ? 'bg-[#1a3a2a] text-white' : PACKAGE_STYLE[single.key].cls
          }`}
        >
          {isMulti ? (
            <>
              <Zap className="w-3 h-3" />
              {packages.length} gói
            </>
          ) : (
            <>
              <SingleIcon className="w-3 h-3" />
              {PACKAGE_STYLE[single.key].label}
            </>
          )}
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-auto min-w-56 max-w-72 p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
          Gói đang dùng
        </p>
        <div className="space-y-1.5">
          {packages.map((pkg) => {
            const style = PACKAGE_STYLE[pkg.key];
            const Icon = style.icon;
            return (
              <div key={pkg.key} className="rounded-lg bg-gray-50 px-2 py-1.5">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span className="text-[12px] font-semibold text-gray-800">
                    {style.label}
                  </span>
                  {pkg.items.length > 0 && (
                    <span className="text-[11px] text-gray-400">
                      ({pkg.items.length})
                    </span>
                  )}
                </div>
                {pkg.items.length > 0 ? (
                  <ul className="mt-1 space-y-0.5 pl-5">
                    {pkg.items.map((title, i) => (
                      <li
                        key={`${title}-${i}`}
                        className="flex items-start gap-1.5 text-[11px] text-gray-500"
                      >
                        <span
                          className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${style.dot}`}
                        />
                        <span className="truncate">{title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-0.5 pl-5 text-[11px] text-gray-400">
                    Gói miễn phí mặc định
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function UsersPlansPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [packageFilter, setPackageFilter] = useState<PackageKey | 'all'>('all');
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
      if (
        enrollRes.status === 'fulfilled' &&
        Array.isArray(enrollRes.value.data)
      )
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

  // Trang này chỉ quản lý người dùng — không hiện giảng viên / admin
  const learners = useMemo(
    () => users.filter((u) => u.role === 'user'),
    [users],
  );

  // Gom enrollment active theo userId (giữ nguyên bản ghi để lấy tên item)
  const enrollmentsByUser = useMemo(() => {
    const map = new Map<string, Enrollment[]>();
    enrollments.forEach((en) => {
      const uid = enrollUserId(en);
      if (!uid || en.status !== 'active') return;
      const list = map.get(uid);
      if (list) list.push(en);
      else map.set(uid, [en]);
    });
    return map;
  }, [enrollments]);

  // Gói của từng user
  const packagesByUser = useMemo(() => {
    const map = new Map<string, UserPackage[]>();
    learners.forEach((u) =>
      map.set(u._id, derivePackages(enrollmentsByUser.get(u._id) ?? [])),
    );
    return map;
  }, [learners, enrollmentsByUser]);

  // Stats — đếm theo gói
  const stats = useMemo(() => {
    const counts: Record<PackageKey, number> = {
      foundation: 0,
      technique: 0,
      performance: 0,
    };
    packagesByUser.forEach((pkgs) => pkgs.forEach((p) => (counts[p.key] += 1)));
    return { total: learners.length, ...counts };
  }, [learners, packagesByUser]);

  // Filtered
  const filtered = useMemo(
    () =>
      learners.filter((u) => {
        if (
          debouncedSearch &&
          !u.name.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
          !u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
          return false;
        if (
          packageFilter !== 'all' &&
          !(packagesByUser.get(u._id) ?? []).some((p) => p.key === packageFilter)
        )
          return false;
        return true;
      }),
    [learners, packagesByUser, debouncedSearch, packageFilter],
  );

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [debouncedSearch, packageFilter]);

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
      header: 'Gói đăng ký',
      render: (u) => <PackageCell packages={packagesByUser.get(u._id) ?? []} />,
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
        <span className="text-[12px] text-gray-400">
          {formatDate(u.createdAt)}
        </span>
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
      className="p-4 sm:p-6 space-y-4 sm:space-y-6 w-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Người dùng & Gói đăng ký
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            Xem học viên và gói đang sử dụng
          </p>
        </div>
        <ActionButton icon={RefreshCw} variant="outline" onClick={fetchAll} className="w-full sm:w-auto justify-center">
          Làm mới
        </ActionButton>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
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
            icon: Layers,
            label: 'Gói Foundation',
            value: stats.foundation,
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-500',
          },
          {
            icon: Zap,
            label: 'Gói Technique',
            value: stats.technique,
            iconBg: 'bg-emerald-50',
            iconColor: 'text-[#2d6a4f]',
          },
          {
            icon: Music,
            label: 'Mua tác phẩm',
            value: stats.performance,
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
            className="w-full sm:flex-1 sm:min-w-48"
          />
          <FilterSelect
            value={packageFilter}
            onChange={(v) => setPackageFilter(v as PackageKey | 'all')}
            options={PACKAGE_KEYS.map((k) => ({
              value: k,
              label: PACKAGE_STYLE[k].label,
            }))}
            placeholder="Tất cả gói"
            className="w-full sm:w-40"
          />
          <span className="w-full sm:w-auto text-[12px] text-gray-400 sm:ml-auto">
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
