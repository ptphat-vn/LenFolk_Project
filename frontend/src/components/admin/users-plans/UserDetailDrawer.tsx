'use client';

import { motion } from 'framer-motion';
import { X, Mail, Phone, Calendar, Zap, BookOpen, Music } from 'lucide-react';
import { User, Role } from '@/types/user.types';
import { Enrollment } from '@/types/enrollment.types';

const ROLE_STYLE: Record<Role, { label: string; cls: string }> = {
  admin: { label: 'Admin', cls: 'bg-[#1a3a2a] text-white' },
  instructor: { label: 'Giảng viên', cls: 'bg-violet-100 text-violet-700' },
  user: { label: 'Người dùng', cls: 'bg-blue-100 text-blue-700' },
};

function enrollTitle(en: Enrollment): string {
  if (en.itemType === 'course') {
    return typeof en.courseId === 'object' ? en.courseId?.title ?? 'Khóa học' : 'Khóa học';
  }
  return typeof en.performanceId === 'object' ? en.performanceId?.title ?? 'Tiết mục' : 'Tiết mục';
}

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
  enrollments,
}: {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  enrollments: Enrollment[];
}) {
  if (!isOpen || !user) return null;

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

          {/* Đã đăng ký gì */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Đã đăng ký ({enrollments.length})
            </p>
            {enrollments.length > 0 ? (
              <div className="space-y-2">
                {enrollments.map((en) => {
                  const ACTIVE = en.status === 'active';
                  return (
                    <div
                      key={en._id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0">
                        {en.itemType === 'course' ? (
                          <BookOpen className="w-4 h-4 text-[#2d6a4f]" />
                        ) : (
                          <Music className="w-4 h-4 text-violet-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-gray-800 truncate">
                          {enrollTitle(en)}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {en.itemType === 'course' ? 'Khóa học' : 'Tiết mục'}
                          {en.endDate ? ' · có hạn' : ' · mua đứt'}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${ACTIVE ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600'}`}
                      >
                        {ACTIVE ? 'Kích hoạt' : en.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl text-gray-400">
                <Zap className="w-4 h-4" />
                <p className="text-[13px]">Chưa đăng ký mục nào</p>
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
