'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const DATA = [
  { month: 'T1', revenue: 12.4 },
  { month: 'T2', revenue: 18.2 },
  { month: 'T3', revenue: 15.8 },
  { month: 'T4', revenue: 22.1 },
  { month: 'T5', revenue: 19.5 },
  { month: 'T6', revenue: 28.4 },
  { month: 'T7', revenue: 32.1 },
  { month: 'T8', revenue: 29.8 },
  { month: 'T9', revenue: 35.2 },
  { month: 'T10', revenue: 38.9 },
  { month: 'T11', revenue: 42.1 },
  { month: 'T12', revenue: 48.5 },
];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  /** Khi vẽ doanh thu theo ngày: "MM/YYYY" của tháng đang xem */
  periodLabel?: string;
}

function RevenueTooltip({ active, payload, label, periodLabel }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2.5 text-[13px]">
      <p className="text-gray-400 text-[11px] mb-0.5">
        {periodLabel ? `Ngày ${label}/${periodLabel}` : `Tháng ${label}`}
      </p>
      <p className="font-bold text-[#2d6a4f] text-base">
        {payload[0].value}M ₫
      </p>
    </div>
  );
}

export function RevenueChart({
  data,
  periodLabel,
}: {
  data?: { month: string; revenue: number }[];
  periodLabel?: string;
}) {
  const chartData = data?.length ? data : DATA;
  return (
    <div className="h-56 w-full sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#f3f4f6"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}M`}
            width={38}
          />
          <Tooltip content={<RevenueTooltip periodLabel={periodLabel} />} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2d6a4f"
            strokeWidth={2.5}
            fill="url(#gradRevenue)"
            dot={false}
            activeDot={{ r: 5, fill: '#2d6a4f', strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
