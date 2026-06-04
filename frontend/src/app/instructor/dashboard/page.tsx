'use client';

import { Users, ClipboardCheck, BarChart2, Star } from 'lucide-react';

export default function InstructorDashboard() {
  const stats = [
    {
      title: 'Tổng số học viên',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Tiết mục đang hoạt động',
      value: '15',
      change: '+2',
      trend: 'up',
      icon: ClipboardCheck,
    },
    {
      title: 'Doanh thu tháng này',
      value: '45,000,000đ',
      change: '+15%',
      trend: 'up',
      icon: BarChart2,
    },
    {
      title: 'Đánh giá trung bình',
      value: '4.8/5.0',
      change: '+0.1',
      trend: 'up',
      icon: Star,
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tổng quan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ doanh thu giả lập */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Hoạt động học viên & Doanh thu
          </h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
            Khu vực biểu đồ (Chưa có dữ liệu)
          </div>
        </div>

        {/* Khóa học nổi bật */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Đánh giá mới nhất
          </h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex gap-4 p-3 border border-gray-100 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-semibold text-sm">Học viên {item}</span>
                    <span className="text-xs text-gray-400">• 2 giờ trước</span>
                  </div>
                  <div className="flex text-yellow-400 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    Tiết mục rất hay và bổ ích. Giảng viên hướng dẫn tận tình, dễ hiểu.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
