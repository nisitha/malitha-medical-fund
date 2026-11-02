'use client';

import React from 'react';
import { Search, X, ArrowDownUp, UserCheck } from 'lucide-react';
import { useDonations } from '@/context/DonationContext';

export const SearchBar: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    filteredDonations,
    donations,
  } = useDonations();

  return (
    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search Input Box */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by contributor name or amount..."
          className="w-full pl-10 pr-9 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0b3866] focus:ring-1 focus:ring-[#0b3866] transition-colors shadow-2xs"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sort & Counter Controls */}
      <div className="flex items-center gap-2 justify-between sm:justify-start">
        {/* Donor Count Badge */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 font-medium shadow-2xs">
          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            Showing <strong className="text-slate-900 font-mono">{filteredDonations.length}</strong> of{' '}
            <strong className="text-slate-600 font-mono">{donations.length}</strong>
          </span>
        </div>

        {/* Sort Dropdown */}
        <div className="relative flex items-center">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-[#0b3866] cursor-pointer shadow-2xs"
          >
            <option value="latest">Sort: Latest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="highest">Sort: Highest Amount</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
          <div className="pointer-events-none absolute right-2.5 text-slate-400">
            <ArrowDownUp className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
