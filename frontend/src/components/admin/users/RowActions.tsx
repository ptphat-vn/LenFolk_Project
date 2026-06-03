'use client';

import { useState } from 'react';
import {
  MoreVertical,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
} from 'lucide-react';
import { User } from '@/types/user.types';
import Link from 'next/link';

export function RowActions({
  user,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  user: User;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[150px]">
          <Link
            href={`/admin/users/user-management/${user._id}`}
            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Xem chi tiết
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Chỉnh sửa
          </button>
          <button
            onClick={() => {
              setOpen(false);
              onToggleActive();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {user.isActive !== false ? (
              <>
                <ToggleLeft className="w-3.5 h-3.5 text-amber-500" /> Khoá tài
                khoản
              </>
            ) : (
              <>
                <ToggleRight className="w-3.5 h-3.5 text-emerald-500" /> Mở khoá
              </>
            )}
          </button>
          <hr className="my-1 border-gray-100" />
          <button
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xoá
          </button>
        </div>
      )}
    </div>
  );
}
