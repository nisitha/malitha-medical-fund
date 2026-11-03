'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Donation, CampaignStats, MonthFilter } from '@/types/donation';
import { INITIAL_DONORS, CAMPAIGN_INFO } from '@/data/initialDonors';
import {
  getSupabaseClient,
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  getLocalDonations,
  saveLocalDonations,
  resetToInitialDonors,
  SupabaseConfig,
} from '@/lib/supabase';

interface DonationContextType {
  donations: Donation[];
  filteredDonations: Donation[];
  loading: boolean;
  backendMode: 'supabase' | 'local';
  isRealtimeActive: boolean;
  stats: CampaignStats;
  currentMonthKey: string;
  monthFilter: MonthFilter;
  setMonthFilter: (filter: MonthFilter) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: 'latest' | 'oldest' | 'highest' | 'name';
  setSortBy: (sort: 'latest' | 'oldest' | 'highest' | 'name') => void;
  addDonation: (data: Omit<Donation, 'id' | 'created_at'>) => Promise<{ success: boolean; message?: string }>;
  updateDonation: (donation: Donation) => Promise<{ success: boolean; message?: string }>;
  deleteDonation: (id: string | number) => Promise<{ success: boolean; message?: string }>;
  refreshDonations: () => Promise<void>;
  resetToDefault: () => void;
  supabaseConfig: SupabaseConfig | null;
  updateSupabaseConfig: (config: SupabaseConfig | null) => Promise<boolean>;
  availableMonths: { key: string; label: string; count: number; total: number }[];
  isMounted: boolean;
}

export const normalizeDonation = (d: any): Donation => {
  const donorName = (d?.name || d?.donor_name || 'Anonymous Contributor').trim();
  const dateStr = d?.date || new Date().toISOString().split('T')[0];
  const monthStr = d?.month || (typeof dateStr === 'string' ? dateStr.substring(0, 7) : '2026-11');
  return {
    ...d,
    id: d?.id,
    name: donorName,
    donor_name: donorName,
    amount: Number(d?.amount) || 0,
    date: dateStr,
    month: monthStr,
    note: d?.note || d?.slip_note || undefined,
    slip_note: d?.slip_note || d?.note || undefined,
    payment_method: d?.payment_method || 'bank_transfer',
    is_verified: d?.is_verified ?? true,
    created_at: d?.created_at || new Date().toISOString(),
  };
};

const DonationContext = createContext<DonationContextType | undefined>(undefined);

