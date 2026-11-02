'use client';

import React from 'react';
import { Heart, ShieldCheck, Phone, ArrowUp, Landmark } from 'lucide-react';
import { CAMPAIGN_INFO } from '@/data/initialDonors';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 bg-white border-t border-slate-200 text-slate-600 text-xs">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-slate-200">
          {/* Institutional Info */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-900 text-white flex items-center justify-center font-black text-xs">
                KV
              </div>
              <span className="font-bold text-sm text-slate-900">
                Kalutara Vidyalaya 2011 A/L Batch Committee
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-md">
              This medical relief trust fund is formally organized by the executive members of the Kalutara Vidyalaya 2011 Advanced Level (A/L) batch in solidarity with our fellow classmate, <strong>{CAMPAIGN_INFO.patientName}</strong>. All financial contributions are routed directly into the official trustee account at People&apos;s Bank, Kalutara Branch.
            </p>
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>100% Volunteer Managed • Transparent Batch Audit</span>
            </div>
          </div>

          {/* Committee Contacts */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Batch Trustees & Committee
            </h4>
            <div className="space-y-2">
              {CAMPAIGN_INFO.contacts.map((contact, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900">{contact.name}</div>
                  <div className="text-[11px] text-slate-500">{contact.role}</div>
                  <div className="flex items-center gap-1.5 text-[#0b3866] text-[11px] mt-1 font-mono font-semibold">
                    <Phone className="w-3 h-3" />
                    <span>{contact.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Back to top */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Navigation
            </h4>
            <button
              onClick={scrollToTop}
              className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors font-medium text-xs cursor-pointer"
            >
              <ArrowUp className="w-3.5 h-3.5 text-slate-600" />
              <span>Back to Top</span>
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            &copy; 2026 Kalutara Vidyalaya 2011 A/L Batch. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Standing strong for</span>
            <span className="text-slate-900 font-bold">{CAMPAIGN_INFO.patientName}</span>
            <Heart className="w-3 h-3 text-rose-700 fill-rose-700" />
          </div>
        </div>
      </div>
    </footer>
  );
};
