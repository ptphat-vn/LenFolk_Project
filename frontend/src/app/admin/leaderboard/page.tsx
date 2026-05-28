'use client';

import { useState, useEffect, useRef } from 'react';
import { LeaderboardTabs } from '@/components/admin/leaderboard/LeaderboardTabs';
import { LeaderboardList } from '@/components/admin/leaderboard/LeaderboardList';
import { LeaderboardEmptyState } from '@/components/admin/leaderboard/LeaderboardEmptyState';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'all-time'>('weekly');
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<number | null>(null);

  // Simulate initial loading
  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleTabChange = (tab: 'weekly' | 'monthly' | 'all-time') => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setIsLoading(true);
    
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-2">
          Bảng Xếp Hạng
        </h1>
        <p className="text-gray-500 text-sm">
          Xem và quản lý bảng xếp hạng điểm số và chuỗi học tập
        </p>
      </div>

      <LeaderboardTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {activeTab === 'weekly' ? (
        <LeaderboardList isLoading={isLoading} />
      ) : (
        <LeaderboardEmptyState tab={activeTab} />
      )}
    </div>
  );
}