export function DonationProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [donations, setDonations] = useState<Donation[]>(() => INITIAL_DONORS.map(normalizeDonation));
  const [loading, setLoading] = useState(true);
  const [backendMode, setBackendMode] = useState<'supabase' | 'local'>('local');
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig | null>(null);

  // Filters & Search
  const [monthFilter, setMonthFilter] = useState<MonthFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'highest' | 'name'>('latest');

  // Format current month key like '2026-11'
  const [currentMonthKey, setCurrentMonthKey] = useState('2026-11');

  useEffect(() => {
    setIsMounted(true);
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    setCurrentMonthKey(`${y}-${m}`);
  }, []);

  // Sync from Supabase or Local Storage
  const loadDonations = useCallback(async () => {
    setLoading(true);

    // Immediately load from localStorage so there is zero flash of outdated SSR data
    const local = getLocalDonations();
    if (local && local.length > 0) {
      setDonations(local.map(normalizeDonation));
    }

    const client = getSupabaseClient();
    const config = getStoredSupabaseConfig();
    setSupabaseConfig(config);

    if (client) {
      try {
        const { data, error } = await client
          .from('donations')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          console.warn('Supabase fetch error, falling back to local storage:', error.message);
          setBackendMode('local');
          setIsRealtimeActive(false);
          setDonations(local.map(normalizeDonation));
        } else if (data && data.length > 0) {
          setDonations(data.map(normalizeDonation));
          // Keep local storage fresh with cloud data
          saveLocalDonations(data.map(normalizeDonation));
          setBackendMode('supabase');
          setIsRealtimeActive(true);
        } else {
          // If Supabase table is empty (0 records), attempt to seed initial records
          try {
            const dbPayload = local.map((d) => ({
              name: (d.name || d.donor_name || 'Anonymous Contributor').trim(),
              amount: Number(d.amount) || 0,
              date: d.date,
              month: d.month || (d.date ? String(d.date).substring(0, 7) : '2026-11'),
              payment_method: d.payment_method || 'bank_transfer',
              slip_note: d.slip_note || d.note || null,
            }));
            const { error: seedErr } = await client.from('donations').insert(dbPayload);
            if (seedErr) {
              console.warn('Seeding supabase insert error (RLS or permissions):', seedErr.message);
            }
          } catch (seedErr) {
            console.warn('Seeding supabase failed:', seedErr);
          }
          setDonations(local.map(normalizeDonation));
          setBackendMode('supabase');
          setIsRealtimeActive(true);
        }
      } catch (err) {
        console.warn('Supabase connection failed:', err);
        setBackendMode('local');
        setIsRealtimeActive(false);
        setDonations(local.map(normalizeDonation));
      }
    } else {
      setBackendMode('local');
      setIsRealtimeActive(false);
      setDonations(local.map(normalizeDonation));
    }
    setLoading(false);
  }, []);

  // Initial load & real-time listener setup
  useEffect(() => {
    loadDonations();

    // 1. Cross-tab synchronization via BroadcastChannel
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('kv2011_donations_channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'DONATIONS_UPDATED' && Array.isArray(event.data.donations)) {
            setDonations(event.data.donations.map(normalizeDonation));
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // 2. Window storage event for browsers where BroadcastChannel isn't active
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'kv2011_malitha_donations_v24_en' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) {
            setDonations(updated.map(normalizeDonation));
          }
        } catch (err) {
          console.warn('Storage parse error:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 3. Supabase Realtime subscription if client is available
    const client = getSupabaseClient();
    let channel: ReturnType<SupabaseClient['channel']> | null = null;

    if (client) {
      try {
        channel = client
          .channel('public:donations_realtime')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'donations' },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newDonation = normalizeDonation(payload.new);
                setDonations((prev) => {
                  if (prev.some((d) => String(d.id) === String(newDonation.id))) return prev;
                  return [newDonation, ...prev];
                });
              } else if (payload.eventType === 'UPDATE') {
                const updated = normalizeDonation(payload.new);
                setDonations((prev) =>
                  prev.map((d) => (String(d.id) === String(updated.id) ? updated : d))
                );
              } else if (payload.eventType === 'DELETE') {
                const deleted = payload.old as { id: string | number };
                setDonations((prev) => prev.filter((d) => String(d.id) !== String(deleted.id)));
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsRealtimeActive(true);
            } else if (status === 'CHANNEL_ERROR') {
              setIsRealtimeActive(false);
            }
          });
      } catch (subErr) {
        console.warn('Realtime subscription error:', subErr);
      }
    }

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorageChange);
      if (channel && client) {
        client.removeChannel(channel);
      }
    };
  }, [loadDonations]);

  // Add new donation
  const addDonation = async (data: Omit<Donation, 'id' | 'created_at'>) => {
    const donorName = (data.name || data.donor_name || 'Anonymous Contributor').trim();
    const donorMonth = data.month || (data.date ? data.date.substring(0, 7) : '2026-11');
    const client = getSupabaseClient();

    if (client && backendMode === 'supabase') {
      try {
        const dbPayload = {
          name: donorName,
          amount: Number(data.amount),
          date: data.date,
          month: donorMonth,
          payment_method: data.payment_method || 'bank_transfer',
          slip_note: data.slip_note || data.note || null,
        };

        const { data: insertedData, error } = await client
          .from('donations')
          .insert([dbPayload])
          .select()
          .single();

        if (error) {
          console.warn('Failed to insert into Supabase, saving locally:', error);
          const newId = `don-${Date.now()}`;
          const newRecord = normalizeDonation({
            ...data,
            id: newId,
            name: donorName,
            donor_name: donorName,
          });
          const next = [newRecord, ...donations];
          setDonations(next);
          saveLocalDonations(next);
          const isRls = error.code === '42501' || (typeof error.message === 'string' && error.message.includes('row-level security'));
          return {
            success: true,
            warning: isRls,
            message: isRls
              ? 'Saved locally! (Supabase RLS is active: disable RLS in Supabase SQL editor to sync live across devices)'
              : 'Saved to local storage',
          };
        }

        const newRecord = normalizeDonation(insertedData);
        setDonations((prev) => {
          if (prev.some((d) => String(d.id) === String(newRecord.id))) return prev;
          return [newRecord, ...prev];
        });
        return { success: true, message: 'Added and synced to Supabase database' };
      } catch (err: any) {
        console.warn('Supabase exception, falling back to local:', err);
        const newId = `don-${Date.now()}`;
        const newRecord = normalizeDonation({
          ...data,
          id: newId,
          name: donorName,
          donor_name: donorName,
        });
        const next = [newRecord, ...donations];
        setDonations(next);
        saveLocalDonations(next);
        return { success: true, message: 'Saved locally' };
      }
    } else {
      const newId = `don-${Date.now()}`;
      const newRecord = normalizeDonation({
        ...data,
        id: newId,
        name: donorName,
        donor_name: donorName,
      });
      const next = [newRecord, ...donations];
      setDonations(next);
      saveLocalDonations(next);
      return { success: true, message: 'Added to local donation ledger' };
    }
  };

  // Update existing donation
  const updateDonation = async (updated: Donation) => {
    const donorName = (updated.name || updated.donor_name || 'Anonymous Contributor').trim();
    const normalized = normalizeDonation({ ...updated, name: donorName, donor_name: donorName });
    const client = getSupabaseClient();

    if (client && backendMode === 'supabase') {
      try {
        const dbPayload = {
          name: donorName,
          amount: Number(normalized.amount),
          date: normalized.date,
          month: normalized.month,
          payment_method: normalized.payment_method,
          slip_note: normalized.slip_note || normalized.note || null,
        };
        const { error } = await client
          .from('donations')
          .update(dbPayload)
          .eq('id', normalized.id);
        if (error) {
          console.warn('Supabase update failed:', error);
        }
      } catch (e) {
        console.warn('Supabase update exception:', e);
      }
    }
    const next = donations.map((d) => (String(d.id) === String(normalized.id) ? normalized : d));
    setDonations(next);
    saveLocalDonations(next);
    return { success: true, message: 'Donation updated successfully' };
  };

  // Delete donation
  const deleteDonation = async (id: string | number) => {
    const client = getSupabaseClient();
    if (client && backendMode === 'supabase') {
      try {
        const { error } = await client.from('donations').delete().eq('id', id);
        if (error) {
          console.warn('Supabase delete error:', error);
        }
      } catch (e) {
        console.warn('Supabase delete exception:', e);
      }
    }
    const next = donations.filter((d) => String(d.id) !== String(id));
    setDonations(next);
    saveLocalDonations(next);
    return { success: true, message: 'Donation entry removed' };
  };

  // Reset to default
  const resetToDefault = () => {
    const initial = resetToInitialDonors().map(normalizeDonation);
    setDonations(initial);
  };

  // Update Supabase configuration from Admin drawer
  const updateSupabaseConfig = async (config: SupabaseConfig | null): Promise<boolean> => {
    saveSupabaseConfig(config);
    setSupabaseConfig(config);
    await loadDonations();
    return true;
  };

  // Compute available months for filter tabs
  const availableMonths = useMemo(() => {
    const monthMap: Record<string, { count: number; total: number; label: string }> = {};

    donations.forEach((d) => {
      const ym = d.date.substring(0, 7); // e.g. '2026-11'
      if (!monthMap[ym]) {
        const [year, month] = ym.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
        const label = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        monthMap[ym] = { count: 0, total: 0, label };
      }
      monthMap[ym].count += 1;
      monthMap[ym].total += Number(d.amount);
    });

    // Ensure November 2026 and December 2026 always show if not present
    if (!monthMap['2026-11']) {
      monthMap['2026-11'] = { count: 0, total: 0, label: 'November 2026' };
    }
    if (!monthMap['2026-12']) {
      monthMap['2026-12'] = { count: 0, total: 0, label: 'December 2026' };
    }

    return Object.entries(monthMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, val]) => ({
        key,
        label: val.label,
        count: val.count,
        total: val.total,
      }));
  }, [donations]);

  // Campaign Stats calculation
  const stats: CampaignStats = useMemo(() => {
    const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);
    const totalDonors = donations.length;
    
    // Subtotal for November 2026 (or active selected month)
    const activeMonthKey = monthFilter === 'all' ? '2026-11' : monthFilter;
    const currentMonthTotal = donations
      .filter((d) => d.date.startsWith(activeMonthKey))
      .reduce((sum, d) => sum + Number(d.amount), 0);

    return {
      totalAmount,
      totalDonors,
      currentMonthTotal,
      targetAmount: CAMPAIGN_INFO.targetAmount,
    };
  }, [donations, monthFilter]);

  // Filtered & Sorted Donations
  const filteredDonations = useMemo(() => {
    let result = [...donations];

    // Filter by month
    if (monthFilter !== 'all') {
      result = result.filter((d) => d.date.startsWith(monthFilter));
    }

    // Filter by search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((d) => {
        const dName = (d.name || d.donor_name || '').toLowerCase();
        const dNote = (d.note || d.slip_note || '').toLowerCase();
        const dAmount = String(d.amount ?? '');
        const dDate = String(d.date ?? '');
        return (
          dName.includes(q) ||
          dNote.includes(q) ||
          dAmount.includes(q) ||
          dDate.includes(q)
        );
      });
    }

    // Sort safely
    result.sort((a, b) => {
      if (sortBy === 'latest') {
        const timeDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (timeDiff !== 0) return timeDiff;
        return String(b.id || '').localeCompare(String(a.id || ''));
      }
      if (sortBy === 'oldest') {
        const timeDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (timeDiff !== 0) return timeDiff;
        return String(a.id || '').localeCompare(String(b.id || ''));
      }
      if (sortBy === 'highest') {
        return Number(b.amount) - Number(a.amount);
      }
      if (sortBy === 'name') {
        const nameA = (a.name || a.donor_name || '').toLowerCase();
        const nameB = (b.name || b.donor_name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return result;
  }, [donations, monthFilter, searchTerm, sortBy]);

  return (
    <DonationContext.Provider
      value={{
        donations,
        filteredDonations,
        loading,
        backendMode,
        isRealtimeActive,
        stats,
        currentMonthKey,
        monthFilter,
        setMonthFilter,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        addDonation,
        updateDonation,
        deleteDonation,
        refreshDonations: loadDonations,
        resetToDefault,
        supabaseConfig,
        updateSupabaseConfig,
        availableMonths,
        isMounted,
      }}
    >
      {children}
    </DonationContext.Provider>
  );
}

export function useDonations() {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error('useDonations must be used within a DonationProvider');
  }
  return context;
}
