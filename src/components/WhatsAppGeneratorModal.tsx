'use client';

import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Check, MessageSquare, ExternalLink } from 'lucide-react';
import { useDonations } from '@/context/DonationContext';
import { useToast } from './Toast';
import { CAMPAIGN_INFO } from '@/data/initialDonors';

interface WhatsAppGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppGeneratorModal: React.FC<WhatsAppGeneratorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { stats, donations } = useDonations();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [todayStr, setTodayStr] = useState('02 Nov 2026');
  const [siteOrigin, setSiteOrigin] = useState('https://nisitha.github.io/malitha-medical-fund');

  const formatLKR = (val: number) => {
    return `LKR ${Number(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  useEffect(() => {
    setIsMounted(true);
    setTodayStr(
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    );
    if (typeof window !== 'undefined') {
      setSiteOrigin(window.location.origin + window.location.pathname.replace(/\/$/, ''));
    }
  }, []);

  if (!isOpen || !isMounted) return null;

  const recentDonors = donations.slice(0, 5);
  const bank = CAMPAIGN_INFO.bankDetails;

  const bulletinText = `🩺 *MALITHA NISHAN MEDICAL RELIEF FUND* 🩺
*Kalutara Vidyalaya 2011 A/L Batch Official Appeal*
_කළුතර විද්‍යාලය 2011 උසස් පෙළ සහෝදරත්වයේ උපහාරය_

Dear Batchmates, Teachers & Friends,
Here is the official transparent update for our brother Malitha Nishan's medical relief fund:

━━━━━━━━━━━━━━━━━━━━━
💰 *Total Funds Collected:* ${formatLKR(stats.totalAmount)}
👥 *Verified Contributors:* ${stats.totalDonors} Donors
🎯 *Target Milestone:* ${formatLKR(stats.targetAmount)}
📅 *Status As Of:* ${todayStr}
━━━━━━━━━━━━━━━━━━━━━

🏦 *OFFICIAL BANK ACCOUNT DETAILS:*
• *Bank:* People's Bank (මහජන බැංකුව)
• *Branch:* ${bank.branch} (Code: ${bank.branchCode})
• *Account Number:* \`${bank.accountNumber}\`
• *Account Name:* ${bank.accountName}
• *Transfer Remark:* ${bank.referenceRecommendation}

🌟 *Latest Verified Contributions:*
${recentDonors
  .map(
    (d, i) =>
      `${i + 1}. ${d.donor_name} - ${formatLKR(d.amount)}`
  )
  .join('\n')}
${donations.length > 5 ? `...and ${donations.length - 5} more batchmates.` : ''}

🤝 Every rupee brings Malitha closer to recovery. Let's stand united for our schoolmate!
Please share this message in your batch groups and WhatsApp status.

🌐 *View Live Donor Ledger & Updates:*
${siteOrigin}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bulletinText);
      setCopied(true);
      showToast(
        'WhatsApp Bulletin Copied!',
        'success',
        'Ready to paste in WhatsApp status or batch groups'
      );
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      showToast('Copy Failed', 'error');
    }
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(bulletinText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[88vh] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden text-slate-900">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                WhatsApp Bulletin Generator
              </h3>
              <p className="text-xs text-slate-500">
                Official batch bulletin formatted with totals and bank slip
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span className="font-semibold text-slate-700">Message Preview:</span>
            <span className="text-emerald-700 font-mono text-[11px] font-bold">WhatsApp Ready</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap select-all leading-relaxed max-h-72 overflow-y-auto">
            {bulletinText}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleCopy}
            className={`w-full sm:flex-1 py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border ${
              copied
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                <span className="text-emerald-800">Bulletin Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="w-full sm:flex-1 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Open in WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
};
