'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import { motion, Variants } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  DollarSign,
  GraduationCap,
  Layers,
  Music,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import { userApi } from '@/lib/api/user.api';
import { lessonApi } from '@/lib/api/lesson.api';
import { paymentApi } from '@/lib/api/payment.api';
import { courseApi } from '@/lib/api/course.api';
import { instructorApi } from '@/lib/api/instructor.api';
import { enrollmentApi } from '@/lib/api/enrollment.api';
import { User } from '@/types/user.types';
import { Lesson } from '@/types/lesson.types';
import { TransactionRecord, txUserName } from '@/types/payment.types';
import { Course } from '@/types/course.types';
import { InstructorProfile } from '@/types/instructor.types';
import { Enrollment } from '@/types/enrollment.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M ₫`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K ₫`;
  return `${amount.toLocaleString('vi-VN')} ₫`;
}

function formatDate(dateStr?: string | Date): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Tên người đăng ký — userId có thể là id thô hoặc object đã populate
function enrollmentUserName(userId: Enrollment['userId']): string {
  if (!userId) return 'Người dùng';
  if (typeof userId === 'string') return userId;
  return userId.name || userId.email || 'Người dùng';
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

// Doanh thu theo từng ngày trong 1 tháng (year, month 0-based) — đơn vị: triệu VND
// Chỉ tính giao dịch đã hoàn tất (status === 'success')
function getDailyRevenue(
  payments: TransactionRecord[],
  year: number,
  month: number,
): { month: string; revenue: number }[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totals = new Array<number>(daysInMonth).fill(0);
  payments
    .filter((p) => p.status === 'success')
    .forEach((p) => {
      if (!p.paidAt && !p.createdAt) return;
      const d = new Date(p.paidAt || p.createdAt!);
      if (d.getFullYear() === year && d.getMonth() === month) {
        totals[d.getDate() - 1] += p.amount || 0;
      }
    });
  return totals.map((total, i) => ({
    month: String(i + 1),
    revenue: parseFloat((total / 1_000_000).toFixed(2)),
  }));
}

// "YYYY-MM" của tháng hiện tại, dùng làm giá trị mặc định cho ô chọn tháng
function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const roleStyle: Record<string, string> = {
  user: 'bg-blue-50 text-blue-700',
  instructor: 'bg-violet-50 text-violet-700',
  admin: 'bg-[#1a3a2a] text-white',
};
const roleLabel: Record<string, string> = {
  user: 'Người dùng',
  instructor: 'Giảng viên',
  admin: 'Admin',
};

const txStatusStyle: Record<
  string,
  { label: string; cls: string; icon: typeof CheckCircle2 }
> = {
  success: {
    label: 'Hoàn tất',
    cls: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
    icon: CheckCircle2,
  },
  pending: {
    label: 'Chờ thanh toán',
    cls: 'text-amber-600 bg-amber-50 border border-amber-200',
    icon: Clock,
  },
  failed: {
    label: 'Thất bại',
    cls: 'text-red-600 bg-red-50 border border-red-200',
    icon: XCircle,
  },
  refunded: {
    label: 'Hoàn tiền',
    cls: 'text-purple-600 bg-purple-50 border border-purple-200',
    icon: XCircle,
  },
};

const lessonStatusStyle: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700',
  draft: 'bg-gray-100 text-gray-500',
  archived: 'bg-amber-50 text-amber-700',
};
const lessonStatusLabel: Record<string, string> = {
  published: 'Đã xuất bản',
  draft: 'Nháp',
  archived: 'Lưu trữ',
};

const courseStatusStyle: Record<string, string> = {
  published: 'bg-emerald-50 text-emerald-700',
  draft: 'bg-gray-100 text-gray-500',
  archived: 'bg-amber-50 text-amber-700',
};
const courseStatusLabel: Record<string, string> = {
  published: 'Công khai',
  draft: 'Nháp',
  archived: 'Lưu trữ',
};

