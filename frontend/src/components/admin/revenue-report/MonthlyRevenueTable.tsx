export function MonthlyRevenueTable() {
  const MOCK_MONTHLY_REVENUE = [
    { month: 'T1', platform: 12800000, technical: 28400000, repertoire: 8200000, fees: 492000, total: 49400000, growth: 0 },
    { month: 'T2', platform: 14200000, technical: 31200000, repertoire: 9800000, fees: 551000, total: 55200000, growth: 8.5 },
    { month: 'T3', platform: 15600000, technical: 35400000, repertoire: 11400000, fees: 621000, total: 62400000, growth: 13.2 },
    { month: 'T4', platform: 14100000, technical: 29800000, repertoire: 10200000, fees: 540000, total: 54100000, growth: -13.1 },
    { month: 'T5', platform: 16800000, technical: 38200000, repertoire: 12800000, fees: 678000, total: 67800000, growth: 25.3 },
    { month: 'T6', platform: 18400000, technical: 42600000, repertoire: 14200000, fees: 751000, total: 75200000, growth: 11.2 },
    { month: 'T7', platform: 19200000, technical: 44800000, repertoire: 15600000, fees: 796000, total: 79600000, growth: 5.8 },
    { month: 'T8', platform: 17800000, technical: 40200000, repertoire: 13800000, fees: 718000, total: 71800000, growth: -9.8 },
    { month: 'T9', platform: 20400000, technical: 46800000, repertoire: 16400000, fees: 836000, total: 83600000, growth: 16.4 },
    { month: 'T10', platform: 21800000, technical: 49200000, repertoire: 17800000, fees: 888000, total: 88800000, growth: 6.2 },
    { month: 'T11', platform: 23200000, technical: 52400000, repertoire: 19200000, fees: 948000, total: 94800000, growth: 6.7 },
    { month: 'T12', platform: 25600000, technical: 58600000, repertoire: 21400000, fees: 1056000, total: 105600000, growth: 11.4 },
  ];

  const totalRow = {
    platform: 219900000,
    technical: 497600000,
    repertoire: 170800000,
    fees: 8875000,
    total: 888300000,
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-US') + 'đ';
  };

  const formatGrowth = (val: number) => {
    if (val > 0) return `+${val.toFixed(1)}%`;
    if (val < 0) return `${val.toFixed(1)}%`;
    return '0.0%';
  };

  const getGrowthClass = (val: number) => {
    if (val > 0) return 'text-[#15803d] font-medium';
    if (val < 0) return 'text-[#dc2626] font-medium';
    return 'text-gray-500 font-medium';
  };

  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden mt-8">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Doanh Thu Hàng Tháng</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium">Tháng</th>
              <th className="px-6 py-4 text-right font-medium">Foundation</th>
              <th className="px-6 py-4 text-right font-medium">Technique</th>
              <th className="px-6 py-4 text-right font-medium">Repertoire</th>
              <th className="px-6 py-4 text-right font-medium">Phí</th>
              <th className="px-6 py-4 text-right font-medium">Tổng doanh thu</th>
              <th className="px-6 py-4 text-right font-medium">Tăng trưởng %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {MOCK_MONTHLY_REVENUE.map((row) => (
              <tr key={row.month} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-900">{row.month}</td>
                <td className="px-6 py-4 text-right">{formatCurrency(row.platform)}</td>
                <td className="px-6 py-4 text-right">{formatCurrency(row.technical)}</td>
                <td className="px-6 py-4 text-right">{formatCurrency(row.repertoire)}</td>
                <td className="px-6 py-4 text-right">{formatCurrency(row.fees)}</td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrency(row.total)}</td>
                <td className={`px-6 py-4 text-right ${getGrowthClass(row.growth)}`}>
                  {formatGrowth(row.growth)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 text-gray-900 font-bold border-t-2 border-gray-200">
            <tr>
              <td className="px-6 py-4">TỔNG CỘNG</td>
              <td className="px-6 py-4 text-right">{formatCurrency(totalRow.platform)}</td>
              <td className="px-6 py-4 text-right">{formatCurrency(totalRow.technical)}</td>
              <td className="px-6 py-4 text-right">{formatCurrency(totalRow.repertoire)}</td>
              <td className="px-6 py-4 text-right">{formatCurrency(totalRow.fees)}</td>
              <td className="px-6 py-4 text-right">{formatCurrency(totalRow.total)}</td>
              <td className="px-6 py-4 text-right"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
