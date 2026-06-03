'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface Column<T> {
  header: ReactNode;
  render: (item: T, index: number) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyIcon?: LucideIcon;
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  minRows?: number;
}

export function DataTable<T>({ 
  columns, 
  data, 
  isLoading, 
  emptyIcon: EmptyIcon, 
  emptyMessage = "Không có dữ liệu",
  keyExtractor,
  onRowClick,
  minRows = 10
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto min-h-[400px]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((_, j) => (
                  <td key={j} className="px-5 py-4">
                    <div className="h-4 bg-gray-100 rounded-md w-full max-w-[120px]" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-32 text-gray-400">
                {EmptyIcon && <EmptyIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />}
                <p className="text-[14px]">{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            <>
              {data.map((item, index) => (
                <tr 
                  key={keyExtractor(item)} 
                  className={`hover:bg-gray-50/60 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((col, idx) => (
                    <td key={idx} className={`px-5 py-3.5 ${col.className || ''}`}>
                      {col.render(item, index)}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Padding empty rows to maintain fixed height */}
              {data.length > 0 && data.length < minRows && (
                Array.from({ length: minRows - data.length }).map((_, i) => (
                  <tr key={`empty-row-${i}`} className="pointer-events-none">
                    {columns.map((_, idx) => (
                      <td key={idx} className="px-5 py-3.5">
                        <div className="opacity-0 select-none">&nbsp;</div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
