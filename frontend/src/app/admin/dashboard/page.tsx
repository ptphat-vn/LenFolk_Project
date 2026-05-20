'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import { revenueApi } from '@/lib/api/revenue';
import { lessonApi } from '@/lib/api/lesson';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';
import { motion, Variants } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock,
  DollarSign,
  MessageSquare,
  Music,
  Trophy,
  Users,
  XCircle,
} from 'lucide-react';

const MOCK_USER = { name: 'Nguyễn Admin' };

// ─── KPI Stats ────────────────────────────────────────────────────────────────
const STATS = [
  {
    label: 'Tổng học viên',
    value: '1.284',
    icon: Users,
    trend: '+12%',
    up: true,
    sub: 'so với tháng trước',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Doanh thu tháng 5',
    value: '48.5M ₫',
    icon: DollarSign,
    trend: '+8.3%',
    up: true,
    sub: 'so với tháng trước',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-[#2d6a4f]',
  },
  {
    label: 'Bài học xuất bản',
    value: '128',
    icon: Music,
    trend: '+3',
    up: true,
    sub: 'bài mới trong tuần',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    label: 'Chờ duyệt nội dung',
    value: '7',
    icon: Clock,
    trend: '-2',
    up: false,
    sub: 'so với hôm qua',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
];

// ─── Package distribution ──────────────────────────────────────────────────────
const PACKAGES = [
  {
    name: 'Gói VIP',
    subscribers: 75,
    total: 1284,
    bar: 'bg-[#1a3a2a]',
    badge: 'bg-[#1a3a2a] text-white',
    price: '399K/th',
  },
  {
    name: 'Gói Nâng cao',
    subscribers: 278,
    total: 1284,
    bar: 'bg-[#2d6a4f]',
    badge: 'bg-[#2d6a4f] text-white',
    price: '199K/th',
  },
  {
    name: 'Gói Cơ bản',
    subscribers: 589,
    total: 1284,
    bar: 'bg-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800',
    price: '99K/th',
  },
  {
    name: 'Miễn phí',
    subscribers: 342,
    total: 1284,
    bar: 'bg-gray-300',
    badge: 'bg-gray-100 text-gray-600',
    price: 'Free',
  },
];

// ─── Pending reviews ──────────────────────────────────────────────────────────
const PENDING_REVIEWS = [
  {
    id: "mock-1",
    title: 'Kỹ thuật láy hơi nâng cao',
    author: 'GV. Minh Tú',
    type: 'Bài học',
    time: '16/05',
    priority: 'high',
  },
  {
    id: "mock-2",
    title: 'Lộ trình học sáo cho người mới',
    author: 'GV. Thu Hà',
    type: 'Lộ trình',
    time: '16/05',
    priority: 'medium',
  },
];

const priorityStyle: Record<string, string> = {
  high: 'bg-red-50 text-red-600 border border-red-200',
  medium: 'bg-amber-50 text-amber-600 border border-amber-200',
  low: 'bg-gray-100 text-gray-500 border border-gray-200',
};
const priorityLabel: Record<string, string> = {
  high: 'Cao',
  medium: 'TB',
  low: 'Thấp',
};
const typeStyle: Record<string, string> = {
  'Bài học': 'bg-blue-50 text-blue-700',
  'Lộ trình': 'bg-violet-50 text-violet-700',
  'Bài tập': 'bg-orange-50 text-orange-700',
};

// ─── Leaderboard ──────────────────────────────────────────────────────────────
const LEADERBOARD = [
  {
    rank: 1,
    name: 'Nguyễn Thị Mai',
    points: 4820,
    level: 'Xuất sắc',
    lessons: 87,
  },
  {
    rank: 2,
    name: 'Trần Văn Hùng',
    points: 4210,
    level: 'Nâng cao',
    lessons: 74,
  },
  {
    rank: 3,
    name: 'Lê Thị Lan',
    points: 3980,
    level: 'Nâng cao',
    lessons: 69,
  },
  {
    rank: 4,
    name: 'Phạm Quốc Bảo',
    points: 3540,
    level: 'Trung cấp',
    lessons: 58,
  },
  {
    rank: 5,
    name: 'Võ Thị Hoa',
    points: 3120,
    level: 'Trung cấp',
    lessons: 51,
  },
];

const rankStyle: Record<number, { bg: string; text: string; border: string }> =
  {
    1: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200',
    },
    2: {
      bg: 'bg-slate-50',
      text: 'text-slate-500',
      border: 'border-slate-200',
    },
    3: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
    },
  };
const levelStyle: Record<string, string> = {
  'Xuất sắc': 'text-amber-600 bg-amber-50',
  'Nâng cao': 'text-[#2d6a4f] bg-emerald-50',
  'Trung cấp': 'text-blue-600 bg-blue-50',
};

