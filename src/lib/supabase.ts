import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Donation } from '@/types/donation';
import { INITIAL_DONORS } from '@/data/initialDonors';

const STORAGE_KEY = 'kv2011_malitha_donations_v24_en';
const SUPABASE_CONFIG_KEY = 'kv2011_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getStoredSupabaseConfig(): SupabaseConfig | null {
  if (typeof window === 'undefined') return null;
  
  // First check env variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (envUrl && envKey && !envUrl.includes('your-supabase-url')) {
    return { url: envUrl, anonKey: envKey };
  }

  // Fallback to localStorage configured by admin
  try {
    const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read Supabase config from storage:', e);
  }

  return null;
}

export function saveSupabaseConfig(config: SupabaseConfig | null) {
  if (typeof window === 'undefined') return;
  try {
    if (!config) {
      localStorage.removeItem(SUPABASE_CONFIG_KEY);
    } else {
      localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
    }
  } catch (e) {
    console.error('Failed to save Supabase config:', e);
  }
}

let cachedClient: SupabaseClient | null = null;
let lastUsedConfigStr = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config || !config.url || !config.anonKey) {
    return null;
  }

  const configStr = `${config.url}_${config.anonKey}`;
  if (cachedClient && lastUsedConfigStr === configStr) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    lastUsedConfigStr = configStr;
    return cachedClient;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
}

// Local Storage Fallback helpers
export function getLocalDonations(): Donation[] {
  if (typeof window === 'undefined') return INITIAL_DONORS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DONORS));
      return INITIAL_DONORS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const valid = parsed.filter(
        (d) =>
          d &&
          typeof d === 'object' &&
          typeof d.donor_name === 'string' &&
          d.donor_name.trim().length > 0 &&
          !isNaN(Number(d.amount))
      );
      if (valid.length > 0) {
        return valid;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DONORS));
    return INITIAL_DONORS;
  } catch (e) {
    console.warn('Error reading from localStorage, using INITIAL_DONORS:', e);
    return INITIAL_DONORS;
  }
}

export function saveLocalDonations(donations: Donation[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
    // Broadcast change across tabs
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('kv2011_donations_channel');
      channel.postMessage({ type: 'DONATIONS_UPDATED', donations });
      channel.close();
    }
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

export function resetToInitialDonors(): Donation[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DONORS));
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('kv2011_donations_channel');
      channel.postMessage({ type: 'DONATIONS_UPDATED', donations: INITIAL_DONORS });
      channel.close();
    }
  }
  return INITIAL_DONORS;
}

