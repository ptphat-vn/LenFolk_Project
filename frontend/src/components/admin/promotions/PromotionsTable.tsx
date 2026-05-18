import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Calendar, Trash2, Plus, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PromotionsTableProps {
  isLoading: boolean;
  onOpenModal: () => void;
}

const MOCK_PROMOTIONS = [
  { id: 'WELCOME2026', discount: '20%', type: 'Phần trăm', applyTo: 'Tất cả gói', start: '2026-01-01', end: '2026-12-31', used: 124, max: 1000, status: 'active' },
  { id: 'TECHNIQUE50', discount: '50,000₫', type: 'Cố định', applyTo: 'Technique', start: '2026-03-01', end: '2026-03-31', used: 48, max: 100, status: 'active' },
  { id: 'SUMMER2026', discount: '15%', type: 'Phần trăm', applyTo: 'Tất cả gói', start: '2026-06-01', end: '2026-08-31', used: 0, max: 500, status: 'paused' },
  { id: 'REPERTOIRE100', discount: '100,000₫', type: 'Cố định', applyTo: 'Repertoire', start: '2026-02-14', end: '2026-02-28', used: 89, max: 100, status: 'expired' },
];

export function PromotionsTable({ isLoading, onOpenModal }: PromotionsTableProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Tất cả mã giảm giá</h2>
        <button 
          onClick={onOpenModal}
          className="flex items-center cursor-pointer gap-2 bg-[#1a3a2a] hover:bg-[#2d6a4f] text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Tạo Mã Mới
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Mã</th>
              <th className="px-6 py-4">Giảm giá</th>
              <th className="px-6 py-4">Loại</th>
              <th className="px-6 py-4">Áp dụng</th>
              <th className="px-6 py-4">Ngày bắt đầu</th>
              <th className="px-6 py-4">Ngày kết thúc</th>
              <th className="px-6 py-4 text-center">Lượt dùng / Tối đa</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {isLoading ? (
              // SKELETON LOADING STATE
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4"><Skeleton className="h-5 w-24 bg-gray-200" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-16 bg-gray-200" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-20 bg-gray-200" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-24 bg-gray-200" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-24 bg-gray-200" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-24 bg-gray-200" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-20 mx-auto bg-gray-200" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-md bg-gray-200" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-16 ml-auto bg-gray-200" /></td>
                </tr>
              ))
            ) : (
              // ACTUAL DATA ROWS
              MOCK_PROMOTIONS.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-gray-900">{promo.id}</td>
                  <td className="px-6 py-4 font-medium">{promo.discount}</td>
                  <td className="px-6 py-4">{promo.type}</td>
                  <td className="px-6 py-4">{promo.applyTo}</td>
                  <td className="px-6 py-4 font-mono text-xs">{promo.start}</td>
                  <td className="px-6 py-4 font-mono text-xs">{promo.end}</td>
                  <td className="px-6 py-4 text-center font-mono text-xs">
                    {promo.used} <span className="text-gray-400">/ {promo.max}</span>
                  </td>
                  <td className="px-6 py-4">
                    {promo.status === 'active' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">Đang hoạt động</span>
                    )}
                    {promo.status === 'paused' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">Tạm dừng</span>
                    )}
                    {promo.status === 'expired' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700">Đã hết hạn</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors outline-none focus:ring-2 focus:ring-green-500">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem className="cursor-pointer text-gray-700 hover:text-blue-600 focus:text-blue-600 transition-colors">
                          <Pencil className="w-4 h-4 mr-2" />
                          <span>Chỉnh sửa</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-gray-700 hover:text-green-600 focus:text-green-600 transition-colors">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Gia hạn</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer text-gray-700 hover:text-red-600 focus:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4 mr-2" />
                          <span>Xóa</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
