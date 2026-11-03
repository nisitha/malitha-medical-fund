'use client';

import React from 'react';
import { 
  Coins, 
  Users, 
  CalendarDays, 
  TrendingUp, 
  CheckCircle2, 
  Target, 
  ShieldCheck
} from 'lucide-react';
import { useDonations } from '@/context/DonationContext';

export const SummaryCards: React.FC = () => {
  const { stats, monthFilter, availableMonths } = useDonations();

  // Determine label for month subtotal card
  const monthLabel = React.useMemo(() => {
    if (monthFilter === 'all') {
      return 'November 2026';
    }
    const found = availableMonths.find((m) => m.key === monthFilter);
    return found ? found.label : 'Current Month';
  }, [monthFilter, availableMonths]);

  // Deterministic currency formatter for SSR and hydration consistency
  const formatLKR = (val: number) => {
    return `LKR ${Number(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const progressPercentage = Math.min(
    100,
    Math.round((stats.totalAmount / stats.targetAmount) * 100)
  );

  const remainingAmount = Math.max(0, stats.targetAmount - stats.totalAmount);

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      {/* Modern Dashboard Hero Card - Highly impactful on Mobile & Desktop */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0b223d] to-[#081a2e] text-white p-5 sm:p-7 shadow-lg border border-slate-800">
        {/* Subtle decorative glowing background shapes */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Header Badge Row */}
        <div className="relative z-10 flex items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold tracking-wider uppercase text-[11px] text-emerald-400">
              Live Verified Relief Fund
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-xs text-[11px] text-slate-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>KV 2011 A/L Trustee</span>
          </div>
        </div>

        {/* Main Stat: Total Collected Amount */}
        <div className="relative z-10 pt-4 sm:pt-5">
          <p className="text-xs sm:text-sm font-medium text-slate-300 flex items-center gap-1.5">
            <span>මුළු එකතුව • Total Funds Collected</span>
          </p>
          
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-white">
              {formatLKR(stats.totalAmount)}
            </h2>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono">
              <TrendingUp className="w-3 h-3" />
              <span>{stats.totalDonors} Contributors</span>
            </div>
          </div>
        </div>

        {/* Milestone Target & Progress Bar */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/10 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-white">Target Milestone:</span>
              <span className="font-mono font-bold text-slate-200">{formatLKR(stats.targetAmount)}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] sm:text-xs">
              <span className="text-slate-400">Remaining:</span>
              <span className="font-mono font-bold text-amber-300">{formatLKR(remainingAmount)}</span>
              <span className="font-mono font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                {progressPercentage}%
              </span>
            </div>
          </div>

          {/* Glowing Animated Progress Bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-white/10 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-700 ease-out shadow-xs shadow-emerald-500/50"
              style={{ width: `${Math.max(progressPercentage, 4)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modern 2-Column Metric Grid on Mobile (Responsive) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Card 1: Verified Donors */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-2 transition-all hover:border-slate-300">
          <div>
            <span className="text-[10px] sm:text-xs font-bold tracking-wide uppercase text-slate-500 block">
              Verified Donors
            </span>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                {stats.totalDonors}
              </span>
              <span className="text-xs font-semibold text-slate-500">Donors</span>
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-800 font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">100% Transparent</span>
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-[#0b3866] border border-blue-100 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Card 2: Current Month Subtotal */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-2 transition-all hover:border-slate-300">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold tracking-wide uppercase text-slate-500 block truncate">
              {monthLabel}
            </span>
            <div className="mt-1">
              <span className="text-sm sm:text-lg font-black text-slate-900 tracking-tight font-mono truncate block">
                {formatLKR(stats.currentMonthTotal)}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1 truncate">
              <CalendarDays className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">Current Period</span>
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-100 flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
