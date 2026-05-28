import { RevenueFilterCard } from '@/components/admin/revenue-report/RevenueFilterCard';
import { MonthlyRevenueTable } from '@/components/admin/revenue-report/MonthlyRevenueTable';
import { TransactionHistoryTable } from '@/components/admin/revenue-report/TransactionHistoryTable';
import { RevenueChart } from '@/components/admin/revenue-report/RevenueChart';
import { Wallet, TrendingUp, CreditCard, ArrowUpRight } from 'lucide-react';

export default function RevenueReportsPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto bg-gray-50/30 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-2">
          Doanh Thu & Báo Cáo
        </h1>
        <p className="text-gray-500 text-[15px]">
          Phân tích doanh số, phân bổ doanh thu và xuất báo cáo tài chính
        </p>
      </div>

      <RevenueFilterCard />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-[#1a3a2a]/10 rounded-xl flex items-center justify-center text-[#1a3a2a]">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-md text-[13px] font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +12.5%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Tổng Doanh Thu (Năm)</h3>
          <p className="text-3xl font-bold text-gray-900">888.300.000đ</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <CreditCard className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2.5 py-1 rounded-md text-[13px] font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +5.2%
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Số Lượng Giao Dịch</h3>
          <p className="text-3xl font-bold text-gray-900">1,248</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium mb-1">Giá Trị Đơn Trung Bình</h3>
          <p className="text-3xl font-bold text-gray-900">711.000đ</p>
        </div>
      </div>

      <RevenueChart />
      <MonthlyRevenueTable />
      <TransactionHistoryTable />
    </div>
  );
}
