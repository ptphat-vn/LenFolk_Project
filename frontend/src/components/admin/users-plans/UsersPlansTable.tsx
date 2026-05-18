import { Eye } from 'lucide-react';

export interface UserPlanData {
  id: string;
  initials: string;
  avatarBg: string;
  name: string;
  email: string;
  plan: string;
  joinDate: string;
  level: number;
  lessons: number;
}

interface UsersPlansTableProps {
  onViewUser: (user: UserPlanData) => void;
}

export const MOCK_USERS: UserPlanData[] = [
  { id: '1', initials: 'VL', avatarBg: 'bg-blue-600', name: 'Vũ Thị Lan', email: 'lan@gmail.com', plan: 'Technique', joinDate: '2025-06-15', level: 4, lessons: 3 },
  { id: '2', initials: 'MT', avatarBg: 'bg-blue-600', name: 'Minh Tuấn', email: 'tuan@email.vn', plan: 'Technique', joinDate: '2025-07-01', level: 4, lessons: 8 },
  { id: '3', initials: 'HN', avatarBg: 'bg-green-500', name: 'Hồng Nhung', email: 'nhung@example.com', plan: 'Foundation', joinDate: '2025-07-20', level: 1, lessons: 0 },
  { id: '4', initials: 'LH', avatarBg: 'bg-blue-600', name: 'Lê Văn Hùng', email: 'hung@mail.com', plan: 'Technique', joinDate: '2025-06-10', level: 4, lessons: 5 },
  { id: '5', initials: 'TH', avatarBg: 'bg-blue-600', name: 'Trần Thu Hương', email: 'huong@email.vn', plan: 'Technique', joinDate: '2025-07-05', level: 5, lessons: 12 },
];

export function UsersPlansTable({ onViewUser }: UsersPlansTableProps) {
  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'Technique':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Technique</span>;
      case 'Foundation':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">Foundation</span>;
      case 'Repertoire':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">Repertoire</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">{plan}</span>;
    }
  };

  const renderStars = (level: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-xs ${i <= level ? 'text-amber-400' : 'text-gray-200'}`}>
          ★
        </span>
      );
    }
    return <div className="flex space-x-0.5">{stars}</div>;
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Ảnh</th>
              <th className="px-6 py-4">Tên</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Gói</th>
              <th className="px-6 py-4">Ngày tham gia</th>
              <th className="px-6 py-4">Cấp độ</th>
              <th className="px-6 py-4 text-center">Bài học</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {MOCK_USERS.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${user.avatarBg}`}>
                    {user.initials}
                  </div>
                </td>
                <td className="px-6 py-3 font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-3 text-gray-500">{user.email}</td>
                <td className="px-6 py-3">{getPlanBadge(user.plan)}</td>
                <td className="px-6 py-3 font-mono text-xs">{user.joinDate}</td>
                <td className="px-6 py-3">{renderStars(user.level)}</td>
                <td className="px-6 py-3 text-center font-mono text-xs">{user.lessons}</td>
                <td className="px-6 py-3 text-right">
                  <button
                    onClick={() => onViewUser(user)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
        <p className="text-gray-500">Hiển thị 5 người dùng</p>
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
