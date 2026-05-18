interface LeaderboardTabsProps {
  activeTab: 'weekly' | 'monthly' | 'all-time';
  onTabChange: (tab: 'weekly' | 'monthly' | 'all-time') => void;
}

export function LeaderboardTabs({ activeTab, onTabChange }: LeaderboardTabsProps) {
  return (
    <div className="inline-flex bg-gray-100/80 p-1 rounded-lg mb-6 shadow-sm border border-gray-200/60">
      <button
        onClick={() => onTabChange('weekly')}
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
          activeTab === 'weekly'
            ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
        }`}
      >
        Tuần
      </button>
      <button
        onClick={() => onTabChange('monthly')}
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
          activeTab === 'monthly'
            ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
        }`}
      >
        Tháng
      </button>
      <button
        onClick={() => onTabChange('all-time')}
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
          activeTab === 'all-time'
            ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
        }`}
      >
        Mọi thời đại
      </button>
    </div>
  );
}
