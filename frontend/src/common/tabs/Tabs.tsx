'use client';

export interface TabOption {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (id: string) => void;
  getBadgeClass?: (id: string) => string;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, getBadgeClass, className = "" }: TabsProps) {
  return (
    <div className={`flex border-b border-gray-100 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-3.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
              isActive ? 'text-[#1a3a2a]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  getBadgeClass ? getBadgeClass(tab.id) : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a3a2a] rounded-t" />
            )}
          </button>
        );
      })}
    </div>
  );
}
