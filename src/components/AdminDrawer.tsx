'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  PlusCircle,
  Database,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle2,
  KeyRound,
  DollarSign,
  User,
  Calendar,
  FileText,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { useDonations } from '@/context/DonationContext';
import { useToast } from './Toast';
import { Donation, PaymentMethod } from '@/types/donation';
import confetti from 'canvas-confetti';

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminUnlocked: boolean;
  setIsAdminUnlocked: (val: boolean) => void;
  editingDonation: Donation | null;
  setEditingDonation: (donation: Donation | null) => void;
}

export const AdminDrawer: React.FC<AdminDrawerProps> = ({
  isOpen,
  onClose,
  isAdminUnlocked,
  setIsAdminUnlocked,
  editingDonation,
  setEditingDonation,
}) => {
  const {
    addDonation,
    updateDonation,
    resetToDefault,
    donations,
    supabaseConfig,
    updateSupabaseConfig,
    isRealtimeActive,
  } = useDonations();
  const { showToast } = useToast();

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [adminTab, setAdminTab] = useState<'add' | 'settings'>('add');

  // Form State
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState('2026-11-02');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Supabase Config Form State
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig?.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(supabaseConfig?.anonKey || '');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  useEffect(() => {
    if (editingDonation) {
      setDonorName(editingDonation.name || editingDonation.donor_name || '');
      setAmount(editingDonation.amount.toString());
      setDate(editingDonation.date);
      setNote(editingDonation.note || editingDonation.slip_note || '');
      setPaymentMethod(editingDonation.payment_method || 'bank_transfer');
      setAdminTab('add');
    }
  }, [editingDonation]);

  if (!isOpen) return null;

  const handlePinDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setPinError(false);

      if (nextPin.length === 4) {
        if (nextPin === '2626') {
          setIsAdminUnlocked(true);
          setPin('');
          showToast('Admin Mode Active', 'success', 'Kalutara Vidyalaya 2011 Committee Authorized');
        } else {
          setPinError(true);
          showToast('Incorrect PIN', 'error', 'Please enter the valid authorization PIN');
          setTimeout(() => {
            setPin('');
            setPinError(false);
          }, 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const handleClearPin = () => {
    setPin('');
    setPinError(false);
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    setPin('');
    setEditingDonation(null);
    showToast('Admin Session Locked', 'info');
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) {
      showToast('Name Required', 'error', 'Please enter contributor name');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Valid Amount Required', 'error', 'Please enter a valid donation amount');
      return;
    }

    setIsSubmitting(true);

    if (editingDonation) {
      const updated: Donation = {
        ...editingDonation,
        name: donorName.trim(),
        donor_name: donorName.trim(),
        amount: numAmount,
        date,
        note: note.trim() || undefined,
        slip_note: note.trim() || undefined,
        payment_method: paymentMethod,
      };

      const res = await updateDonation(updated);
      setIsSubmitting(false);
      if (res.success) {
        showToast('Donation Updated', 'success', `${donorName} - LKR ${numAmount.toLocaleString()}`);
        setEditingDonation(null);
        resetForm();
        onClose();
      }
    } else {
      const res = await addDonation({
        name: donorName.trim(),
        donor_name: donorName.trim(),
        amount: numAmount,
        date,
        note: note.trim() || undefined,
        slip_note: note.trim() || undefined,
        payment_method: paymentMethod,
      });

      setIsSubmitting(false);

      if (res.success) {
        showToast('Donation Recorded', 'success', `${donorName} - LKR ${numAmount.toLocaleString()}`);
        try {
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.6 },
          });
        } catch (e) {}
        resetForm();
        onClose();
      }
    }
  };

  const resetForm = () => {
    setDonorName('');
    setAmount('');
    setNote('');
    setPaymentMethod('bank_transfer');
    setEditingDonation(null);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Donor Name', 'Amount (LKR)', 'Date', 'Payment Method', 'Note'];
    const rows = donations.map((d) => [
      d.id,
      `"${(d.name || d.donor_name || 'Anonymous').replace(/"/g, '""')}"`,
      d.amount,
      d.date,
      d.payment_method || 'bank_transfer',
      `"${(d.note || d.slip_note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `KV2011_Malitha_Medical_Fund_Donors_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Spreadsheet Exported', 'success', 'Downloaded CSV donor report');
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);

    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      await updateSupabaseConfig(null);
      showToast('Switched to Local Mode', 'info', 'Supabase credentials cleared');
    } else {
      await updateSupabaseConfig({
        url: supabaseUrl.trim(),
        anonKey: supabaseAnonKey.trim(),
      });
      showToast('Supabase Settings Saved', 'success', 'Cloud real-time backend connected');
    }

    setIsSavingConfig(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs transition-all duration-200">
      <div className="relative w-full sm:max-w-lg max-h-[92vh] sm:max-h-[85vh] bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900 animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-lg ${
                isAdminUnlocked
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}
            >
              {isAdminUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {isAdminUnlocked ? 'Batch Committee Console' : 'Committee Authorization'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAdminUnlocked
                  ? 'Kalutara Vidyalaya 2011 A/L Committee'
                  : 'Enter 4-digit Security PIN'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminUnlocked && (
              <button
                onClick={handleLockAdmin}
                className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Lock
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {!isAdminUnlocked ? (
            /* PIN Screen */
            <div className="flex flex-col items-center justify-center py-4 max-w-xs mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-900 mb-3 shadow-2xs">
                <KeyRound className="w-7 h-7" />
              </div>

              <h4 className="text-base font-bold text-slate-900 text-center">Batch Committee Authorization</h4>
              <p className="text-xs text-slate-500 text-center mt-1 mb-5">
                Enter 4-digit security PIN to access admin controls
              </p>

              {/* Dots */}
              <div
                className={`flex items-center gap-3.5 mb-6 ${
                  pinError ? 'animate-bounce text-rose-600' : ''
                }`}
              >
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                      pin.length > index
                        ? 'bg-rose-900 border-rose-900'
                        : 'border-slate-300 bg-white'
                    }`}
                  />
                ))}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2.5 w-full">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      if (item === 'C') handleClearPin();
                      else if (item === '⌫') handleBackspace();
                      else handlePinDigit(item);
                    }}
                    className={`h-12 rounded-xl text-lg font-bold transition-all active:scale-95 flex items-center justify-center cursor-pointer shadow-2xs ${
                      item === 'C' || item === '⌫'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm'
                        : 'bg-white hover:bg-slate-50 text-slate-900 border border-slate-200'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Unlocked Admin Panel */
            <div className="space-y-5">
              {/* Tab Pills */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setAdminTab('add')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    adminTab === 'add'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-rose-800" />
                  <span>{editingDonation ? 'Edit Contributor' : 'Add Contributor'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab('settings')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    adminTab === 'settings'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-blue-800" />
                  <span>Cloud & Backup</span>
                </button>
              </div>

              {adminTab === 'add' ? (
                /* Form */
                <form onSubmit={handleSubmitDonation} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Contributor / Batchmate Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Danushka Chamara (2011 Maths)"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-[#0b3866]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                      Amount in LKR *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="e.g. 5000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-[#0b3866]"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {[1000, 2000, 2500, 5000, 10000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setAmount(preset.toString())}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-mono font-semibold text-slate-700 border border-slate-200 cursor-pointer"
                        >
                          +{preset.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Contribution Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0b3866]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                        Deposit Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#0b3866] cursor-pointer"
                      >
                        <option value="bank_transfer">People&apos;s Bank Transfer</option>
                        <option value="online">Online Banking / CEFT</option>
                        <option value="cash">Direct Cash Handover</option>
                        <option value="other">Other / Remittance</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 rounded-lg bg-[#0b3866] hover:bg-[#082849] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{editingDonation ? 'Update Contributor Record' : 'Record Verified Donation'}</span>
                    </button>

                    {editingDonation && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-3.5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                /* Settings */
                <div className="space-y-4">
                  {/* CSV Export */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                        Auditor CSV Ledger Export
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Export all {donations.length} records to spreadsheet format
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                    >
                      Download CSV
                    </button>
                  </div>

                  {/* Supabase */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-blue-700" />
                        <h4 className="text-xs font-bold text-slate-900">Supabase Cloud Database</h4>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isRealtimeActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isRealtimeActive ? 'Realtime Connected' : 'Local Mode'}
                      </span>
                    </div>

                    <form onSubmit={handleSaveSupabaseConfig} className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                          Project URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://xyzcompany.supabase.co"
                          value={supabaseUrl}
                          onChange={(e) => setSupabaseUrl(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0b3866]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                          Anon Key
                        </label>
                        <input
                          type="text"
                          placeholder="eyJhbGciOi..."
                          value={supabaseAnonKey}
                          onChange={(e) => setSupabaseAnonKey(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0b3866]"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="submit"
                          disabled={isSavingConfig}
                          className="px-3 py-1.5 rounded-lg bg-[#0b3866] hover:bg-[#082849] text-white text-xs font-semibold cursor-pointer"
                        >
                          {isSavingConfig ? 'Connecting...' : 'Save & Connect'}
                        </button>
                        {supabaseConfig && (
                          <button
                            type="button"
                            onClick={() => {
                              setSupabaseUrl('');
                              setSupabaseAnonKey('');
                              updateSupabaseConfig(null);
                            }}
                            className="text-xs text-rose-600 hover:underline cursor-pointer"
                          >
                            Disconnect
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Reset Dataset */}
                  <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 flex items-center justify-between gap-3">
                    <div>
                      <h5 className="text-xs font-bold text-rose-900">Reset Initial Dataset</h5>
                      <p className="text-[11px] text-rose-700">
                        Restore original 21 contributors (Total: LKR 53,000.00)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Restore initial 21 contributors (LKR 53,000.00)?')) {
                          resetToDefault();
                          showToast('Dataset Reset', 'info', 'Restored 21 verified contributors');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold cursor-pointer"
                    >
                      Reset Ledger
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