const SUPPORT_TICKETS = [
  {
    id: '#1042',
    subject: 'Không truy cập được bài học đã mua',
    user: 'nguyen.mai@gmail.com',
    status: 'open',
    time: '10 phút trước',
  },
  {
    id: '#1041',
    subject: 'Yêu cầu hoàn tiền gói VIP',
    user: 'tran.hung@gmail.com',
    status: 'pending',
    time: '2 giờ trước',
  },
  {
    id: '#1040',
    subject: 'Video bài học bị lỗi âm thanh',
    user: 'le.lan@gmail.com',
    status: 'resolved',
    time: '5 giờ trước',
  },
];

const ticketStatus: Record<
  string,
  { label: string; icon: typeof CheckCircle2; cls: string }
> = {
  open: {
    label: 'Mới',
    icon: XCircle,
    cls: 'text-red-600 bg-red-50 border border-red-200',
  },
  pending: {
    label: 'Đang xử lý',
    icon: Clock,
    cls: 'text-amber-600 bg-amber-50 border border-amber-200',
  },
  resolved: {
    label: 'Đã xử lý',
    icon: CheckCircle2,
    cls: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
  },
};


const RECENT_USERS = [
  {
    id: "mock-u1",
    name: 'Nguyễn Văn A',
    email: 'nguyen.van.a@gmail.com',
    pkg: 'Cơ bản',
    joined: 'Hôm nay',
  },
  {
    id: "mock-u2",
    name: 'Trần Thị B',
    email: 'tran.thi.b@gmail.com',
    pkg: 'VIP',
    joined: 'Hôm nay',
  },
];

