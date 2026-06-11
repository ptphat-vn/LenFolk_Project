'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Badge, BadgeType, CreateBadgeInput } from '@/types/badge.types';
import { badgeApi } from '@/lib/api/badge.api';
import {
  Award,
  Plus,
  Trash2,
  Pencil,
  Trophy,
  Zap,
  CheckCircle2,
  BookOpen,
  RefreshCw,
  Loader2,
  Star,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { FilterInput } from '@/common/filter/FilterInput';
import { FilterSelect } from '@/common/filter/FilterSelect';
import { DataTable, Column } from '@/common/table/DataTable';
import { ActionButton } from '@/common/button/ActionButton';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
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
const BADGE_TYPE_LABEL: Record<BadgeType, string> = {
  streak: 'Chuỗi ngày',
  completion: 'Hoàn thành',
  practice: 'Luyện tập',
  achievement: 'Thành tích',
};
const BADGE_TYPE_COLOR: Record<BadgeType, string> = {
  streak: 'bg-orange-50 text-orange-700',
  completion: 'bg-emerald-50 text-emerald-700',
  practice: 'bg-blue-50 text-blue-700',
  achievement: 'bg-amber-50 text-amber-700',
};

const getBadgeIcon = (iconName: string) => {
  switch (iconName.toLowerCase()) {
    case 'trophy':   return <Trophy className="w-4 h-4" />;
    case 'zap':      return <Zap className="w-4 h-4" />;
    case 'check':    return <CheckCircle2 className="w-4 h-4" />;
    case 'book':     return <BookOpen className="w-4 h-4" />;
    case 'star':     return <Star className="w-4 h-4" />;
    default:         return <Award className="w-4 h-4" />;
  }
};

const PAGE_SIZE = 10;

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

const DEFAULT_FORM: CreateBadgeInput = {
  name: '',
  icon: 'award',
  description: '',
  type: 'achievement',
  conditionKey: '',
  conditionValue: 1,
  isActive: true,
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [typeFilter, setTypeFilter] = useState<BadgeType | 'all'>('all');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Badge | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [form, setForm] = useState<CreateBadgeInput>(DEFAULT_FORM);

  const fetchBadges = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await badgeApi.getAll();
      setBadges(res.data || []);
    } catch {
      toast.error('Lỗi khi tải dữ liệu huy hiệu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchBadges(); }, [fetchBadges]);

  const stats = useMemo(() => ({
    total: badges.length,
    active: badges.filter((b) => b.isActive !== false).length,
    byType: Object.fromEntries(
      (['streak','completion','practice','achievement'] as BadgeType[]).map((t) => [
        t, badges.filter((b) => b.type === t).length,
      ])
    ),
  }), [badges]);

  const filtered = useMemo(() =>
    badges.filter((b) => {
      if (debouncedSearch && !b.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      if (typeFilter !== 'all' && b.type !== typeFilter) return false;
      return true;
    }),
    [badges, debouncedSearch, typeFilter]
  );
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => setPage(1), [debouncedSearch, typeFilter]);

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm(DEFAULT_FORM);
    setFormOpen(true);
  };

  const openEdit = (badge: Badge) => {
    setEditTarget(badge);
    setForm({
      name: badge.name,
      icon: badge.icon,
      description: badge.description ?? '',
      type: badge.type,
      conditionKey: badge.conditionKey,
      conditionValue: badge.conditionValue,
      isActive: badge.isActive !== false,
    });
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.conditionKey.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    try {
      setIsSaving(true);
      if (editTarget) {
        await badgeApi.update(editTarget._id, form);
        toast.success('Đã cập nhật huy hiệu');
      } else {
        await badgeApi.create(form);
        toast.success('Đã tạo huy hiệu mới');
      }
      setFormOpen(false);
      fetchBadges();
    } catch {
      toast.error('Lỗi khi lưu huy hiệu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa huy hiệu này?')) return;
    try {
      setIsDeleting(id);
      await badgeApi.delete(id);
      toast.success('Đã xóa huy hiệu');
      setBadges((prev) => prev.filter((b) => b._id !== id));
    } catch {
      toast.error('Lỗi khi xóa huy hiệu');
    } finally {
      setIsDeleting(null);
    }
  };

  // ── Columns ─────────────────────────────────────────────────────────────────
  const columns: Column<Badge>[] = [
    {
      header: 'Huy hiệu',
      render: (badge) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            {getBadgeIcon(badge.icon)}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-gray-900">{badge.name}</p>
            {badge.description && (
              <p className="text-[11px] text-gray-400 truncate max-w-48">{badge.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Loại',
      render: (badge) => (
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${BADGE_TYPE_COLOR[badge.type]}`}>
          {BADGE_TYPE_LABEL[badge.type]}
        </span>
      ),
    },
    {
      header: 'Điều kiện',
      render: (badge) => (
        <div className="text-[12px]">
          <span className="font-mono text-gray-500">{badge.conditionKey}</span>
          <span className="text-gray-400 mx-1">≥</span>
          <span className="font-bold text-gray-900">{badge.conditionValue}</span>
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      render: (badge) => (
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badge.isActive !== false ? 'bg-emerald-500' : 'bg-gray-400'}`} />
          {badge.isActive !== false ? 'Hoạt động' : 'Vô hiệu'}
        </span>
      ),
    },
    {
      header: '',
      className: 'text-right',
      render: (badge) => (
        <div className="flex justify-end">
          <RowActionsMenu
            actions={[
              {
                label: 'Xem chi tiết',
                icon: Eye,
                href: `/admin/interaction/badges/${badge._id}`,
              },
              { label: 'Chỉnh sửa', icon: Pencil, onClick: () => openEdit(badge) },
              {
                label: 'Xoá',
                icon: Trash2,
                variant: 'destructive',
                separatorBefore: true,
                disabled: isDeleting === badge._id,
                onClick: () => handleDelete(badge._id),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <motion.div className="p-6 space-y-6 w-full" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý Huy hiệu</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Quản lý các danh hiệu, phần thưởng cho học viên</p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton icon={RefreshCw} variant="outline" onClick={fetchBadges}>Làm mới</ActionButton>
          <ActionButton icon={Plus} onClick={openCreate}>Thêm huy hiệu</ActionButton>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng huy hiệu', value: stats.total, icon: Award, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
          { label: 'Hoạt động', value: stats.active, icon: CheckCircle2, iconBg: 'bg-emerald-50', iconColor: 'text-[#2d6a4f]' },
          { label: 'Thành tích', value: stats.byType.achievement, icon: Trophy, iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
          { label: 'Chuỗi ngày', value: stats.byType.streak, icon: Zap, iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
        ].map((c) => (
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
          <FilterInput value={search} onChange={setSearch} placeholder="Tìm kiếm huy hiệu..." className="flex-1 min-w-48" />
          <FilterSelect
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as BadgeType | 'all')}
            options={(['streak','completion','practice','achievement'] as BadgeType[]).map((t) => ({
              value: t, label: BADGE_TYPE_LABEL[t],
            }))}
            placeholder="Tất cả loại"
            className="w-36"
          />
          <span className="text-[12px] text-gray-400 ml-auto">{filtered.length} huy hiệu</span>
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          isLoading={isLoading}
          emptyIcon={Award}
          emptyMessage="Chưa có huy hiệu nào"
          keyExtractor={(b) => b._id}
        />
        {!isLoading && filtered.length > PAGE_SIZE && (
          <div className="px-5 py-1 border-t border-gray-100">
            <Pagination total={filtered.length} page={page} pageSize={PAGE_SIZE} onPageChange={setPage} showPageSizeSelector={false} />
          </div>
        )}
      </motion.div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Chỉnh sửa huy hiệu' : 'Thêm huy hiệu mới'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} noValidate className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Tên huy hiệu *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nhập tên huy hiệu" />
              </div>
              <div className="space-y-1.5">
                <Label>Icon</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="award, trophy, zap, star..." />
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-gray-400">Xem trước:</span>
                  <div className="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center text-amber-600">
                    {getBadgeIcon(form.icon)}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Loại</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as BadgeType })}
                  className="h-9 px-3 w-full rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white cursor-pointer"
                >
                  {(['streak','completion','practice','achievement'] as BadgeType[]).map((t) => (
                    <option key={t} value={t}>{BADGE_TYPE_LABEL[t]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Điều kiện Key *</Label>
                <Input value={form.conditionKey} onChange={(e) => setForm({ ...form, conditionKey: e.target.value })} placeholder="vd: streak_days" />
              </div>
              <div className="space-y-1.5">
                <Label>Giá trị tối thiểu *</Label>
                <Input
                  type="number" min={0}
                  value={form.conditionValue}
                  onChange={(e) => setForm({ ...form, conditionValue: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Mô tả</Label>
                <Input value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn về huy hiệu" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox" id="badge-active"
                  checked={form.isActive !== false}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded cursor-pointer accent-[#2d6a4f]"
                />
                <Label htmlFor="badge-active" className="cursor-pointer">Kích hoạt ngay</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isSaving} className="bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSaving ? 'Đang lưu...' : editTarget ? 'Cập nhật' : 'Tạo huy hiệu'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
