import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from 'recharts';

const EXPENSE_COLORS = [
  '#f43f5e', // rose-500
  '#f59e0b', // amber-500
  '#d946ef', // fuchsia-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#eab308', // yellow-500
  '#a855f7', // purple-500
  '#db2777', // pink-600
];

const INCOME_COLORS = [
  '#10b981', // emerald-500
  '#3b82f6', // blue-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#14b8a6', // teal-500
  '#22c55e', // green-500
  '#0ea5e9', // sky-500
  '#6366f1', // indigo-500
  '#0d9488', // teal-600
  '#2563eb', // blue-600
];

export default function ExpenseChart({ transactions, type = 'expense' }) {
  const { data, total } = useMemo(() => {
    if (!transactions) return { data: [], total: 0 };

    const filtered = transactions.filter((t) => t.type === type);
    const totalAmount = filtered.reduce((sum, t) => sum + Number(t.amount), 0);
    
    // Group by category
    const grouped = filtered.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {});

    // Convert to array and sort by amount descending
    const chartData = Object.entries(grouped)
      .map(([name, value]) => ({ 
        name, 
        value,
        percent: totalAmount > 0 ? ((value / totalAmount) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.value - a.value);

    return { data: chartData, total: totalAmount };
  }, [transactions, type]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg className="w-12 h-12 mb-3 text-gray-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
        </svg>
        <p className="text-sm font-medium text-gray-400">Belum ada data {type === 'expense' ? 'pengeluaran' : 'pemasukan'}</p>
        <p className="text-xs text-gray-600 mt-1">Tambahkan {type === 'expense' ? 'pengeluaran' : 'pemasukan'} pertama untuk melihat analisis</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg shadow-xl">
          <p className="text-gray-300 text-sm font-medium mb-1">{payload[0].name}</p>
          <p className="text-white font-bold">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">{payload[0].payload.percent}% dari total</p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = ({ payload }) => (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-gray-400">
            {entry.value} <span className="text-gray-600">({data[index]?.percent}%)</span>
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => {
              const colors = type === 'expense' ? EXPENSE_COLORS : INCOME_COLORS;
              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
            })}
            <Label
              position="center"
              content={({ viewBox }) => {
                const { cx, cy } = viewBox || {};
                if (cx == null || cy == null) return null;
                return (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={cx}
                      dy="-0.5em"
                      fill="#9ca3af"
                      fontSize="10"
                      fontWeight="600"
                    >
                      Total
                    </tspan>
                    <tspan
                      x={cx}
                      dy="1.4em"
                      fill="#ffffff"
                      fontSize="14"
                      fontWeight="700"
                    >
                      {formatCurrency(total)}
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
