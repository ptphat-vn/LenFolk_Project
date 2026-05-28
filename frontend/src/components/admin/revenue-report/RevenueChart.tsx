'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const data = [
  { name: 'T1', foundation: 12.8, technique: 28.4, repertoire: 8.2 },
  { name: 'T2', foundation: 14.2, technique: 31.2, repertoire: 9.8 },
  { name: 'T3', foundation: 15.6, technique: 35.4, repertoire: 11.4 },
  { name: 'T4', foundation: 14.1, technique: 29.8, repertoire: 10.2 },
  { name: 'T5', foundation: 16.8, technique: 38.2, repertoire: 12.8 },
  { name: 'T6', foundation: 18.4, technique: 42.6, repertoire: 14.2 },
  { name: 'T7', foundation: 19.2, technique: 44.8, repertoire: 15.6 },
  { name: 'T8', foundation: 17.8, technique: 40.2, repertoire: 13.8 },
  { name: 'T9', foundation: 20.4, technique: 46.8, repertoire: 16.4 },
  { name: 'T10', foundation: 21.8, technique: 49.2, repertoire: 17.8 },
  { name: 'T11', foundation: 23.2, technique: 52.4, repertoire: 19.2 },
  { name: 'T12', foundation: 25.6, technique: 58.6, repertoire: 21.4 },
];

export function RevenueChart() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 mt-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Biểu Đồ Doanh Thu</h2>
        <p className="text-sm text-gray-500">
          Đơn vị: Triệu VNĐ (Chia theo hạng mục)
        </p>
      </div>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 13 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 13 }}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              cursor={{ fill: '#f3f4f6' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="foundation" name="Foundation" stackId="a" fill="#1a3a2a" radius={[0, 0, 4, 4]} />
            <Bar dataKey="technique" name="Technique" stackId="a" fill="#2d6a4f" />
            <Bar dataKey="repertoire" name="Repertoire" stackId="a" fill="#52b788" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
