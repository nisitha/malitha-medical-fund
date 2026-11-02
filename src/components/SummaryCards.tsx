'use client';

import React from 'react';
import { Coins, Users, CalendarDays, TrendingUp, CheckCircle2, Target } from 'lucide-react';
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

  return (
    <div className="w-full space-y-4">
      {/* 3 Main Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Total Collected */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide uppercase text-slate-500">
              Total Funds Collected
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formatLKR(stats.totalAmount)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-emerald-800 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified bank & online deposits</span>
            </div>
          </div>
        </div>

        {/* Total Donors */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide uppercase text-slate-500">
              Verified Contributors
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalDonors}{' '}
              <span className="text-sm sm:text-base font-semibold text-slate-500">Donors</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>KV 2011 A/L Batch & Friends</span>
            </div>
          </div>
        </div>

        {/* Current Month Subtotal */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wide uppercase text-slate-500">
              {monthLabel} Subtotal
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {formatLKR(stats.currentMonthTotal)}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-600 font-medium">
              <span>Contributions in selected period</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Progress Bar Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-700" />
            <span className="font-bold text-slate-800">Campaign Target Progress:</span>
            <span className="font-mono text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {progressPercentage}% of Target
            </span>
          </div>
          <div className="text-slate-600">
            Initial Target Milestone: <strong className="text-slate-900 font-mono">{formatLKR(stats.targetAmount)}</strong>
            {' • '}
            Remaining:{' '}
            <span className="text-rose-800 font-semibold font-mono">
              {formatLKR(Math.max(0, stats.targetAmount - stats.totalAmount))}
            </span>
          </div>
        </div>

        {/* Visual Progress Track */}
        <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 transition-all duration-700 ease-out"
            style={{ width: `${Math.max(progressPercentage, 4)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
