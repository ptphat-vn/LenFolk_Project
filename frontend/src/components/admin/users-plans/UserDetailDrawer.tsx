'use client';

import { motion } from 'framer-motion';
import { X, Mail, Phone, Calendar, Zap } from 'lucide-react';
import { User, Role } from '@/types/user.types';
import { Subscription } from '@/types/subscription.types';

const ROLE_STYLE: Record<Role, { label: string; cls: string }> = {
  admin: { label: 'Admin', cls: 'bg-[#1a3a2a] text-white' },
  instructor: { label: 'Giảng viên', cls: 'bg-violet-100 text-violet-700' },
  moderator: { label: 'Moderator', cls: 'bg-amber-100 text-amber-700' },
  learner: { label: 'Học viên', cls: 'bg-blue-100 text-blue-700' },
  guest: { label: 'Khách', cls: 'bg-gray-100 text-gray-500' },
};

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function UserDetailDrawer({
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

  const userSub = subscriptions.find((s) => s._id === user.currentSubscription);
  const role = ROLE_STYLE[user.role] ?? {
    label: user.role,
    cls: 'bg-gray-100 text-gray-600',
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-[14px] font-bold text-gray-900">
            Chi tiết người dùng
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
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
              <h3 className="text-[16px] font-bold text-gray-900">
                {user.name}
              </h3>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${role.cls}`}
              >
                {role.label}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                  Email
                </p>
                <p className="text-[13px] text-gray-700 break-all">
                  {user.email}
                </p>
              </div>
            </div>

            {user.phoneNumber && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                    Điện thoại
                  </p>
                  <p className="text-[13px] text-gray-700">
                    {user.phoneNumber}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">
                  Ngày tham gia
                </p>
                <p className="text-[13px] text-gray-700">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Gói đăng ký
            </p>
            {userSub ? (
              <div className="bg-linear-to-br from-[#1a3a2a] to-[#2d6a4f] rounded-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4" />
                  <p className="text-[14px] font-bold">{userSub.name}</p>
                </div>
                <p className="text-[12px] text-white/70">
                  {userSub.description || 'Không có mô tả'}
                </p>
                <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between">
                  <p className="text-[13px] font-bold">
                    {userSub.price === 0
                      ? 'Miễn phí'
                      : `${userSub.price.toLocaleString('vi-VN')} ₫`}
                  </p>
                  <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">
                    {userSub.billingCycle === 'monthly'
                      ? 'Hàng tháng'
                      : userSub.billingCycle === 'quarterly'
                        ? 'Hàng quý'
                        : 'Hàng năm'}
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
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Trạng thái tài khoản
            </p>
            <div
              className={`flex items-center gap-2 p-3 rounded-xl border ${user.isActive !== false ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${user.isActive !== false ? 'bg-emerald-500' : 'bg-red-400'}`}
              />
              <p
                className={`text-[13px] font-medium ${user.isActive !== false ? 'text-emerald-700' : 'text-red-600'}`}
              >
                {user.isActive !== false ? 'Đang hoạt động' : 'Đã bị khóa'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
