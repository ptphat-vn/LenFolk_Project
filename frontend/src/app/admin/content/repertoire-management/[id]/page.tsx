'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { performanceApi } from '@/lib/api/performance.api';
import { Performance } from '@/types/performance.types';
import {
  ArrowLeft,
  Music,
  Star,
  Activity,
  PlayCircle,
  Tag,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, Variants } from 'framer-motion';
import { ActionButton } from '@/common/button/ActionButton';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

export default function RepertoireDetailPage() {
  const params = useParams();
  const router = useRouter();
  const perfId = params.id as string;

  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await performanceApi.getById(perfId);
      setPerformance(res.data || null);
    } catch (error) {
      console.error('Failed to fetch performance details', error);
      toast.error('Lỗi khi tải thông tin tiết mục');
    } finally {
      setLoading(false);
    }
  }, [perfId]);

  useEffect(() => {
    if (perfId) fetchPerformanceData();
  }, [fetchPerformanceData, perfId]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy tiết mục biểu diễn</h2>
        <ActionButton icon={ArrowLeft} onClick={() => router.back()}>
          Quay lại
        </ActionButton>
      </div>
    );
  }

  return (
    <motion.div className="p-6 md:p-8 space-y-6 w-full max-w-7xl mx-auto" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Chi tiết Tiết mục (Repertoire)
          </h1>
          <p className="text-[13px] text-gray-500">ID: <span className="font-mono text-gray-900 bg-gray-100 px-1 rounded">{performance._id}</span></p>
        </div>
      </motion.div>

      {/* Main Info Card */}
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        {(performance.imageUrls?.[0] || performance.thumbnail) ? (
          <div className="w-full md:w-80 aspect-video relative rounded-xl overflow-hidden shadow-sm group">
            <img src={(performance.imageUrls?.[0] || performance.thumbnail)!} alt={performance.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="w-12 h-12 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-full md:w-80 aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
            <Music className="w-12 h-12 text-gray-300" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 w-full">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              {performance.title}
              {performance.isFeatured && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
            </h2>
            <p className="text-[14px] text-gray-600 mb-4 line-clamp-4">{performance.description || 'Chưa có mô tả'}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {performance.tags?.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-gray-500 flex items-center gap-2"><Tag className="w-4 h-4" /> Thể loại</span>
              <span className="font-semibold text-gray-900">{performance.genre || 'Chưa phân loại'}</span>
            </div>
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Thời lượng</span>
              <span className="font-semibold text-gray-900">{performance.duration ? `${performance.duration} giây` : '—'}</span>
            </div>
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-gray-500 flex items-center gap-2"><Activity className="w-4 h-4" /> Trạng thái</span>
              <span className={`font-semibold uppercase text-xs ${
                performance.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
              }`}>{performance.status}</span>
            </div>
            <div className="flex justify-between items-center text-[14px] pt-2 border-t border-gray-200">
              <span className="text-gray-500">Phân loại</span>
              <span className={`font-bold text-base ${performance.isFree ? 'text-blue-600' : 'text-[#2d6a4f]'}`}>
                {performance.isFree ? 'Miễn phí' : 'Trả phí (Cần Đăng ký gói)'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Video Preview (if available) */}
      {performance.videoUrl && (
        <motion.div variants={item} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-[#2d6a4f]" />
            Video xem trước
          </h3>
          <div className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden bg-black">
            <video 
              src={performance.videoUrl} 
              controls 
              className="w-full h-full object-contain"
              poster={(performance.imageUrls?.[0] || performance.thumbnail) || undefined}
            >
              Trình duyệt của bạn không hỗ trợ thẻ video.
            </video>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
