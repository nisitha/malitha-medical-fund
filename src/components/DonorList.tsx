'use client';

import React from 'react';
import { useDonations } from '@/context/DonationContext';
import { Donation } from '@/types/donation';
import { CheckCircle2, Calendar, CreditCard, Banknote, Globe, SearchX, Edit3, Trash2 } from 'lucide-react';

interface DonorListProps {
  isAdminUnlocked?: boolean;
  onEditDonation?: (donation: Donation) => void;
  onDeleteDonation?: (id: string) => void;
}

export const DonorList: React.FC<DonorListProps> = ({
  isAdminUnlocked = false,
  onEditDonation,
  onDeleteDonation,
}) => {
  const { filteredDonations, searchTerm, setSearchTerm, monthFilter, setMonthFilter } = useDonations();

  // Deterministic currency formatter for SSR and hydration consistency
  const formatLKR = (val?: number) => {
    const num = Number(val) || 0;
    return `LKR ${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const [y, m, d] = String(dateStr).split('-');
      if (!y || !m || !d) return String(dateStr);
      const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return dt.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return String(dateStr);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'KV';
    const clean = String(name).replace(/[()]/g, '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length === 0 || !parts[0]) return 'KV';
    if (parts.length === 1) {
      return Array.from(parts[0]).slice(0, 2).join('').toUpperCase();
    }
    return ((Array.from(parts[0])[0] || '') + (Array.from(parts[parts.length - 1])[0] || '')).toUpperCase();
  };

  const getAvatarStyle = (name?: string) => {
    const styles = [
      'bg-blue-50 text-[#0b3866] border-blue-200',
      'bg-rose-50 text-rose-900 border-rose-200',
      'bg-emerald-50 text-emerald-800 border-emerald-200',
      'bg-amber-50 text-amber-900 border-amber-200',
      'bg-slate-100 text-slate-800 border-slate-200',
    ];
    if (!name) return styles[0];
    let hash = 0;
    const str = String(name);
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return styles[Math.abs(hash) % styles.length];
  };

  const getPaymentBadge = (method?: string) => {
    switch (method) {
      case 'bank_transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[#0b3866] border border-blue-200 text-[10px] font-semibold">
            <CreditCard className="w-3 h-3" />
            Bank Transfer
          </span>
        );
      case 'online':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
            <Globe className="w-3 h-3" />
            Online CEFT
          </span>
        );
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-semibold">
            <Banknote className="w-3 h-3" />
            Cash Handover
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
            Verified Deposit
          </span>
        );
    }
  };

  if (filteredDonations.length === 0) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center text-slate-600 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <SearchX className="w-6 h-6 text-slate-400" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No Contributions Found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
          No records matching &ldquo;{searchTerm}&rdquo; in the selected period.
        </p>
        <div className="flex items-center justify-center gap-2">
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          )}
          {monthFilter !== 'all' && (
            <button
              onClick={() => setMonthFilter('all')}
              className="px-3.5 py-1.5 rounded-lg bg-[#0b3866] hover:bg-[#082849] text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              Show All Time
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Mobile Card Layout (Visible on sm & below) */}
      <div className="sm:hidden space-y-2.5">
        {filteredDonations.map((donor) => (
          <div
            key={donor.id}
            className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-slate-900 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-xs ${getAvatarStyle(
                    donor.donor_name
                  )}`}
                >
                  {getInitials(donor.donor_name)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900 leading-tight">
                      {donor.donor_name}
                    </span>
                    {donor.is_verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(donor.date)}
                    </span>
                    <span>•</span>
                    {getPaymentBadge(donor.payment_method)}
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <span className="text-sm font-extrabold font-mono text-emerald-800">
                  {formatLKR(donor.amount)}
                </span>
              </div>
            </div>

            {/* Admin Controls if unlocked */}
            {isAdminUnlocked && (
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                {onEditDonation && (
                  <button
                    onClick={() => onEditDonation(donor)}
                    className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
                {onDeleteDonation && (
                  <button
                    onClick={() => onDeleteDonation(donor.id)}
                    className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop / Tablet Table View (Visible on sm & above) */}
      <div className="hidden sm:block overflow-hidden rounded-xl bg-white border border-slate-200 shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3 pl-4 pr-2 w-12 text-center">#</th>
              <th className="py-3 px-3">Contributor</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Channel</th>
              <th className="py-3 pr-4 pl-3 text-right">Amount (LKR)</th>
              {isAdminUnlocked && <th className="py-3 px-3 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredDonations.map((donor, idx) => (
              <tr
                key={donor.id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="py-3 pl-4 pr-2 text-center font-mono text-xs text-slate-400">
                  {idx + 1}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-md border flex items-center justify-center font-bold text-[11px] shrink-0 ${getAvatarStyle(
                        donor.donor_name
                      )}`}
                    >
                      {getInitials(donor.donor_name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">
                          {donor.donor_name}
                        </span>
                        {donor.is_verified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 whitespace-nowrap text-xs text-slate-500 font-mono">
                  {formatDate(donor.date)}
                </td>
                <td className="py-3 px-3 whitespace-nowrap">
                  {getPaymentBadge(donor.payment_method)}
                </td>
                <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap font-mono font-bold text-slate-900 text-sm">
                  {formatLKR(donor.amount)}
                </td>
                {isAdminUnlocked && (
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {onEditDonation && (
                        <button
                          onClick={() => onEditDonation(donor)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Edit donation"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteDonation && (
                        <button
                          onClick={() => onDeleteDonation(donor.id)}
                          className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                          title="Delete donation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
