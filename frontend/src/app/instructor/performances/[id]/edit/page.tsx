'use client';

import { useEffect, useState, use } from 'react';
import { toast } from 'sonner';
import { PerformanceForm } from '@/components/instructor/performances/PerformanceForm';
import { performanceApi } from '@/lib/api/performance.api';
import { Performance } from '@/types/performance.types';
import { Loader2 } from 'lucide-react';

export default function EditPerformancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await performanceApi.getById(unwrappedParams.id);
        if (res.data) {
          setPerformance(res.data);
        } else {
          setError('Không tìm thấy tiết mục');
        }
      } catch (err) {
        console.error(err);
        setError('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPerformance();
  }, [unwrappedParams.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {error || 'Không tìm thấy tiết mục'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PerformanceForm initialData={performance} />
    </div>
  );
}
