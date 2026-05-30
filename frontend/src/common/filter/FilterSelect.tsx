'use client';

import { Filter } from 'lucide-react';

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  className?: string;
  icon?: boolean;
}

export function FilterSelect({ value, onChange, options, className = "", icon = false }: FilterSelectProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {icon && <Filter className="w-3.5 h-3.5 text-gray-400" />}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 px-3 w-full rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f] bg-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
