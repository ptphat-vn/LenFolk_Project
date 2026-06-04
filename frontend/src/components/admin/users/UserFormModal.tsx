'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight, X, AlertTriangle } from 'lucide-react';
import {
  User,
  Role,
  CreateUserInput,
  UpdateUserInput,
} from '@/types/user.types';
import { createUserSchema, updateUserSchema } from '@/schema/form.schema';

type UserFormField = 'name' | 'email' | 'passwordHash' | 'role' | 'phoneNumber';
type UserFormErrors = Partial<Record<UserFormField, string>>;

const ROLE_STYLE: Record<Role, { label: string; cls: string }> = {
  admin: { label: 'Admin', cls: 'bg-[#1a3a2a] text-white' },
  instructor: { label: 'Giảng viên', cls: 'bg-violet-100 text-violet-700' },
  moderator: { label: 'Moderator', cls: 'bg-amber-100 text-amber-700' },
  learner: { label: 'Học viên', cls: 'bg-blue-100 text-blue-700' },
  guest: { label: 'Khách', cls: 'bg-gray-100 text-gray-500' },
};

const ROLES: Role[] = ['admin', 'instructor', 'moderator', 'learner', 'guest'];

export function UserFormModal({
  open,
  onClose,
  onSave,
  editUser,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (
    data: CreateUserInput | UpdateUserInput,
    id?: string,
  ) => Promise<void>;
  editUser: User | null;
}) {
  const isEdit = !!editUser;
  const [form, setForm] = useState({
    name: '',
    email: '',
    passwordHash: '',
    role: 'learner' as Role,
    phoneNumber: '',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<UserFormErrors>({});

  useEffect(() => {
    if (open) {
      setError('');
      setFieldErrors({});
      if (editUser) {
        setForm({
          name: editUser.name,
          email: editUser.email,
          passwordHash: '',
          role: editUser.role,
          phoneNumber: editUser.phoneNumber ?? '',
          isActive: editUser.isActive ?? true,
        });
      } else {
        setForm({
          name: '',
          email: '',
          passwordHash: '',
          role: 'learner',
          phoneNumber: '',
          isActive: true,
        });
      }
    }
  }, [open, editUser]);

  if (!open) return null;

  const setField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in fieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const inputClass = (field: UserFormField) =>
    `w-full h-9 px-3 rounded-lg border text-[13px] focus:outline-none focus:ring-2 ${
      fieldErrors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-200 focus:border-[#2d6a4f] focus:ring-[#2d6a4f]/30'
    }`;

  const renderFieldError = (field: UserFormField) =>
    fieldErrors[field] ? (
      <p className="mt-1 text-[11px] font-medium text-red-500">
        {fieldErrors[field]}
      </p>
    ) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    const parsed = isEdit
      ? updateUserSchema.safeParse({
          name: form.name,
          role: form.role,
          phoneNumber: form.phoneNumber,
          isActive: form.isActive,
        })
      : createUserSchema.safeParse({
          name: form.name,
          email: form.email,
          passwordHash: form.passwordHash,
          role: form.role,
          phoneNumber: form.phoneNumber,
        });

    if (!parsed.success) {
      const nextErrors: UserFormErrors = {};
      const errors = parsed.error.flatten().fieldErrors;
      for (const [field, messages] of Object.entries(errors)) {
        const message = messages?.[0];
        if (message) {
          nextErrors[field as UserFormField] = message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      if (isEdit && editUser) {
        const body: UpdateUserInput = parsed.data;
        await onSave(body, editUser._id);
      } else {
        const body: CreateUserInput = parsed.data as CreateUserInput;
        await onSave(body);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">
            {isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-gray-700 mb-1">
              Họ tên *
            </label>
            <input
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              required
              className={inputClass('name')}
              placeholder="Nguyễn Văn A"
            />
            {renderFieldError('name')}
          </div>

          {!isEdit && (
            <>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  value={form.email}
                  onChange={(e) => setField('email', e.target.value)}
                  required
                  type="email"
                  className={inputClass('email')}
                  placeholder="email@example.com"
                />
                {renderFieldError('email')}
              </div>
              <div>
                <label className="block text-[12px] font-medium text-gray-700 mb-1">
                  Mật khẩu *
                </label>
                <input
                  value={form.passwordHash}
                  onChange={(e) => setField('passwordHash', e.target.value)}
                  required
                  type="password"
                  minLength={6}
                  className={inputClass('passwordHash')}
                  placeholder="Tối thiểu 6 ký tự"
                />
                {renderFieldError('passwordHash')}
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Vai trò
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setField('role', e.target.value as Role)
                }
                className={`${inputClass('role')} bg-white`}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_STYLE[r].label}
                  </option>
                ))}
              </select>
              {renderFieldError('role')}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                value={form.phoneNumber}
                onChange={(e) => setField('phoneNumber', e.target.value)}
                className={inputClass('phoneNumber')}
                placeholder="0901234567"
              />
              {renderFieldError('phoneNumber')}
            </div>
          </div>

          {isEdit && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, isActive: !p.isActive }))
                }
              >
                {form.isActive ? (
                  <ToggleRight className="w-8 h-8 text-[#2d6a4f]" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
              <span className="text-[13px] text-gray-700">
                Tài khoản đang{' '}
                <strong>{form.isActive ? 'hoạt động' : 'bị khoá'}</strong>
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-[12px] text-red-600">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-9 rounded-lg bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white text-[13px] font-medium transition-colors disabled:opacity-60"
            >
              {saving
                ? 'Đang lưu...'
                : isEdit
                  ? 'Lưu thay đổi'
                  : 'Tạo người dùng'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
