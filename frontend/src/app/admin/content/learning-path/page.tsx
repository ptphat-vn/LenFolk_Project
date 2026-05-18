'use client';


import { CurriculumList } from '@/components/admin/learning-path/CurriculumList';
import { useState } from 'react';

type Track = 'foundation' | 'technique' | 'repertoire';

const TABS: { id: Track; label: string; sublabel?: string }[] = [
  { id: 'foundation', label: 'Foundation', sublabel: 'Miễn phí' },
  { id: 'technique', label: 'Technique' },
  { id: 'repertoire', label: 'Repertoire' },
];

const TRACK_LABELS: Record<Track, string> = {
  foundation: 'Foundation',
  technique: 'Technique',
  repertoire: 'Repertoire',
};

export default function LearningPathPage() {
  const [activeTab, setActiveTab] = useState<Track>('foundation');

  return (
    <div className="p-6 space-y-5 max-w-350">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Lộ Trình Học</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">
          Sắp xếp bài học theo gói — kéo thả để sắp xếp lại
        </p>
      </div>

      {/* Tabs + content panel */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-6 py-3.5 text-[13px] font-medium transition-colors relative ${
                  isActive
                    ? 'text-[#1a3a2a]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {tab.sublabel && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#1a3a2a]/10 text-[#1a3a2a]'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tab.sublabel}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a3a2a] rounded-t" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-6">
          <CurriculumList
            track={activeTab}
            trackLabel={TRACK_LABELS[activeTab]}
          />
        </div>
      </div>
    </div>
  );
}
