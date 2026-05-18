export function PromotionsStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Tổng mã giảm giá</h3>
        <p className="text-[32px] font-medium text-gray-900 leading-none tracking-tight">4</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Đang hoạt động</h3>
        <p className="text-[32px] font-medium text-green-600 leading-none tracking-tight">2</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Lượt sử dụng</h3>
        <p className="text-[32px] font-medium text-gray-900 leading-none tracking-tight">261</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Hết hạn</h3>
        <p className="text-[32px] font-medium text-gray-900 leading-none tracking-tight">1</p>
      </div>
    </div>
  );
}
