import { RevenueFilterCard } from '@/components/admin/revenue-report/RevenueFilterCard';
import { MonthlyRevenueTable } from '@/components/admin/revenue-report/MonthlyRevenueTable';
import { TransactionHistoryTable } from '@/components/admin/revenue-report/TransactionHistoryTable';

export default function RevenueReportsPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-2">
          Doanh Thu & Báo Cáo
        </h1>
        <p className="text-gray-500 text-sm">
          Phân tích doanh số, phân bổ doanh thu và xuất báo cáo tài chính
        </p>
      </div>

      <RevenueFilterCard />
      <MonthlyRevenueTable />
      <TransactionHistoryTable />
    </div>
  );
}
