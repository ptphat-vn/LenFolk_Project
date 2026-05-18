import { CheckCircle2, XCircle } from 'lucide-react';

export function TransactionHistoryTable() {
  const MOCK_TRANSACTIONS = [
    {
      id: 'TXN001',
      buyer: 'Trần Thị Mai',
      product: 'Technique Plan',
      time: '2026-03-23 14:32',
      amount: 829000,
      status: 'success',
    },
    {
      id: 'TXN002',
      buyer: 'Lê Văn Hùng',
      product: 'Thu ca (Repertoire)',
      time: '2026-03-23 13:15',
      amount: 899000,
      status: 'success',
    },
    {
      id: 'TXN003',
      buyer: 'Phạm Thu Hà',
      product: 'Technique Plan',
      time: '2026-03-23 11:08',
      amount: 829000,
      status: 'failed',
    },
    {
      id: 'TXN004',
      buyer: 'Nguyễn Văn An',
      product: 'Lý Con Sáo (Repertoire)',
      time: '2026-03-23 10:45',
      amount: 1200000,
      status: 'success',
    },
    {
      id: 'TXN005',
      buyer: 'Hoàng Thị Lan',
      product: 'Technique Plan',
      time: '2026-03-22 18:22',
      amount: 829000,
      status: 'success',
    },
  ];

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US') + 'đ';
  };

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden mt-8">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Lịch Sử Giao Dịch</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium">Mã Đơn</th>
              <th className="px-6 py-4 font-medium">Người mua</th>
              <th className="px-6 py-4 font-medium">Sản phẩm</th>
              <th className="px-6 py-4 font-medium">Thời gian</th>
              <th className="px-6 py-4 text-right font-medium">Số tiền</th>
              <th className="px-6 py-4 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {MOCK_TRANSACTIONS.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{row.id}</td>
                <td className="px-6 py-4">{row.buyer}</td>
                <td className="px-6 py-4">{row.product}</td>
                <td className="px-6 py-4">{row.time}</td>
                <td className="px-6 py-4 text-right font-medium">{formatCurrency(row.amount)}</td>
                <td className="px-6 py-4">
                  {row.status === 'success' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Thành công
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700">
                      <XCircle className="w-3.5 h-3.5" />
                      Thất bại
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
        <p className="text-gray-500">Hiển thị 5 giao dịch</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors font-medium">
            Trước
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 transition-colors font-medium">
            Tiếp
          </button>
        </div>
      </div>
    </div>
  );
}
