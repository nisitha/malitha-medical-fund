'use client';

import React from 'react';
import { Calendar, Layers } from 'lucide-react';
import { useDonations } from '@/context/DonationContext';
import { MonthFilter } from '@/types/donation';

export const MonthlyTabs: React.FC = () => {
  const { monthFilter, setMonthFilter, availableMonths, donations } = useDonations();

  const tabs = [
    {
      key: 'all' as MonthFilter,
      label: 'All Time',
      count: donations.length,
    },
    ...availableMonths.map((m) => ({
      key: m.key as MonthFilter,
      label: m.label,
      count: m.count,
    })),
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-rose-800" />
          Filter Contributions by Month
        </span>
      </div>

      {/* Segmented Button Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = monthFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setMonthFilter(tab.key)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0b3866] text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {tab.key === 'all' && <Layers className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