// ─── Animation Variants ───────────────────────────────────────────────────────
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 24 },
  },
};

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
      <BookOpen className="w-8 h-8 mb-2 opacity-40" />
      <p className="text-[13px]">{label}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // KPI
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalInstructors, setTotalInstructors] = useState(0);
  const [successTxCount, setSuccessTxCount] = useState(0);

  // Lists
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentPayments, setRecentPayments] = useState<TransactionRecord[]>([]);
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  // Derived
  const [allPayments, setAllPayments] = useState<TransactionRecord[]>([]);
  const [revenueMonth, setRevenueMonth] = useState(currentMonthValue);
  const [userRoleBreakdown, setUserRoleBreakdown] = useState<
    { role: string; count: number }[]
  >([]);
  const [lessonStatusBreakdown, setLessonStatusBreakdown] = useState<
    { status: string; count: number }[]
  >([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [
          usersRes,
          lessonsRes,
          paymentsRes,
          coursesRes,
          instructorsRes,
          subsRes,
        ] = await Promise.allSettled([
          userApi.getUsers({ limit: 200 }),
          lessonApi.getAll({ limit: 200 }),
          paymentApi.getAll(),
          courseApi.getAll({ limit: 200 }),
          instructorApi.getAll(),
          enrollmentApi.getAll(),
        ]);

        // Users
        const usersData: User[] =
          usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data)
            ? usersRes.value.data
            : [];
        setTotalUsers(usersData.length);
        setRecentUsers(
          [...usersData]
            .sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime(),
            )
            .slice(0, 3),
        );

        // Role breakdown
        const roleMap: Record<string, number> = {};
        usersData.forEach((u) => {
          roleMap[u.role] = (roleMap[u.role] || 0) + 1;
        });
        setUserRoleBreakdown(
          Object.entries(roleMap)
            .map(([role, count]) => ({ role, count }))
            .sort((a, b) => b.count - a.count),
        );

        // Lessons
        const lessonsData: Lesson[] =
          lessonsRes.status === 'fulfilled' &&
          Array.isArray(lessonsRes.value.data)
            ? lessonsRes.value.data
            : [];
        setTotalLessons(lessonsData.length);
        setRecentLessons(
          [...lessonsData]
            .sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime(),
            )
            .slice(0, 5),
        );

        // Lesson status breakdown
        const statusMap: Record<string, number> = {};
        lessonsData.forEach((l) => {
          const s = l.status || 'draft';
          statusMap[s] = (statusMap[s] || 0) + 1;
        });
        setLessonStatusBreakdown(
          Object.entries(statusMap).map(([status, count]) => ({
            status,
            count,
          })),
        );

        // Payments
        const paymentsData: TransactionRecord[] =
          paymentsRes.status === 'fulfilled' &&
          Array.isArray(paymentsRes.value.data)
            ? paymentsRes.value.data
            : [];
        // Chỉ giao dịch "Hoàn tất" (success) mới được tính vào doanh thu
        const successPayments = paymentsData.filter(
          (p) => p.status === 'success',
        );
        const revenue = successPayments.reduce(
          (acc, p) => acc + (p.amount || 0),
          0,
        );
        setTotalRevenue(revenue);
        setSuccessTxCount(successPayments.length);
        setAllPayments(paymentsData);
        setRecentPayments(
          [...paymentsData]
            .sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime(),
            )
            .slice(0, 5),
        );

        // Courses
        const coursesData: Course[] =
          coursesRes.status === 'fulfilled' &&
          Array.isArray(coursesRes.value.data)
            ? coursesRes.value.data
            : [];
        setTotalCourses(coursesData.length);
        setRecentCourses(
          [...coursesData]
            .sort(
              (a, b) =>
                new Date(b.createdAt || 0).getTime() -
                new Date(a.createdAt || 0).getTime(),
            )
            .slice(0, 5),
        );

        // Instructors
        const instructorsData: InstructorProfile[] =
          instructorsRes.status === 'fulfilled' &&
          Array.isArray(instructorsRes.value.data)
            ? instructorsRes.value.data
            : [];
        setTotalInstructors(instructorsData.length);

        // Enrollments (đăng ký gần đây)
        const enrollData: Enrollment[] =
          subsRes.status === 'fulfilled' && Array.isArray(subsRes.value.data)
            ? subsRes.value.data
            : [];
        setEnrollments(enrollData);
      } catch (err) {
        console.error('[Dashboard] fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Doanh thu theo ngày trong tháng được chọn ────────────────────────────
  const [revYear, revMonth] = useMemo(() => {
    const [y, m] = revenueMonth.split('-').map(Number);
    return [y, m - 1] as const;
  }, [revenueMonth]);
  const chartData = useMemo(
    () => getDailyRevenue(allPayments, revYear, revMonth),
    [allPayments, revYear, revMonth],
  );
  const monthRevenue = useMemo(
    () =>
      allPayments
        .filter((p) => {
          if (p.status !== 'success') return false;
          if (!p.paidAt && !p.createdAt) return false;
          const d = new Date(p.paidAt || p.createdAt!);
          return d.getFullYear() === revYear && d.getMonth() === revMonth;
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0),
    [allPayments, revYear, revMonth],
  );
  const revenuePeriodLabel = `${String(revMonth + 1).padStart(2, '0')}/${revYear}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#2d6a4f]" />
          <p className="text-sm text-gray-400">Đang tải dữ liệu…</p>
        </div>
      </div>
    );
  }

  // ── KPI cards config ──────────────────────────────────────────────────────
  const KPI_CARDS: {
    label: string;
    value: string;
    sub: string;
    icon: typeof Users;
    iconBg: string;
    iconColor: string;
    href?: string;
  }[] = [
    {
      label: 'Tổng người dùng',
      value: totalUsers.toLocaleString('vi-VN'),
      sub: `${userRoleBreakdown.find((r) => r.role === 'user')?.count ?? 0} người dùng`,
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      href: '/admin/users/user-management',
    },
    {
      label: 'Doanh thu',
      value: formatCurrency(totalRevenue),
      sub: `${successTxCount.toLocaleString('vi-VN')} giao dịch hoàn tất`,
      icon: DollarSign,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-[#2d6a4f]',
      href: '/admin/business/revenue-reports',
    },
    {
      label: 'Bài học',
      value: totalLessons.toLocaleString('vi-VN'),
      sub: `${lessonStatusBreakdown.find((s) => s.status === 'published')?.count ?? 0} đã xuất bản`,
      icon: Music,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
      href: '/admin/content/lesson-management',
    },
    {
      label: 'Khoá học',
      value: totalCourses.toLocaleString('vi-VN'),
      sub: `${lessonStatusBreakdown.find((s) => s.status === 'draft')?.count ?? 0} bài nháp`,
      icon: Layers,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      href: '/admin/content/course-management',
    },
    {
      label: 'Giảng viên',
      value: totalInstructors.toLocaleString('vi-VN'),
      sub: 'Hồ sơ đã xác minh',
      icon: GraduationCap,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      href: '/admin/users/instructor-management',
    },
  ];

  return (
    <motion.div
      className="p-4 sm:p-6 space-y-4 sm:space-y-6 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl font-bold text-gray-900">Bảng điều khiển</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Xin chào,{' '}
          <span className="font-semibold text-gray-700">Quản trị viên</span> —
          tổng quan hoạt động hệ thống.
        </p>
      </motion.div>

      {/* ── Row 1: KPI ──────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4"
      >
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              onClick={card.href ? () => router.push(card.href!) : undefined}
              className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-shadow duration-300 ${
                card.href ? 'hover:shadow-md cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 leading-none tracking-tight">
                {card.value}
              </p>
              <p className="text-[12px] text-gray-500 mt-1.5 font-medium">
                {card.label}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          );
        })}
      </motion.div>

      {/* ── Row 2: Revenue chart + User role breakdown ──────────────────── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Revenue Chart */}
        <div
          onClick={() => router.push('/admin/business/revenue-reports')}
          className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#2d6a4f]" />
                Doanh thu trong tháng
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Theo từng ngày (đơn vị: triệu VND)
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="month"
                value={revenueMonth}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  e.stopPropagation();
                  setRevenueMonth(e.target.value);
                }}
                className="h-9 rounded-lg border border-gray-200 px-3 text-[13px] text-gray-700 outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20"
              />
              <div className="text-right">
                <p className="text-xl font-bold text-[#2d6a4f]">
                  {formatCurrency(monthRevenue)}
                </p>
                <p className="text-[11px] text-gray-400">
                  Tháng {revenuePeriodLabel}
                </p>
              </div>
            </div>
          </div>
          <div className="p-5">
            {monthRevenue > 0 ? (
              <RevenueChart data={chartData} periodLabel={revenuePeriodLabel} />
            ) : (
              <EmptyState
                label={`Chưa có doanh thu trong tháng ${revenuePeriodLabel}`}
              />
            )}
          </div>
        </div>

        {/* User role breakdown */}
        <div
          onClick={() => router.push('/admin/users/user-management')}
          className="bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Phân bổ người dùng
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {totalUsers} tài khoản tổng cộng
            </p>
          </div>
          <div className="px-5 py-4 space-y-4">
            {userRoleBreakdown.length > 0 ? (
              userRoleBreakdown.map(({ role, count }) => {
                const pct =
                  totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
                return (
                  <div key={role}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${roleStyle[role] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {roleLabel[role] ?? role}
                      </span>
                      <span className="text-[12px] font-semibold text-gray-700">
                        {count}
                        <span className="text-gray-400 font-normal ml-1">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2d6a4f] transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState label="Không có dữ liệu" />
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Row 3: Lesson status + Subscription plans ──────────────────── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Lesson status breakdown */}
        <div
          onClick={() => router.push('/admin/content/lesson-management')}
          className="bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                <Music className="w-4 h-4 text-violet-500" />
                Trạng thái bài học
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {totalLessons} bài học tổng cộng
              </p>
            </div>
          </div>
          <div className="px-5 py-4 space-y-4">
            {lessonStatusBreakdown.length > 0 ? (
              lessonStatusBreakdown.map(({ status, count }) => {
                const pct =
                  totalLessons > 0
                    ? Math.round((count / totalLessons) * 100)
                    : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${lessonStatusStyle[status] ?? 'bg-gray-100 text-gray-500'}`}
                      >
                        {lessonStatusLabel[status] ?? status}
                      </span>
                      <span className="text-[12px] font-semibold text-gray-700">
                        {count}
                        <span className="text-gray-400 font-normal ml-1">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          status === 'published'
                            ? 'bg-emerald-500'
                            : status === 'draft'
                              ? 'bg-gray-400'
                              : 'bg-amber-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState label="Chưa có bài học nào" />
            )}
          </div>
        </div>

        {/* Đăng ký gần đây */}
        <div
          onClick={() => router.push('/admin/business/users-plans')}
          className="bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Đăng ký gần đây
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {enrollments.length} lượt đăng ký
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {enrollments.length > 0 ? (
              enrollments.slice(0, 6).map((en) => {
                const item =
                  en.itemType === 'course'
                    ? typeof en.courseId === 'object'
                      ? en.courseId?.title
                      : undefined
                    : typeof en.performanceId === 'object'
                      ? en.performanceId?.title
                      : undefined;
                const learner = enrollmentUserName(en.userId);
                const typeLabel =
                  en.itemType === 'course' ? 'Khóa học' : 'Tiết mục';
                const ACTIVE = en.status === 'active';
                return (
                  <div
                    key={en._id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2d6a4f] to-[#1a3a2a] text-white font-bold text-[12px] flex items-center justify-center shrink-0">
                      {learner[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900 truncate">
                        {learner}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                        {typeLabel} · {item || typeLabel}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ACTIVE ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'}`}
                      >
                        {ACTIVE ? 'Đã kích hoạt' : 'Chờ duyệt'}
                      </span>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {formatDate(en.startDate || en.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState label="Chưa có lượt đăng ký" />
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Row 4: Recent courses + Recent transactions ─────────────────── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Recent Courses */}
        <div
          onClick={() => router.push('/admin/content/course-management')}
          className="bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                Khoá học mới nhất
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {totalCourses} khoá học tổng cộng
              </p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {recentCourses.length > 0 ? (
              recentCourses.map((course) => (
                <div
                  key={course._id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 truncate">
                      {course.title || 'Khoá học'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {course.totalLessons ?? 0} bài · {course.enrollCount ?? 0}{' '}
                      học viên
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${courseStatusStyle[course.status ?? 'draft'] ?? 'bg-gray-100 text-gray-500'}`}
                    >
                      {courseStatusLabel[course.status ?? 'draft'] ??
                        course.status}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {formatDate(course.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState label="Chưa có khoá học nào" />
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div
          onClick={() => router.push('/admin/business/transactions')}
          className="bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#2d6a4f]" />
                Giao dịch gần đây
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Cập nhật theo thời gian thực
              </p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPayments.length > 0 ? (
              recentPayments.map((tx) => {
                const st =
                  txStatusStyle[tx.status ?? 'pending'] ??
                  txStatusStyle['pending'];
                const StatusIcon = st.icon;
                return (
                  <div
                    key={tx._id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    <StatusIcon
                      className={`w-4 h-4 shrink-0 ${
                        tx.status === 'success'
                          ? 'text-emerald-500'
                          : tx.status === 'pending'
                            ? 'text-amber-500'
                            : 'text-red-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-gray-900 truncate">
                        {txUserName(tx.userId)}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {timeAgo(tx.paidAt || tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[13px] font-bold text-gray-900">
                        {formatCurrency(tx.amount || 0)}
                      </p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyState label="Chưa có giao dịch nào" />
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Row 5: Recent users + Recent lessons ─────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Recent users */}
        <div
          onClick={() => router.push('/admin/users/user-management')}
          className="bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Người dùng mới nhất
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                3 tài khoản đăng ký gần đây
              </p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {recentUsers.length > 0 ? (
              recentUsers.map((u) => (
                <div
                  key={u._id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2d6a4f] to-[#1a3a2a] text-white font-bold text-[12px] flex items-center justify-center shrink-0">
                    {u.name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 truncate">
                      {u.name}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {u.email}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleStyle[u.role] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {roleLabel[u.role] ?? u.role}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {formatDate(u.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState label="Chưa có người dùng" />
            )}
          </div>
        </div>

        {/* Recent lessons */}
        <div
          onClick={() => router.push('/admin/content/lesson-management')}
          className="bg-white border border-gray-200 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-500" />
                Bài học mới nhất
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                5 bài học được tạo gần đây
              </p>
            </div>
          </div>
          <div className="divide-y divide-gray-50">
            {recentLessons.length > 0 ? (
              recentLessons.map((lesson) => (
                <div
                  key={lesson._id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4 text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 truncate">
                      {lesson.title || 'Bài học'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {lesson.duration ? `${lesson.duration}s` : '—'} ·{' '}
                      {lesson.isFree ? 'Miễn phí' : 'Trả phí'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${lessonStatusStyle[lesson.status ?? 'draft'] ?? 'bg-gray-100 text-gray-500'}`}
                    >
                      {lessonStatusLabel[lesson.status ?? 'draft'] ??
                        lesson.status}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {formatDate(lesson.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState label="Chưa có bài học nào" />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
