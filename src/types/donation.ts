export type PaymentMethod = 'bank_transfer' | 'cash' | 'online' | 'other' | string;

export interface Donation {
  id: string | number;
  donor_name?: string;
  name?: string;
  amount: number;
  date: string; // YYYY-MM-DD
  month?: string;
  note?: string;
  slip_note?: string;
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
