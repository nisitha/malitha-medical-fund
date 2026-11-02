export type PaymentMethod = 'bank_transfer' | 'cash' | 'online' | 'other';

export interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  payment_method?: PaymentMethod;
  is_verified?: boolean;
  created_at?: string;
}

export type MonthFilter = 'all' | '2026-11' | '2026-12' | string;

export interface CampaignStats {
  totalAmount: number;
  totalDonors: number;
  currentMonthTotal: number;
  targetAmount: number;
}

