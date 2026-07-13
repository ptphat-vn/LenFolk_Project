'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePerformanceInput, Performance } from '@/types/performance.types';
import { performanceApi } from '@/lib/api/performance.api';
import {
  Save,
  ArrowLeft,
  Loader2,
  UploadCloud,
  Image as ImageIcon,
  X,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import { instructorPerformanceSchema } from '@/schema/form.schema';

interface PerformanceFormProps {
  initialData?: Performance;
}

function getApiErrorMessage(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('response' in error)) {
    return undefined;
  }

  const response = (error as { response?: { data?: { message?: unknown } } })
    .response;
  return typeof response?.data?.message === 'string'
    ? response.data.message
    : undefined;
}

export const PerformanceForm = ({ initialData }: PerformanceFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [keptImageUrls, setKeptImageUrls] = useState<string[]>(
    initialData?.imageUrls ?? [],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreatePerformanceInput>({
    resolver: zodResolver(instructorPerformanceSchema) as never,
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      genre: initialData?.genre || '',
      duration: initialData?.duration || 0,
      isFree: initialData?.isFree ?? false,
      videoUrl: initialData?.videoUrl || '',
      thumbnail: initialData?.thumbnail || '',
      existingImageUrls: keptImageUrls,
      adminCommissionPercentage: initialData?.adminCommissionPercentage ?? 30,
      price: initialData?.price ?? undefined,
    },
  });

  const isFree = useWatch({ control, name: 'isFree' });

  const onSubmit = async (data: CreatePerformanceInput) => {
    setIsSubmitting(true);
    setError('');
    const payload: CreatePerformanceInput = {
      ...data,
      documents: documentFiles.length > 0 ? documentFiles : undefined,
      existingImageUrls: keptImageUrls,
      imageUrls: imageFiles.length > 0 ? imageFiles : undefined,
    };
    try {
      if (initialData) {
        const res = await performanceApi.update(initialData._id, payload);
        toast.success(res.message || 'Cập nhật tiết mục thành công');
        router.push('/instructor/performances');
        router.refresh();
      } else {
        const res = await performanceApi.create(payload);
        toast.success(res.message || 'Tạo tiết mục thành công');
        setSubmitted(true);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(getApiErrorMessage(err) || 'Có lỗi xảy ra khi lưu tiết mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Màn hình thành công sau khi tạo
  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Tiết mục đã được gửi!
        </h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
          Tiết mục của bạn đang chờ Admin xem xét và duyệt. Bạn sẽ được thông
          báo khi có kết quả.
        </p>
        <Link
          href="/instructor/performances"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          Xem tiết mục của tôi
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <Link
          href="/instructor/performances"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {initialData ? 'Cập nhật tiết mục' : 'Thêm tiết mục mới'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {initialData
              ? 'Sửa thông tin tiết mục của bạn'
              : 'Tạo tiết mục — sẽ được gửi lên admin để duyệt trước khi xuất bản'}
          </p>
        </div>
      </div>

      {!initialData && (
        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-3">
          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            Tiết mục của bạn sẽ ở trạng thái <strong>Chờ duyệt</strong> cho đến
            khi Admin xem xét và phê duyệt. Không có trạng thái Bản nháp.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Tên tiết mục <span className="text-red-500">*</span>
          </label>
          <input
            {...register('title', { required: 'Vui lòng nhập tên tiết mục' })}
            type="text"
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none"
            placeholder="VD: Sonata Ánh Trăng..."
          />
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Mô tả chi tiết
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none resize-y"
            placeholder="Mô tả về tiết mục này..."
          />
        </div>

        {/* Genre + Duration */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Thể loại
            </label>
            <input
              {...register('genre')}
              type="text"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none"
              placeholder="VD: Classical, Jazz..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Thời lượng (giây)
            </label>
            <input
              {...register('duration', { valueAsNumber: true })}
              type="number"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none"
              placeholder="VD: 180"
            />
          </div>
        </div>

        {/* Thumbnail */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Hình thu nhỏ (Thumbnail URL)
          </label>
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
              <UploadCloud className="w-4 h-4 text-gray-400" />
            </div>
            <input
              {...register('thumbnail')}
              type="url"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none"
              placeholder="https://..."
            />
          </div>
        </div>


        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Ảnh sheet nhạc
          </label>
          {keptImageUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {keptImageUrls.map((url) => (
                <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
                  <img src={url} alt="Trang sheet nhạc" className="h-full w-full object-contain bg-white" />
                  <button
                    type="button"
                    onClick={() => setKeptImageUrls((prev) => prev.filter((item) => item !== url))}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {imageFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {imageFiles.map((file, index) => (
                <span key={`${file.name}-${index}`} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] text-blue-700">
                  <ImageIcon className="h-3 w-3" />
                  <span className="max-w-32 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setImageFiles((prev) => prev.filter((_, i) => i !== index))}
                    className="text-blue-700/70 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length) setImageFiles((prev) => [...prev, ...files]);
              e.target.value = '';
            }}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-blue-700"
          />
          <p className="text-[11px] text-gray-400">
            Chọn nhiều ảnh theo đúng thứ tự các trang sheet. Các ảnh này không được dùng làm thumbnail.
          </p>
        </div>
        {/* Video URL */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Video (Video URL) <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
              <UploadCloud className="w-4 h-4 text-gray-400" />
            </div>
            <input
              {...register('videoUrl', { required: 'Vui lòng nhập Video URL' })}
              type="url"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none"
              placeholder="https://..."
            />
          </div>
          {errors.videoUrl && (
            <p className="text-xs text-red-500">{errors.videoUrl.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Tài liệu đính kèm
          </label>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
            onChange={(e) => setDocumentFiles(Array.from(e.target.files || []))}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-blue-700"
          />
          {initialData?.documents && initialData.documents.length > 0 && (
            <p className="text-[11px] text-gray-500">
              Đã có {initialData.documents.length} tài liệu. Upload mới sẽ được thêm vào danh sách.
            </p>
          )}
        </div>

        {/* isFree toggle */}
        <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
          <Controller
            control={control}
            name="isFree"
            render={({ field: { onChange, value } }) => (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            )}
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Tiết mục miễn phí
            </p>
            <p className="text-[12px] text-gray-500">
              {isFree
                ? 'Người dùng có thể xem mà không cần đăng ký gói — không cần đặt giá'
                : 'Người dùng cần mua gói để xem — vui lòng đặt giá bên dưới'}
            </p>
          </div>
        </div>

        {/* Giá — chỉ hiện khi isFree = false. Tiết mục bán mua đứt 1 lần. */}
        <div
          className={`transition-all duration-300 ${
            isFree ? 'opacity-40 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="space-y-1.5 max-w-xs">
            <label className="text-sm font-semibold text-gray-700">
              Giá mua đứt (VND){' '}
              {!isFree && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <input
                {...register('price', {
                  valueAsNumber: true,
                  validate: (v) =>
                    isFree || (v !== undefined && v > 0) || 'Vui lòng nhập giá',
                })}
                type="number"
                min={0}
                step={1000}
                className="w-full px-3 py-2 pr-12 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none"
                placeholder="VD: 149000"
                disabled={isFree}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-medium">
                VND
              </span>
            </div>
            {errors.price && (
              <p className="text-xs text-red-500">{errors.price.message}</p>
            )}
            <p className="text-[11px] text-gray-400">
              Người mua trả 1 lần để sở hữu vĩnh viễn tiết mục này.
            </p>
          </div>
        </div>

        {/* % hoa hồng đề xuất */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">
            % Hoa hồng đề xuất
            <span className="ml-1.5 text-[11px] font-normal text-gray-400">
              (Admin có thể chỉnh khi duyệt)
            </span>
          </label>
          <div className="relative w-40">
            <input
              {...register('adminCommissionPercentage', {
                valueAsNumber: true,
                min: { value: 0, message: 'Tối thiểu 0%' },
                max: { value: 100, message: 'Tối đa 100%' },
              })}
              type="number"
              min={0}
              max={100}
              step={1}
              className="w-full px-3 py-2 pr-8 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors outline-none"
              placeholder="30"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              %
            </span>
          </div>
          {errors.adminCommissionPercentage && (
            <p className="text-xs text-red-500">
              {errors.adminCommissionPercentage.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
          <Link
            href="/instructor/performances"
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {initialData ? 'Lưu thay đổi' : 'Gửi tiết mục'}
          </button>
        </div>
      </form>
    </div>
  );
};
