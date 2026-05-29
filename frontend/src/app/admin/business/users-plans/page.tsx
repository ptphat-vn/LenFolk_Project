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
  X,
  RefreshCw,
  Calendar,
  Mail,
  Phone,
} from 'lucide-react';
import { userApi } from '@/lib/api/user.api';
import { subscriptionApi } from '@/lib/api/subscription.api';
import { User, Role } from '@/types/user.types';
import { Subscription } from '@/types/subscription.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const ROLE_STYLE: Record<Role, { label: string; cls: string }> = {
  admin:      { label: 'Admin',      cls: 'bg-[#1a3a2a] text-white' },
  instructor: { label: 'Giảng viên', cls: 'bg-violet-100 text-violet-700' },
  moderator:  { label: 'Moderator',  cls: 'bg-amber-100 text-amber-700' },
  learner:    { label: 'Học viên',   cls: 'bg-blue-100 text-blue-700' },
  guest:      { label: 'Khách',      cls: 'bg-gray-100 text-gray-500' },
};

const PAGE_SIZE = 12;

const container: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item: Variants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } } };

// ─── User Detail Drawer ───────────────────────────────────────────────────────
function UserDetailDrawer({
  user,
  isOpen,
  onClose,
  subscriptions,
}: {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
}) {
  if (!isOpen || !user) return null;

  const userSub = subscriptions.find(s => s._id === user.currentSubscription);
  const role = ROLE_STYLE[user.role] ?? { label: user.role, cls: 'bg-gray-100 text-gray-600' };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-[14px] font-bold text-gray-900">Chi tiết người dùng</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#2d6a4f] to-[#1a3a2a] text-white text-2xl font-bold flex items-center justify-center shadow-lg">
              {user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="text-center">
              <h3 className="text-[16px] font-bold text-gray-900">{user.name}</h3>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${role.cls}`}>{role.label}</span>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Email</p>
                <p className="text-[13px] text-gray-700 break-all">{user.email}</p>
              </div>
            </div>

            {user.phoneNumber && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Điện thoại</p>
                  <p className="text-[13px] text-gray-700">{user.phoneNumber}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Ngày tham gia</p>
                <p className="text-[13px] text-gray-700">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Gói đăng ký</p>
            {userSub ? (
              <div className="bg-linear-to-br from-[#1a3a2a] to-[#2d6a4f] rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4" />
                  <p className="text-[14px] font-bold">{userSub.name}</p>
                </div>
                <p className="text-[12px] text-white/70">{userSub.description || 'Không có mô tả'}</p>
                <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
                  <p className="text-[13px] font-bold">
                    {userSub.price === 0 ? 'Miễn phí' : `${userSub.price.toLocaleString('vi-VN')} ₫`}
                  </p>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">
                    {userSub.billingCycle === 'monthly' ? 'Hàng tháng' : userSub.billingCycle === 'quarterly' ? 'Hàng quý' : 'Hàng năm'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl text-gray-400">
                <Zap className="w-4 h-4" />
                <p className="text-[13px]">Chưa đăng ký gói nào</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Trạng thái tài khoản</p>
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${user.isActive !== false ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <span className={`w-2 h-2 rounded-full ${user.isActive !== false ? 'bg-emerald-500' : 'bg-red-400'}`} />
              <p className={`text-[13px] font-medium ${user.isActive !== false ? 'text-emerald-700' : 'text-red-600'}`}>
                {user.isActive !== false ? 'Đang hoạt động' : 'Đã bị khóa'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPlansPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');
  const [subFilter, setSubFilter] = useState<'all' | 'subscribed' | 'free'>('all');
  const [page, setPage] = useState(1);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersRes, subsRes] = await Promise.allSettled([
        userApi.getUsers({ limit: 500 }),
        subscriptionApi.getAll(),
      ]);
      if (usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data)) setUsers(usersRes.value.data);
      if (subsRes.status === 'fulfilled' && Array.isArray(subsRes.value.data)) setSubscriptions(subsRes.value.data);
    } catch (e) {
      console.error('[UserPlans] fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    learners: users.filter(u => u.role === 'learner').length,
    subscribed: users.filter(u => u.currentSubscription).length,
    instructors: users.filter(u => u.role === 'instructor').length,
  }), [users]);

  // Filtered
  const filtered = useMemo(() => users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (subFilter === 'subscribed' && !u.currentSubscription) return false;
    if (subFilter === 'free' && u.currentSubscription) return false;
    return true;
  }), [users, search, roleFilter, subFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [search, roleFilter, subFilter]);

  return (
    <motion.div className="p-6 space-y-6 max-w-[1400px]" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Người dùng & Gói đăng ký</h1>
          <p className="text-sm text-gray-500 mt-0.5">Xem học viên và gói đang sử dụng</p>
        </div>
        <button onClick={fetchAll}
          className="flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users,         label: 'Tổng người dùng',  value: stats.total,       iconBg: 'bg-blue-50',    iconColor: 'text-blue-600' },
          { icon: GraduationCap, label: 'Học viên',          value: stats.learners,    iconBg: 'bg-violet-50',  iconColor: 'text-violet-600' },
          { icon: Zap,           label: 'Có gói đăng ký',   value: stats.subscribed,  iconBg: 'bg-emerald-50', iconColor: 'text-[#2d6a4f]' },
          { icon: Users,         label: 'Giảng viên',        value: stats.instructors, iconBg: 'bg-amber-50',   iconColor: 'text-amber-600' },
        ].map(c => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${c.iconBg} flex items-center justify-center shrink-0`}>
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

      {/* Table */}
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên, email..."
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-gray-50" />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as Role | 'all')}
              className="h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white">
              <option value="all">Tất cả vai trò</option>
              {(['learner', 'instructor', 'admin', 'moderator', 'guest'] as Role[]).map(r => (
                <option key={r} value={r}>{ROLE_STYLE[r].label}</option>
              ))}
            </select>
          </div>
          <select value={subFilter} onChange={e => setSubFilter(e.target.value as typeof subFilter)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white">
            <option value="all">Tất cả</option>
            <option value="subscribed">Có gói đăng ký</option>
            <option value="free">Chưa đăng ký</option>
          </select>
          <span className="text-[12px] text-gray-400 ml-auto">{filtered.length} người dùng</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Người dùng', 'Vai trò', 'Gói đăng ký', 'Trạng thái', 'Tham gia', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-5 py-3.5"><div className="h-4 bg-gray-100 rounded w-24" /></td>)}
                    </tr>
                  ))
                : paginated.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-400">
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-[14px]">Không tìm thấy người dùng</p>
                      </td>
                    </tr>
                  )
                  : paginated.map(u => {
                      const role = ROLE_STYLE[u.role] ?? { label: u.role, cls: 'bg-gray-100 text-gray-600' };
                      const userSub = subscriptions.find(s => s._id === u.currentSubscription);
                      const isActive = u.isActive !== false;
                      return (
                        <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2d6a4f] to-[#1a3a2a] text-white text-[12px] font-bold flex items-center justify-center shrink-0">
                                {u.name?.[0]?.toUpperCase() ?? 'U'}
                              </div>
                              <div>
                                <p className="text-[13px] font-medium text-gray-900">{u.name}</p>
                                <p className="text-[11px] text-gray-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${role.cls}`}>{role.label}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            {userSub ? (
                              <div className="flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-[#2d6a4f]" />
                                <span className="text-[13px] font-medium text-gray-800">{userSub.name}</span>
                              </div>
                            ) : (
                              <span className="text-[12px] text-gray-400">Chưa đăng ký</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                              {isActive ? 'Hoạt động' : 'Đã khóa'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[12px] text-gray-400">{formatDate(u.createdAt)}</td>
                          <td className="px-5 py-3.5">
                            <button onClick={() => setSelectedUser(u)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
            <span className="text-[12px] text-gray-400">Trang {page}/{totalPages} · {filtered.length} người dùng</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
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
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* User Detail Drawer */}
      <UserDetailDrawer
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        subscriptions={subscriptions}
      />
    </motion.div>
  );
}
