import { Search, ChevronDown } from 'lucide-react';

export function UsersPlansFilter() {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Tìm kiếm người dùng..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
        />
      </div>
      <div className="flex gap-4">
        <div className="relative min-w-[160px]">
          <select className="w-full appearance-none px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-700 pr-10 focus:outline-none focus:ring-1 focus:ring-gray-300">
            <option>Lọc theo gói</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        <div className="relative min-w-[180px]">
          <select className="w-full appearance-none px-4 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-700 pr-10 focus:outline-none focus:ring-1 focus:ring-gray-300">
            <option>Lọc theo ngày tham gia</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
