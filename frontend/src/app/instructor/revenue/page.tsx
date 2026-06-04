'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { motion, Variants } from 'framer-motion';
import { Wallet, PayoutRequest } from '@/types/wallet.types';
import { walletApi } from '@/lib/api/wallet.api';
import { BankInfoForm } from '@/components/instructor/revenue/BankInfoForm';
import { PayoutRequestModal } from '@/components/instructor/revenue/PayoutRequestModal';
import { PayoutHistoryTable } from '@/components/instructor/revenue/PayoutHistoryTable';
import { Wallet as WalletIcon, TrendingUp, HandCoins, Loader2 } from 'lucide-react';
import { ActionButton } from '@/common/button/ActionButton';

// ─── Animations ───────────────────────────────────────────────────────────────
const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 26 },
  },
};

export default function InstructorRevenuePage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await walletApi.getMyWallet();
      if (res.data) {
        setWallet(res.data.wallet);
        setPayouts(res.data.payouts || []);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tải dữ liệu ví');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <motion.div
      className="p-6 space-y-6 w-full max-w-7xl mx-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Doanh thu & Rút tiền
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý số dư, cập nhật ngân hàng và tạo yêu cầu thanh toán
          </p>
        </div>
        <ActionButton 
          icon={HandCoins}
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading || !wallet || wallet.balance <= 0}
        >
          Yêu cầu rút tiền
        </ActionButton>
      </motion.div>

      

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Wallet Stats & Bank Form */}
        <motion.div variants={item} className="space-y-6 lg:col-span-1">
          {/* Stats Cards */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <WalletIcon className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <WalletIcon className="w-4 h-4" />
                <h3 className="text-sm font-semibold">Số dư khả dụng</h3>
              </div>
              {isLoading ? (
                <div className="h-9 w-32 bg-gray-100 animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold text-emerald-600">
                  {wallet?.balance ? wallet.balance.toLocaleString('vi-VN') : 0} <span className="text-lg">đ</span>
                </p>
              )}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 relative z-10">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <TrendingUp className="w-4 h-4" />
                <h3 className="text-sm font-medium">Tổng thu nhập tích lũy</h3>
              </div>
              {isLoading ? (
                <div className="h-6 w-24 bg-gray-100 animate-pulse rounded" />
              ) : (
                <p className="text-lg font-bold text-gray-900">
                  {wallet?.totalEarned ? wallet.totalEarned.toLocaleString('vi-VN') : 0} đ
                </p>
              )}
            </div>
          </div>

          {/* Bank Info Form */}
          <BankInfoForm />
        </motion.div>

        {/* Right Column: Payout History */}
        <motion.div variants={item} className="lg:col-span-2">
          <PayoutHistoryTable payouts={payouts} isLoading={isLoading} />
        </motion.div>
      </div>

      {/* Modal */}
      <PayoutRequestModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        maxAmount={wallet?.balance || 0}
      />
    </motion.div>
  );
}