const pkgStyle: Record<string, string> = {
  VIP: 'bg-[#1a3a2a] text-white',
  'Nâng cao': 'bg-[#2d6a4f] text-white',
  'Cơ bản': 'bg-emerald-100 text-emerald-800',
  'Miễn phí': 'bg-gray-100 text-gray-600',
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  const [stats, setStats] = useState(STATS);
  const [packages, setPackages] = useState(PACKAGES);
  const [pendingReviews, setPendingReviews] = useState(PENDING_REVIEWS);
  const [recentUsers, setRecentUsers] = useState(RECENT_USERS);
  const [chartData, setChartData] = useState<{ month: string; revenue: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, overviewRes, byPlanRes, chartRes, pendingRes] = await Promise.all([
          adminApi.getDashboard(),
          revenueApi.getOverview(),
          revenueApi.getByPlan(),
          revenueApi.getChart('month'),
          lessonApi.getPendingLessons(),
        ]);
        
        setStats([
          { ...STATS[0], value: overviewRes.totalRevenue.toLocaleString('vi-VN') + ' ₫' },
          { ...STATS[1], value: dashboardRes.users.total.toLocaleString('vi-VN') },
          { ...STATS[2], value: dashboardRes.content.publishedLessons.toString() },
          { ...STATS[3], value: pendingRes?.meta?.total?.toString() || '0' },
        ]);

        if (byPlanRes && byPlanRes.length > 0) {
           setPackages(byPlanRes.map((p: any) => ({
             name: p.planName,
             subscribers: p.count,
             total: dashboardRes.users.total,
             bar: pkgStyle[p.planName] ? pkgStyle[p.planName].split(' ')[0] : 'bg-gray-300',
             badge: pkgStyle[p.planName] ?? 'bg-gray-100 text-gray-600',
             price: 'Active'
           })));
        }

        if (chartRes && chartRes.length > 0) {
          setChartData(chartRes.map((item: any) => {
            const date = new Date(item._id);
            return {
              month: `T${date.getMonth() + 1}`,
              revenue: item.revenue / 1000000
            };
          }));
        }

        if (pendingRes.data) {
           setPendingReviews(pendingRes.data.map((l: any) => ({
             id: l._id,
             title: l.title,
             author: "Hệ thống",
             type: 'Bài học',
             time: "Gần đây",
             priority: 'medium'
           })));
        }

        if (dashboardRes.recentSignups) {
           setRecentUsers(dashboardRes.recentSignups.map((u: any) => ({
             id: u._id,
             name: u.fullName,
             email: u.email,
             pkg: 'Miễn phí', // Simplified for now since API doesn't return pkg directly here
             joined: new Date(u.createdAt).toLocaleDateString('vi-VN')
           })));
        }
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d6a4f]"></div>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-6 space-y-6 max-w-350"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-xl font-bold text-gray-900">Bảng điều khiển</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Xin chào,{' '}
          <span className="font-semibold text-gray-700">{MOCK_USER.name}</span>{' '}
          — đây là tóm tắt hoạt động hôm nay.
        </p>
      </motion.div>

      {/* ── Row 1: KPI Stats ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-4.5 h-4.5 ${s.iconColor}`} />
                </div>
                <span
                  className={`flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                    s.up
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-red-600 bg-red-50'
                  }`}
                >
                  {s.up ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {s.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 leading-none tracking-tight">
                {s.value}
              </p>
              <p className="text-[12px] text-gray-500 mt-1.5 font-medium">
                {s.label}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          );
        })}
      </motion.div>


      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-gray-900">
                  Doanh thu theo tháng
                </h2>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Năm 2026 — đơn vị: triệu đồng
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-[#2d6a4f]">{stats[0].value}</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <RevenueChart data={chartData} />
          </div>
        </div>

        {/* Package distribution */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="px-5 pt-5 pb-4 border-b border-gray-100">
            <h2 className="text-[14px] font-semibold text-gray-900">
              Phân bổ gói đăng ký
            </h2>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {stats[1].value} học viên hiện tại
            </p>
          </div>
          <div className="px-5 py-4 space-y-4">
            {packages.map((pkg) => {
              const pct = Math.round((pkg.subscribers / pkg.total) * 100) || 0;
              return (
                <div key={pkg.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${pkg.badge}`}
                      >
                        {pkg.name}
                      </span>
                    </div>
                    <span className="text-[12px] font-semibold text-gray-700">
                      {pkg.subscribers}
                      <span className="text-gray-400 font-normal ml-1">
                        ({pct}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pkg.bar} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Row 3: Pending reviews + Leaderboard ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending content reviews */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-500" />
                Tiết mục chờ duyệt
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                {pendingReviews.length} mục đang chờ phê duyệt
              </p>
            </div>
            <button className="text-[12px] font-medium text-[#2d6a4f] hover:text-[#1a3a2a] transition-colors">
              Xem tất cả →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingReviews.map((review) => (
              <div
                key={review.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-900 truncate">
                    {review.title}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {review.author} · {review.time}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeStyle[review.type] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {review.type}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priorityStyle[review.priority]}`}
                  >
                    {priorityLabel[review.priority]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Bảng xếp hạng
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Top học viên tháng 5
              </p>
            </div>
            <button className="text-[12px] font-medium text-[#2d6a4f] hover:text-[#1a3a2a] transition-colors">
              Xem tất cả →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {LEADERBOARD.map((l) => {
              const rs = rankStyle[l.rank];
              return (
                <div
                  key={l.rank}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded-lg border font-bold text-[13px] flex items-center justify-center shrink-0 ${
                      rs
                        ? `${rs.bg} ${rs.text} ${rs.border}`
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}
                  >
                    {l.rank}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2d6a4f] to-[#1a3a2a] text-white font-bold text-[12px] flex items-center justify-center shrink-0">
                    {l.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 leading-none">
                      {l.name}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {l.lessons} bài hoàn thành
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-bold text-gray-900">
                      {l.points.toLocaleString('vi-VN')}
                    </p>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${levelStyle[l.level] ?? 'bg-gray-100 text-gray-500'}`}
                    >
                      {l.level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Row 4: Support tickets + Recent registrations ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Support tickets */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                Yêu cầu hỗ trợ
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                2 yêu cầu cần xử lý
              </p>
            </div>
            <button className="text-[12px] font-medium text-[#2d6a4f] hover:text-[#1a3a2a] transition-colors">
              Xem tất cả →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {SUPPORT_TICKETS.map((t) => {
              const st = ticketStatus[t.status];
              const StatusIcon = st.icon;
              return (
                <div
                  key={t.id}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <StatusIcon
                    className={`w-4 h-4 mt-0.5 shrink-0 ${
                      t.status === 'open'
                        ? 'text-red-500'
                        : t.status === 'pending'
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 leading-snug">
                      {t.subject}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {t.user} · {t.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-gray-400 font-mono">
                      {t.id}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.cls}`}
                    >
                      {st.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent registrations */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#2d6a4f]" />
                Học viên đăng ký mới
              </h2>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Học viên gần đây
              </p>
            </div>
            <button className="text-[12px] font-medium text-[#2d6a4f] hover:text-[#1a3a2a] transition-colors">
              Xem tất cả →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#2d6a4f] to-[#1a3a2a] text-white font-bold text-[12px] flex items-center justify-center shrink-0">
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 leading-none truncate">
                    {u.name}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                    {u.email}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${pkgStyle[u.pkg] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {u.pkg}
                  </span>
                  <p className="text-[11px] text-gray-400 mt-1">{u.joined}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
