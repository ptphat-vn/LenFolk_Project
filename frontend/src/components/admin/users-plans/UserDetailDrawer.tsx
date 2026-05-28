import { X, Calendar, CheckSquare, Trophy, Star, Book } from 'lucide-react';
import { UserPlanData } from './UsersPlansTable';

interface UserDetailDrawerProps {
  user: UserPlanData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailDrawer({ user, isOpen, onClose }: UserDetailDrawerProps) {
  if (!user && !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Chi Tiết Người Dùng</h2>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors border border-gray-200 text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {user && (
              <>
                {/* Profile Card */}
                <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-semibold ${user.avatarBg}`}>
                      {user.initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {user.plan}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Ngày tham gia
                    </div>
                    <p className="font-medium text-gray-900">{user.joinDate}</p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <CheckSquare className="w-3.5 h-3.5" />
                      Bài học hoàn thành
                    </div>
                    <p className="font-medium text-gray-900">{user.lessons}</p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Trophy className="w-3.5 h-3.5" />
                      Điểm AI trung bình
                    </div>
                    <p className="font-medium text-green-600">8.5 <span className="text-gray-400">/ 10</span></p>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <Star className="w-3.5 h-3.5" />
                      Cấp độ
                    </div>
                    <div className="flex space-x-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className={`text-sm ${i <= user.level ? 'text-amber-400' : 'text-gray-200'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-2">
                    <h4 className="font-semibold text-gray-900">Tiến độ học tập</h4>
                    <span className="text-xs text-gray-500">{user.lessons} / 34 bài</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${(user.lessons / 34) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Purchased Items */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Book className="w-4 h-4 text-gray-500" />
                    Tiết mục đã mua
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Độc tấu Làng Tôi</p>
                        <p className="text-xs text-gray-400 mt-0.5">2025-07-15</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">1.200.000₫</p>
                    </div>
                    <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Thu ca - Artist Version</p>
                        <p className="text-xs text-gray-400 mt-0.5">2025-07-18</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">899.000₫</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
