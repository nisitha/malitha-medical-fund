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
  deleteDonation: (id: string) => Promise<{ success: boolean; message?: string }>;
  refreshDonations: () => Promise<void>;
  resetToDefault: () => void;
  supabaseConfig: SupabaseConfig | null;
  updateSupabaseConfig: (config: SupabaseConfig | null) => Promise<boolean>;
  availableMonths: { key: string; label: string; count: number; total: number }[];
  isMounted: boolean;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

export function DonationProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [donations, setDonations] = useState<Donation[]>(INITIAL_DONORS);
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
          const local = getLocalDonations();
          setDonations(local);
        } else if (data && data.length > 0) {
          setDonations(data as Donation[]);
          setBackendMode('supabase');
          setIsRealtimeActive(true);
        } else {
          // If table is empty, seed it with INITIAL_DONORS or local donations
          const local = getLocalDonations();
          try {
            await client.from('donations').upsert(local);
            setDonations(local);
          } catch (seedErr) {
            console.warn('Seeding supabase failed:', seedErr);
            setDonations(local);
          }
          setBackendMode('supabase');
          setIsRealtimeActive(true);
        }
      } catch (err) {
        console.warn('Supabase connection failed:', err);
        setBackendMode('local');
        setIsRealtimeActive(false);
        setDonations(getLocalDonations());
      }
    } else {
      setBackendMode('local');
      setIsRealtimeActive(false);
      setDonations(getLocalDonations());
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
            setDonations(event.data.donations);
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
            setDonations(updated);
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
                const newDonation = payload.new as Donation;
                setDonations((prev) => {
                  if (prev.some((d) => d.id === newDonation.id)) return prev;
                  return [newDonation, ...prev];
                });
              } else if (payload.eventType === 'UPDATE') {
                const updated = payload.new as Donation;
                setDonations((prev) =>
                  prev.map((d) => (d.id === updated.id ? updated : d))
                );
              } else if (payload.eventType === 'DELETE') {
                const deleted = payload.old as { id: string };
                setDonations((prev) => prev.filter((d) => d.id !== deleted.id));
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
    const newId = `don-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRecord: Donation = {
      ...data,
      id: newId,
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    const client = getSupabaseClient();
    if (client && backendMode === 'supabase') {
      try {
        const { error } = await client.from('donations').insert([newRecord]);
        if (error) {
          console.warn('Failed to insert into Supabase, saving locally:', error);
          const next = [newRecord, ...donations];
          setDonations(next);
          saveLocalDonations(next);
          return { success: true, message: 'Saved to local storage (Supabase write had issue)' };
        }
        // State will update via real-time subscription or optimistic update
        setDonations((prev) => [newRecord, ...prev]);
        return { success: true, message: 'Added and synced to Supabase database' };
      } catch (err: any) {
        console.warn('Supabase exception, falling back to local:', err);
        const next = [newRecord, ...donations];
        setDonations(next);
        saveLocalDonations(next);
        return { success: true, message: 'Saved locally' };
      }
    } else {
      const next = [newRecord, ...donations];
      setDonations(next);
      saveLocalDonations(next);
      return { success: true, message: 'Added to local donation ledger' };
    }
  };

  // Update existing donation
  const updateDonation = async (updated: Donation) => {
    const client = getSupabaseClient();
    if (client && backendMode === 'supabase') {
      try {
        const { error } = await client
          .from('donations')
          .update(updated)
          .eq('id', updated.id);
        if (error) {
          console.warn('Supabase update failed:', error);
        }
      } catch (e) {
        console.warn('Supabase update exception:', e);
      }
    }
    const next = donations.map((d) => (d.id === updated.id ? updated : d));
    setDonations(next);
    saveLocalDonations(next);
    return { success: true, message: 'Donation updated successfully' };
  };

  // Delete donation
  const deleteDonation = async (id: string) => {
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
    const next = donations.filter((d) => d.id !== id);
    setDonations(next);
    saveLocalDonations(next);
    return { success: true, message: 'Donation entry removed' };
  };

  // Reset to default
  const resetToDefault = () => {
    const initial = resetToInitialDonors();
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
      result = result.filter(
        (d) =>
          d.donor_name.toLowerCase().includes(q) ||
          (d.note && d.note.toLowerCase().includes(q)) ||
          d.amount.toString().includes(q) ||
          d.date.includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime() || b.id.localeCompare(a.id);
      }
      if (sortBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime() || a.id.localeCompare(b.id);
      }
      if (sortBy === 'highest') {
        return b.amount - a.amount;
      }
      if (sortBy === 'name') {
        return a.donor_name.localeCompare(b.donor_name);
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
