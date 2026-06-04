'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { instructorApi } from '@/lib/api/instructor.api';
import { InstructorProfile } from '@/types/instructor.types';
import {
  ArrowLeft,
  UserCheck,
  Star,
  Users,
  BookOpen,
  Globe,
  Calendar,
  Briefcase,
  FileText,
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

export default function InstructorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const instructorId = params.id as string;

  const [instructor, setInstructor] = useState<InstructorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInstructorData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await instructorApi.getById(instructorId);
      setInstructor(res.data || null);
    } catch (error) {
      console.error('Failed to fetch instructor details', error);
      toast.error('Lỗi khi tải thông tin giảng viên');
    } finally {
      setLoading(false);
    }
  }, [instructorId]);

  useEffect(() => {
    if (instructorId) fetchInstructorData();
  }, [fetchInstructorData, instructorId]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy hồ sơ giảng viên</h2>
        <ActionButton icon={ArrowLeft} onClick={() => router.back()}>
          Quay lại
        </ActionButton>
      </div>
    );
  }

  return (
    <motion.div className="p-6 md:p-8 space-y-6 w-full max-w-5xl mx-auto" variants={container} initial="hidden" animate="show">
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
            Hồ sơ Giảng viên
          </h1>
          <p className="text-[13px] text-gray-500">ID: <span className="font-mono text-gray-900 bg-gray-100 px-1 rounded">{instructor._id}</span></p>
        </div>
      </motion.div>

      {/* Main Info Card */}
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <div className="w-28 h-28 rounded-full bg-violet-100 text-violet-700 text-4xl font-bold flex items-center justify-center shadow-inner">
            <UserCheck className="w-12 h-12" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1a3a2a] text-white">
            Giảng viên
          </span>
        </div>

        <div className="flex-1 w-full space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User ID: <span className="text-gray-600 font-mono text-xl">{instructor.userId}</span></h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-[14px] text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Briefcase className="w-5 h-5 text-[#2d6a4f]" />
                <div>
                  <p className="text-xs text-gray-500">Chuyên môn</p>
                  <p className="font-semibold">{instructor.expertise || 'Chưa cập nhật'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-[14px] text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <Globe className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-xs text-gray-500">Website</p>
                  {instructor.websiteUrl ? (
                    <a href={instructor.websiteUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 hover:underline">
                      {new URL(instructor.websiteUrl).hostname}
                    </a>
                  ) : (
                    <p className="font-semibold text-gray-400">Không có</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-[14px] text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 sm:col-span-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Ngày tạo hồ sơ</p>
                  <p className="font-semibold">{instructor.createdAt ? new Date(instructor.createdAt).toLocaleDateString('vi-VN') : '—'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#2d6a4f]" />
              Tiểu sử (Bio)
            </h3>
            <p className="text-[14px] text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              {instructor.bio || <span className="italic text-gray-400">Giảng viên chưa cập nhật tiểu sử.</span>}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{instructor.totalCourses || 0}</p>
            <p className="text-sm text-gray-500">Khóa học</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[#2d6a4f]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{instructor.totalStudents || 0}</p>
            <p className="text-sm text-gray-500">Học viên</p>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{instructor.rating ? instructor.rating.toFixed(1) : 'Chưa có'}</p>
            <p className="text-sm text-gray-500">Đánh giá trung bình</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
