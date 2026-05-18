import { Trophy } from 'lucide-react';

interface LeaderboardEmptyStateProps {
  tab: 'monthly' | 'all-time';
}

export function LeaderboardEmptyState({ tab }: LeaderboardEmptyStateProps) {
  const title = tab === 'monthly' ? 'Bảng Xếp Hạng Tháng' : 'Bảng Xếp Hạng Mọi Thời Đại';
  const description = tab === 'monthly' 
    ? 'Dữ liệu có vào cuối tháng' 
    : 'Thứ hạng và thành tích lịch sử sẽ xuất hiện ở đây';

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
        <Trophy className="w-8 h-8 text-amber-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}
