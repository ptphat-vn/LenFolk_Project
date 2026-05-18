import { BookOpen, Layers, Music } from 'lucide-react';

export function UsersPlansStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded">
            Foundation
          </span>
        </div>
        <h3 className="text-[32px] font-medium text-gray-900 mb-1 leading-none tracking-tight">5,210</h3>
        <p className="text-sm text-gray-500 mt-2">Người dùng</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
            Technique
          </span>
        </div>
        <h3 className="text-[32px] font-medium text-gray-900 mb-1 leading-none tracking-tight">2,108</h3>
        <p className="text-sm text-gray-500 mt-2">Người dùng</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
            <Music className="w-5 h-5 text-purple-600" />
          </div>
          <span className="px-3 py-1 bg-[#9333ea] text-white text-xs font-semibold rounded">
            Repertoire
          </span>
        </div>
        <h3 className="text-[32px] font-medium text-gray-900 mb-1 leading-none tracking-tight">1,114</h3>
        <p className="text-sm text-gray-500 mt-2">Người dùng</p>
      </div>
    </div>
  );
}
