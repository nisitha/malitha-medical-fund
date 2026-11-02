'use client';

import React, { useState } from 'react';
import { Copy, Check, Building2, MapPin, User, Hash, Info, QrCode, FileText, CheckCircle2 } from 'lucide-react';
import { useToast } from './Toast';
import { CAMPAIGN_INFO } from '@/data/initialDonors';
import confetti from 'canvas-confetti';

export const BankCard: React.FC = () => {
  const { showToast } = useToast();
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const bank = CAMPAIGN_INFO.bankDetails;

  const handleCopyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(bank.accountNumber);
      setCopiedAcc(true);
      showToast(
        'Account Number Copied!',
        'success',
        `${bank.accountNumber} - People's Bank Kalutara`
      );

      try {
        confetti({
          particleCount: 20,
          spread: 40,
          origin: { y: 0.6 },
          colors: ['#0b3866', '#f59e0b', '#10b981'],
        });
      } catch (e) {}

      setTimeout(() => setCopiedAcc(false), 2200);
    } catch (err) {
      showToast('Copy Failed', 'error', 'Please select and copy manually');
    }
  };

  const handleCopyAllDetails = async () => {
    const fullText = `*MALITHA NISHAN MEDICAL RELIEF FUND*\n(Kalutara Vidyalaya 2011 A/L Batch Committee)\n\n• Bank: People's Bank (මහජන බැංකුව)\n• Branch: Kalutara Branch (Code: ${bank.branchCode})\n• Account Number: ${bank.accountNumber}\n• Account Name: ${bank.accountName}\n• Reference: Malitha Nishan Relief (KV 2011)\n\nKindly send deposit receipt / transfer confirmation to batch committee members.`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      showToast(
        'Full Bank Slip Copied!',
        'success',
        'Ready to paste in WhatsApp, Banking App, or SMS'
      );
      setTimeout(() => setCopiedAll(false), 2200);
    } catch (err) {
      showToast('Copy Failed', 'error');
    }
  };

  return (
    <div className="w-full">
      {/* Official Bank Deposit Slip Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Header: Official People's Bank Sri Lanka Signature Bar */}
        <div className="bg-[#0b3866] text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-400 text-[#0b3866] flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-300/30">
                  Official Relief Account
                </span>
                <span className="text-xs text-blue-200">People&apos;s Bank • ශ්‍රී ලංකා මහජන බැංකුව</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                People&apos;s Bank — Kalutara Branch
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowQRModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Details</span>
            </button>
            <button
              onClick={handleCopyAllDetails}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-colors cursor-pointer"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[3]" />
                  <span className="text-emerald-300 font-semibold">Slip Copied</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Copy Deposit Slip</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card Body: Account Data Grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch bg-slate-50/50">
          {/* Main Account Number Box */}
          <div className="md:col-span-7 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Hash className="w-4 h-4 text-[#0b3866]" />
                  Bank Account Number
                </span>
                <span className="text-[11px] text-[#0b3866] font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  Direct One-Tap Copy
                </span>
              </div>

              {/* Large, High-Contrast Monospace Account Number */}
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-[#0b3866] tracking-wider py-2 select-all">
                {bank.accountNumber}
              </div>

              <p className="text-xs text-slate-500 leading-normal">
                Compatible with People&apos;s Wave, CEFT, SLIPS, LankaPay, Online Banking, and Branch Cash Deposit.
              </p>
            </div>

            {/* Prominent One-Tap Copy Action */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={handleCopyAccountNumber}
                className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98 ${
                  copiedAcc
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#0b3866] hover:bg-[#082849] text-white'
                }`}
              >
                {copiedAcc ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Copied 039200163003149!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>One-Tap Copy Account Number</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Account Holder & Branch Information */}
          <div className="md:col-span-5 flex flex-col gap-3 justify-between">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                <User className="w-4 h-4 text-slate-600" />
                <span>Account Name / Trustee</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {bank.accountName}
              </div>
              <div className="text-[11px] text-emerald-800 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Authorized Batch Trustee Account (KV 2011)</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                <MapPin className="w-4 h-4 text-slate-600" />
                <span>Bank & Branch</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900">
                {bank.branch} (කළුතර ශාඛාව)
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Bank Code: <strong className="font-mono text-slate-700">7135</strong> • Branch Code:{' '}
                <strong className="font-mono text-slate-700">{bank.branchCode}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Verification & Note Banner */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#0b3866] shrink-0" />
            <span>
              Transfer Remark / Memo:{' '}
              <strong className="text-slate-900 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Malitha Relief KV2011
              </strong>
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">
            Please forward deposit confirmation slip to batch committee members.
          </span>
        </div>
      </div>

      {/* QR & Bank Slip Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full text-slate-900 shadow-xl relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              ✕
            </button>
            <div className="text-center">
              <div className="inline-flex p-3 rounded-xl bg-blue-50 text-[#0b3866] mb-3">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">People&apos;s Bank Deposit Slip</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Reference details for online banking or counter deposit
              </p>

              {/* Graphic Representation */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 text-left font-mono text-xs space-y-2">
                <div><span className="text-slate-500">Bank:</span> <strong>People&apos;s Bank (7135)</strong></div>
                <div><span className="text-slate-500">Branch:</span> <strong>Kalutara (039)</strong></div>
                <div><span className="text-slate-500">Account:</span> <strong className="text-[#0b3866] text-sm">{bank.accountNumber}</strong></div>
                <div><span className="text-slate-500">Name:</span> <strong>{bank.accountName}</strong></div>
                <div><span className="text-slate-500">Purpose:</span> <strong>Malitha Nishan Relief Fund</strong></div>
              </div>

              <button
                onClick={() => {
                  handleCopyAccountNumber();
                  setShowQRModal(false);
                }}
                className="w-full py-2.5 rounded-lg bg-[#0b3866] hover:bg-[#082849] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Copy Account Number
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
