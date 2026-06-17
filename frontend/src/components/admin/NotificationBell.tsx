'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, UserCheck, Wallet, CheckCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { instructorApi } from '@/lib/api/instructor.api';
import { walletApi } from '@/lib/api/wallet.api';
import {
  getInstructorUserName,
  getInstructorUserEmail,
} from '@/types/instructor.types';

type NotiType = 'instructor' | 'payout';

interface NotiItem {
  id: string;
  type: NotiType;
  title: string;
  desc: string;
  createdAt?: string;
  href: string;
}

const SEEN_KEY = 'admin-noti-seen';
const POLL_MS = 60_000;

function formatVND(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₫`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K ₫`;
  return `${n.toLocaleString('vi-VN')} ₫`;
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} giờ trước`;
  const days = Math.floor(hrs / 24);
  return `${days} ngày trước`;
}

function readSeen(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    return new Set<string>(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function NotificationBell() {
  const [items, setItems] = useState<NotiItem[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSeen(readSeen());
  }, []);

  const load = useCallback(async () => {
    const [instRes, payoutRes] = await Promise.allSettled([
      instructorApi.getAll(),
      walletApi.getAllPayouts(),
    ]);

    const next: NotiItem[] = [];

    if (instRes.status === 'fulfilled') {
      (instRes.value.data ?? [])
        .filter((p) => p.status === 'pending')
        .forEach((p) => {
          const name =
            getInstructorUserName(p.userId) ||
            getInstructorUserEmail(p.userId) ||
            'Người dùng';
          next.push({
            id: `inst-${p._id}`,
            type: 'instructor',
            title: 'Đăng ký giảng viên mới',
            desc: `${name} vừa gửi hồ sơ giảng viên`,
            createdAt: p.createdAt,
            href: '/admin/users/instructor-management',
          });
        });
    }

    if (payoutRes.status === 'fulfilled') {
      (payoutRes.value.data ?? [])
        .filter((p) => p.status === 'pending')
        .forEach((p) => {
          const name =
            typeof p.instructorId === 'string'
              ? 'Giảng viên'
              : p.instructorId?.name || p.instructorId?.email || 'Giảng viên';
          next.push({
            id: `payout-${p._id}`,
            type: 'payout',
            title: 'Yêu cầu rút tiền',
            desc: `${name} yêu cầu rút ${formatVND(p.amount)}`,
            createdAt: p.createdAt,
            href: '/admin/business/payouts',
          });
        });
    }

    next.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    );
    setItems(next);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  const unread = items.filter((i) => !seen.has(i.id));
  const unreadCount = unread.length;

  const markAllSeen = useCallback(() => {
    const ids = new Set(items.map((i) => i.id));
    setSeen(ids);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
    }
  }, [items]);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        // Mở ra → đánh dấu các thông báo hiện tại là đã xem
        if (open && unreadCount > 0) markAllSeen();
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all duration-150 outline-none"
          aria-label="Thông báo"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h3 className="text-[13px] font-semibold text-gray-900">Thông báo</h3>
          {items.length > 0 && (
            <span className="text-[11px] text-gray-400">
              {unreadCount > 0 ? `${unreadCount} mới` : 'Đã xem hết'}
            </span>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-gray-400">
              <CheckCheck className="h-7 w-7 opacity-40" />
              <p className="text-[12px]">Không có thông báo mới</p>
            </div>
          ) : (
            items.map((item) => {
              const isUnread = !seen.has(item.id);
              const Icon = item.type === 'instructor' ? UserCheck : Wallet;
              const iconColor =
                item.type === 'instructor'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-emerald-600 bg-emerald-50';
              return (
                <DropdownMenuItem key={item.id} asChild className="rounded-none p-0">
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50"
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconColor}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-medium text-gray-900">
                          {item.title}
                        </span>
                        {isUnread && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-[12px] text-gray-500">
                        {item.desc}
                      </span>
                      {item.createdAt && (
                        <span className="mt-0.5 block text-[11px] text-gray-400">
                          {timeAgo(item.createdAt)}
                        </span>
                      )}
                    </span>
                  </Link>
                </DropdownMenuItem>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
