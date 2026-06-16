export default function SummaryCard({ title, amount, type, icon }) {
  // Dynamic color for balance: green if positive, red if negative
  const isNegativeBalance = type === 'balance' && amount < 0;

  const colorMap = {
    income: {
      bg: 'from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      icon: 'bg-emerald-500/10 text-emerald-400',
      glow: 'shadow-emerald-500/5',
    },
    expense: {
      bg: 'from-rose-500/10 to-rose-500/5',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      icon: 'bg-rose-500/10 text-rose-400',
      glow: 'shadow-rose-500/5',
    },
    balance: {
      bg: isNegativeBalance ? 'from-rose-500/10 to-rose-500/5' : 'from-violet-500/10 to-violet-500/5',
      border: isNegativeBalance ? 'border-rose-500/20' : 'border-violet-500/20',
      text: isNegativeBalance ? 'text-rose-400' : 'text-violet-400',
      icon: isNegativeBalance ? 'bg-rose-500/10 text-rose-400' : 'bg-violet-500/10 text-violet-400',
      glow: isNegativeBalance ? 'shadow-rose-500/5' : 'shadow-violet-500/5',
    },
  };

  const colors = colorMap[type] || colorMap.balance;

  const formatCurrency = (value) => {
    const absValue = Math.abs(value);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(absValue);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} p-5 sm:p-6 shadow-lg ${colors.glow} transition-all hover:scale-[1.02] hover:shadow-xl`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <p className={`text-2xl sm:text-3xl font-bold ${colors.text} tracking-tight`}>
            {type === 'balance' && amount < 0 ? '-' : ''}
            {type === 'expense' && amount > 0 ? '-' : ''}
            {formatCurrency(amount)}
          </p>
          {/* Negative balance warning */}
          {isNegativeBalance && (
            <p className="text-xs text-rose-400/80 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              Pengeluaran melebihi pemasukan
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl ${colors.icon} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
