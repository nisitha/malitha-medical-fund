'use client';

import React from 'react';
import { Heart, ShieldCheck, Share2, Lock, Landmark, CheckCircle2 } from 'lucide-react';
import { useDonations } from '@/context/DonationContext';
import { CAMPAIGN_INFO } from '@/data/initialDonors';

interface HeaderProps {
  onOpenAdmin: () => void;
  onOpenWhatsApp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, onOpenWhatsApp }) => {
  const { isRealtimeActive, isMounted } = useDonations();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Institutional Notification Strip */}
      <div className="bg-rose-900 text-rose-50 text-[11px] sm:text-xs">
        <div className="max-w-5xl mx-auto px-4 py-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wide uppercase flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-amber-300" />
              කළුතර විද්‍යාලය • 2011 උසස් පෙළ කණ්ඩායම
            </span>
            <span className="hidden sm:inline text-rose-300/80">•</span>
            <span className="hidden sm:inline text-rose-100 font-normal">
              Official Batchmate Relief Initiative
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-rose-200">
              <span
                className={`w-2 h-2 rounded-full ${
                  isMounted && isRealtimeActive ? 'bg-emerald-400' : 'bg-amber-300'
                }`}
              />
              <span className="font-mono text-[11px]">
                {isMounted && isRealtimeActive ? 'Live Realtime' : 'Verified Ledger'}
              </span>
            </div>

            <button
              onClick={onOpenAdmin}
              className="text-rose-200 hover:text-white flex items-center gap-1 transition-colors font-medium cursor-pointer"
              title="Batch Committee Login"
            >
              <Lock className="w-3 h-3 text-amber-300" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main School & Campaign Title Banner */}
      <div className="max-w-5xl mx-auto px-4 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            {/* Kalutara Vidyalaya Official Maroon/Gold Crest Emblem */}
            <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-b from-rose-900 to-rose-950 text-white flex flex-col items-center justify-center border-2 border-amber-400 shadow-sm relative">
              <span className="text-[10px] font-black tracking-widest text-amber-300 leading-none uppercase">
                KV
              </span>
              <span className="text-base sm:text-lg font-black tracking-tight leading-none mt-0.5 text-white">
                2011
              </span>
              <span className="text-[8px] font-bold text-rose-200 uppercase tracking-tighter leading-none mt-0.5">
                A/L BATCH
              </span>
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 rounded-full p-0.5 border border-white text-white">
                <CheckCircle2 className="w-3 h-3" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-900 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  <Heart className="w-3 h-3 text-rose-700 fill-rose-700" />
                  වෛද්‍ය ආධාර අරමුදල
                </span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Official Medical Trust Fund
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {CAMPAIGN_INFO.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-normal mt-0.5">
                Organized with brotherly solidarity by{' '}
                <strong className="text-slate-800 font-semibold">
                  Kalutara Vidyalaya 2011 A/L Batchmates
                </strong>{' '}
                for <span className="font-semibold text-rose-900">{CAMPAIGN_INFO.patientName}</span>
              </p>
            </div>
          </div>

          {/* Quick Action CTA: WhatsApp Bulletin */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end pt-1 sm:pt-0">
            <button
              onClick={onOpenWhatsApp}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp Bulletin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
