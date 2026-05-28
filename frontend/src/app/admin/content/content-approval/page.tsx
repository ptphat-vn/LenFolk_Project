'use client';

import { MOCK_SUBMISSIONS } from '@/lib/mock-content';
import { ContentSubmission } from '@/types/content.types';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useMemo, useState } from 'react';
import { ApprovalCard } from '../../../../components/admin/content-approval/ApprovalCard';

type Tab = 'pending' | 'approved' | 'rejected';

const TABS: {
  id: Tab;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { id: 'pending', label: 'Chờ duyệt', icon: Clock, color: 'text-amber-600' },
  {
    id: 'approved',
    label: 'Đã duyệt',
    icon: CheckCircle2,
    color: 'text-emerald-600',
  },
  { id: 'rejected', label: 'Từ chối', icon: XCircle, color: 'text-red-500' },
];

export default function ContentApprovalPage() {
  const [submissions, setSubmissions] =
    useState<ContentSubmission[]>(MOCK_SUBMISSIONS);
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const counts = useMemo(
    () => ({
      pending: submissions.filter((s) => s.status === 'pending').length,
      approved: submissions.filter((s) => s.status === 'approved').length,
      rejected: submissions.filter((s) => s.status === 'rejected').length,
    }),
    [submissions],
  );

  const filtered = useMemo(
    () => submissions.filter((s) => s.status === activeTab),
    [submissions, activeTab],
  );

  const handleApprove = (id: string, rate: number, basePrice: number) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'approved',
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'Admin',
              commission: { rate, basePrice, totalEarned: 0 },
            }
          : s,
      ),
    );
  };

  const handleReject = (id: string, reason: string) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'rejected',
              reviewedAt: new Date().toISOString(),
              reviewedBy: 'Admin',
              rejectionReason: reason,
            }
          : s,
      ),
    );
  };

  const emptyMessages: Record<Tab, string> = {
    pending: 'Không có nội dung nào đang chờ duyệt',
    approved: 'Chưa có nội dung nào được duyệt',
    rejected: 'Không có nội dung nào bị từ chối',
  };

  return (
    <div className="p-6 space-y-5 max-w-350">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Duyệt nội dung</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Xét duyệt nội dung do giảng viên nộp và thiết lập cơ cấu hoa hồng
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3"
              >
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-8" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))
          : TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <div
                  key={tab.id}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      tab.id === 'pending'
                        ? 'bg-amber-50'
                        : tab.id === 'approved'
                          ? 'bg-emerald-50'
                          : 'bg-red-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${tab.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 leading-none">
                      {counts[tab.id]}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {tab.label}
                    </p>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Tabs + Content */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3.5 text-[13px] font-medium transition-colors relative ${
                  isActive
                    ? 'text-[#1a3a2a]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-[#2d6a4f]' : 'text-gray-400'}`}
                />
                {tab.label}
                <span
                  className={`ml-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                    tab.id === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : tab.id === 'approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-600'
                  }`}
                >
                  {counts[tab.id]}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a3a2a] rounded-t" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-7 flex-1 rounded-md" />
                    <Skeleton className="h-7 flex-1 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              {(() => {
                const Icon = TABS.find((t) => t.id === activeTab)!.icon;
                return <Icon className="w-10 h-10 mb-3 text-gray-300" />;
              })()}
              <p className="text-[14px] font-medium text-gray-500">
                {emptyMessages[activeTab]}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filtered.map((s) => (
                <ApprovalCard
                  key={s.id}
                  submission={s}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
