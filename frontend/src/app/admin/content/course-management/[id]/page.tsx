'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { courseApi } from '@/lib/api/course.api';
import { lessonApi } from '@/lib/api/lesson.api';
import { Course } from '@/types/course.types';
import { Lesson } from '@/types/lesson.types';
import {
  BookOpen,
  ArrowLeft,
  Users,
  Video,
  Layers,
  Star,
  Activity,
  FileText,
  Lock,
  Unlock,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, Variants } from 'framer-motion';
import { DataTable, Column } from '@/common/table/DataTable';
import { ActionButton } from '@/common/button/ActionButton';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

const CYCLE_LABELS: Record<string, string> = {
  monthly: 'tháng',
  quarterly: 'quý',
  yearly: 'năm',
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const [courseRes, lessonRes] = await Promise.all([
        courseApi.getById(courseId),
        lessonApi.getAll({ courseId, limit: 100 }), // Get all lessons for this course
      ]);
      setCourse(courseRes.data || null);
      setLessons(lessonRes.data || []);
    } catch (error) {
      console.error('Failed to fetch course details', error);
      toast.error('Lỗi khi tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) fetchCourseData();
  }, [fetchCourseData, courseId]);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy khóa học</h2>
        <ActionButton icon={ArrowLeft} onClick={() => router.back()}>
          Quay lại
        </ActionButton>
      </div>
    );
  }
  const lessonColumns: Column<Lesson>[] = [
    {
      header: 'STT',
      render: (l) => <span className="font-medium text-gray-600">{l.order}</span>,
    },
    {
      header: 'Tên bài học',
      render: (l) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            {l.videoUrl ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          </div>
          <span className="font-medium text-[13px] text-gray-900">{l.title}</span>
        </div>
      ),
    },
    {
      header: 'Loại',
      render: (l) => (
        <span className="text-[12px] font-medium text-gray-500 uppercase">
          {l.videoUrl ? 'video' : 'lesson'}
        </span>
      ),
    },
    {
      header: 'Trạng thái truy cập',
      render: (l) => (
        l.isFree ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
            <Unlock className="w-3 h-3" /> Miễn phí
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
            <Lock className="w-3 h-3" /> Trả phí
          </span>
        )
      ),
    },
    {
      header: 'Trạng thái',
      render: (l) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
          l.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {l.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
        </span>
      ),
    },
  ];

  return (
    <motion.div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 w-full max-w-7xl mx-auto" variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Chi tiết khóa học
            </h1>
            <p className="text-[13px] text-gray-500">ID: <span className="font-mono text-gray-900 bg-gray-100 px-1 rounded">{course._id}</span></p>
          </div>
        </div>
        <Link href="/admin/content/lesson-management" className="w-full sm:w-auto">
          <ActionButton icon={Video} className="w-full sm:w-auto justify-center">Quản lý bài học</ActionButton>
        </Link>
      </motion.div>

      {/* Main Info Card */}
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-8 items-start">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} className="w-full md:w-64 aspect-video max-w-full h-auto object-cover rounded-xl shadow-sm" />
        ) : (
          <div className="w-full md:w-64 aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-300" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 w-full">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              {course.title}
              {course.isFeatured && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
            </h2>
            <p className="text-[14px] text-gray-600 mb-4 line-clamp-2">{course.description || 'Chưa có mô tả'}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {course.tags?.map((tag, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-gray-500 flex items-center gap-2"><Layers className="w-4 h-4" /> Cấp độ</span>
              <span className="font-semibold text-gray-900 uppercase text-xs">{course.level}</span>
            </div>
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-gray-500 flex items-center gap-2"><Activity className="w-4 h-4" /> Trạng thái</span>
              <span className={`font-semibold uppercase text-xs ${
                course.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
              }`}>{course.status}</span>
            </div>
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-gray-500 flex items-center gap-2"><Users className="w-4 h-4" /> Học viên</span>
              <span className="font-semibold text-gray-900">{course.enrollCount || 0}</span>
            </div>
            <div className="flex justify-between items-center text-[14px] pt-2 border-t border-gray-200">
              <span className="text-gray-500">Giá bán</span>
              <span className="font-bold text-[#2d6a4f] text-base">
                {course.isFree
                  ? 'Miễn phí'
                  : course.plan
                    ? `${formatCurrency(course.plan.price)} / ${CYCLE_LABELS[course.plan.billingCycle] ?? course.plan.billingCycle}`
                    : 'Chưa đặt giá'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lessons Section */}
      <motion.div variants={item} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-[#2d6a4f]" />
            Cấu trúc bài học
          </h3>
          <span className="text-sm text-gray-500 font-medium">{lessons.length} bài học</span>
        </div>
        
        <DataTable
          columns={lessonColumns}
          data={[...lessons].sort((a, b) => a.order - b.order)}
          isLoading={loading}
          emptyIcon={Video}
          emptyMessage="Khóa học này chưa có bài học nào"
          keyExtractor={(l) => l._id}
          showIndex={false}
        />
      </motion.div>
    </motion.div>
  );
}
