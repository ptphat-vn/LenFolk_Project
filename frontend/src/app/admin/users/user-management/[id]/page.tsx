'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { userApi } from '@/lib/api/user.api';
import { paymentApi } from '@/lib/api/payment.api';
import { User } from '@/types/user.types';
import { TransactionRecord } from '@/types/payment.types';
import {
  User as UserIcon,
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Activity,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, Variants } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';
import { DataTable, Column } from '@/common/table/DataTable';
import { ActionButton } from '@/common/button/ActionButton';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const [userRes, txRes] = await Promise.all([
        userApi.getUserById(userId),
        paymentApi.getAll({ userId }),
      ]);
      setUser(userRes.data || null);
      setTransactions(txRes.data || []);
    } catch (error) {
      console.error('Failed to fetch user details', error);
      toast.error('Lỗi khi tải thông tin chi tiết người dùng');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchUserData();
  }, [fetchUserData, userId]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy người dùng</h2>
        <ActionButton icon={ArrowLeft} onClick={() => router.back()}>
          Quay lại
        </ActionButton>
      </div>
    );
  }

  const transactionColumns: Column<TransactionRecord>[] = [
    {
      header: 'Mã GD',
      render: (tx) => <span className="font-mono text-[12px] text-gray-500">{tx._id.substring(0, 8)}...</span>,
    },
    {
      header: 'Gói đăng ký',
      render: (tx) => (
        <span className="font-medium text-[13px] text-gray-900">
          {(tx.userSubscriptionId as any)?.planId?.name || 'Gói không rõ'}
        </span>
      ),
    },
    {
      header: 'Số tiền',
      render: (tx) => <span className="font-bold text-[13px] text-[#2d6a4f]">{formatCurrency(tx.amount)}</span>,
    },
    {
      header: 'Trạng thái',
      render: (tx) => {
        if (tx.status === 'success') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> Thành công
            </span>
          );
        } else if (tx.status === 'failed') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
              <XCircle className="w-3.5 h-3.5" /> Thất bại
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
              <Clock className="w-3.5 h-3.5" /> {tx.status === 'pending' ? 'Chờ thanh toán' : 'Đang xử lý'}
            </span>
          );
        }
      },
    },
    {
      header: 'Thời gian',
      render: (tx) => <span className="text-[12px] text-gray-500">{new Date(tx.createdAt || '').toLocaleString('vi-VN')}</span>,
    },
  ];

  return (
    <motion.div className="p-6 md:p-8 space-y-6 w-full max-w-7xl mx-auto" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Hồ sơ người dùng
          </h1>
          <p className="text-[13px] text-gray-500">ID: <span className="font-mono text-gray-900 bg-gray-100 px-1 rounded">{user._id}</span></p>
        </div>
      </motion.div>

      {/* Main Info Card */}
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <div className="w-24 h-24 rounded-full bg-linear-to-br from-[#2d6a4f] to-[#1a3a2a] text-white text-3xl font-bold flex items-center justify-center shadow-lg">
            {user.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            user.role === 'admin' ? 'bg-[#1a3a2a] text-white' :
            user.role === 'instructor' ? 'bg-violet-100 text-violet-700' :
            user.role === 'learner' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {user.role}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 w-full">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{user.name}</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-[14px] text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-[14px] text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Tham gia: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-[14px] text-gray-600">
                <Shield className="w-4 h-4 text-gray-400" />
                <span>Trạng thái: 
                  <span className={`ml-2 font-medium ${user.isActive !== false ? 'text-emerald-600' : 'text-red-500'}`}>
                    {user.isActive !== false ? 'Hoạt động' : 'Bị khóa'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2d6a4f]" />
              Hoạt động gần đây
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">Đăng nhập lần cuối:</span>
                <span className="font-medium text-gray-900">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('vi-VN') : 'Chưa có'}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-500">Tổng số giao dịch:</span>
                <span className="font-medium text-gray-900">{transactions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Transactions Section */}
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#2d6a4f]" />
          Lịch sử giao dịch
        </h3>
        <DataTable
          columns={transactionColumns}
          data={transactions}
          isLoading={loading}
          emptyIcon={CreditCard}
          emptyMessage="Người dùng này chưa có giao dịch nào"
          keyExtractor={(tx) => tx._id}
        />
      </motion.div>
    </motion.div>
  );
}
