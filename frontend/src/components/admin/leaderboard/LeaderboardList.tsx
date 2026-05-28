import { Skeleton } from '@/components/ui/skeleton';
import { Award, Medal } from 'lucide-react';

interface LeaderboardListProps {
  isLoading: boolean;
}

const MOCK_LEADERBOARD = [
  { rank: 1, initials: 'MT', name: 'Minh Tuấn', streak: 47, points: 2840, avatarBg: 'bg-[#15803d]' },
  { rank: 2, initials: 'TH', name: 'Thu Hương', streak: 42, points: 2650, avatarBg: 'bg-[#15803d]' },
  { rank: 3, initials: 'VH', name: 'Văn Hùng', streak: 38, points: 2420, avatarBg: 'bg-[#15803d]' },
  { rank: 4, initials: 'HN', name: 'Hồng Nhung', streak: 35, points: 2180, avatarBg: 'bg-[#15803d]' },
  { rank: 5, initials: 'TH', name: 'Thu Hà', streak: 32, points: 2050, avatarBg: 'bg-[#15803d]' },
  { rank: 6, initials: 'MA', name: 'Minh An', streak: 29, points: 1920, avatarBg: 'bg-[#15803d]' },
  { rank: 7, initials: 'LA', name: 'Lan Anh', streak: 26, points: 1780, avatarBg: 'bg-[#15803d]' },
  { rank: 8, initials: 'QA', name: 'Quốc Anh', streak: 24, points: 1650, avatarBg: 'bg-[#15803d]' },
  { rank: 9, initials: 'BL', name: 'Bảo Lâm', streak: 21, points: 1540, avatarBg: 'bg-[#15803d]' },
  { rank: 10, initials: 'KP', name: 'Kim Phương', streak: 18, points: 1420, avatarBg: 'bg-[#15803d]' },
];

export function LeaderboardList({ isLoading }: LeaderboardListProps) {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return { row: 'bg-amber-50 border-amber-200 shadow-sm', icon: 'text-amber-500' };
      case 2: return { row: 'bg-emerald-50 border-emerald-200 shadow-sm', icon: 'text-emerald-500' };
      case 3: return { row: 'bg-orange-50 border-orange-200 shadow-sm', icon: 'text-orange-500' };
      default: return { row: 'bg-white border-gray-100 shadow-sm hover:shadow-md transition-shadow', icon: 'text-gray-400' };
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Top 10 Người Chơi Tuần Này</h2>
      <div className="space-y-3">
        {isLoading ? (
          // SKELETON LOADING STATE
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-white">
              <Skeleton className="w-8 h-8 rounded-full shrink-0 bg-gray-200" />
              <Skeleton className="w-10 h-10 rounded-full shrink-0 bg-gray-200" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32 bg-gray-200" />
                <Skeleton className="h-4 w-20 bg-gray-200" />
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-5 w-16 ml-auto bg-gray-200" />
                <Skeleton className="h-4 w-12 ml-auto bg-gray-200" />
              </div>
            </div>
          ))
        ) : (
          // ACTUAL DATA ROWS
          MOCK_LEADERBOARD.map((user) => {
            const styles = getRankStyle(user.rank);
            const isTop3 = user.rank <= 3;
            return (
              <div 
                key={user.rank} 
                className={`flex items-center gap-4 p-4 border rounded-xl transition-all ${styles.row}`}
              >
                {/* Rank Circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isTop3 ? 'bg-white/60 text-gray-800' : 'bg-gray-100 text-gray-500'}`}>
                  {user.rank}
                </div>
                
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 ${user.avatarBg}`}>
                  {user.initials}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-bold text-gray-900 truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Chuỗi {user.streak} ngày
                  </p>
                </div>

                {/* Points & Medal */}
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[15px] text-gray-900">
                      {user.points.toLocaleString('en-US')}
                    </span>
                    {isTop3 ? (
                      <Award className={`w-5 h-5 ${styles.icon}`} fill="currentColor" />
                    ) : (
                      <Medal className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mr-[28px]">điểm</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
