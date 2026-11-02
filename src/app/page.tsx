'use client';

import React, { useState } from 'react';
import { DonationProvider, useDonations } from '@/context/DonationContext';
import { ToastProvider, useToast } from '@/components/Toast';
import { Header } from '@/components/Header';
import { BankCard } from '@/components/BankCard';
import { SummaryCards } from '@/components/SummaryCards';
import { MonthlyTabs } from '@/components/MonthlyTabs';
import { SearchBar } from '@/components/SearchBar';
import { DonorList } from '@/components/DonorList';
import { AdminDrawer } from '@/components/AdminDrawer';
import { WhatsAppGeneratorModal } from '@/components/WhatsAppGeneratorModal';
import { Footer } from '@/components/Footer';
import { Donation } from '@/types/donation';
import { CAMPAIGN_INFO } from '@/data/initialDonors';
import { Share2, PlusCircle, HeartHandshake, ShieldCheck, HelpCircle } from 'lucide-react';

function DashboardContent() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const { deleteDonation, isMounted } = useDonations();
  const { showToast } = useToast();

  const handleEditDonation = (donation: Donation) => {
    setEditingDonation(donation);
    setIsAdminOpen(true);
  };

  const handleDeleteDonation = async (id: string) => {
    if (confirm('Are you sure you want to remove this donation record?')) {
      const res = await deleteDonation(id);
      if (res.success) {
        showToast('Donation Removed', 'info', res.message);
      }
    }
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-rose-900 selection:text-white"
    >
      {/* Header */}
      <Header
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenWhatsApp={() => setIsWhatsAppOpen(true)}
      />

      {/* Main Container */}
      <main
        suppressHydrationWarning
        className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8"
      >
        {/* Heartfelt Batch Solidarity Banner */}
        <section
          aria-label="Appeal Statement"
          className="bg-white rounded-xl border border-rose-200/80 p-4 sm:p-5 shadow-2xs relative overflow-hidden"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                  සහෝදරත්වයේ සත්කාරය • Batchmate Appeal
                </span>
                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Kalutara Vidyalaya 2011 A/L Community
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                Our dear schoolmate <strong>{CAMPAIGN_INFO.patientName}</strong> is undergoing critical medical therapy requiring continuous medical expenses. The 2011 Advanced Level batch of Kalutara Vidyalaya has organized this collective relief initiative to stand firmly by his side. All contributions are credited straight into the verified People&apos;s Bank account below and recorded transparently.
              </p>
            </div>
          </div>
        </section>

        {/* Bank Account Details Card */}
        <section aria-label="Official Bank Details">
          <BankCard />
        </section>

        {/* Top Summary Metric Cards */}
        <section aria-label="Campaign Summary Metrics">
          <SummaryCards />
        </section>

        {/* Horizontal Monthly Filter Tabs */}
        <section aria-label="Monthly Filter" className="pt-1">
          <MonthlyTabs />
        </section>

        {/* Search & Sort Bar */}
        <section aria-label="Search and Filter Donors">
          <SearchBar />
        </section>

        {/* Contributor List / Table */}
        <section aria-label="Contributor Records">
          <DonorList
            isAdminUnlocked={isAdminUnlocked}
            onEditDonation={handleEditDonation}
            onDeleteDonation={handleDeleteDonation}
          />
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Slide-up Admin Drawer / Modal (PIN: 2011) */}
      <AdminDrawer
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          setEditingDonation(null);
        }}
        isAdminUnlocked={isAdminUnlocked}
        setIsAdminUnlocked={setIsAdminUnlocked}
        editingDonation={editingDonation}
        setEditingDonation={setEditingDonation}
      />

      {/* WhatsApp Status / Bulletin Generator Modal */}
      <WhatsAppGeneratorModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
      />

      {/* Mobile Floating Action Button (FAB) only rendered after mount */}
      {isMounted && (
        <div
          suppressHydrationWarning
          className="sm:hidden fixed bottom-5 right-4 z-40 flex flex-col gap-2 items-end pointer-events-auto"
        >
          <button
            onClick={() => setIsWhatsAppOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1ebd5a] text-white font-bold text-xs shadow-lg border border-white/20 active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp Bulletin</span>
          </button>

          <button
            onClick={() => setIsAdminOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white text-slate-800 border border-slate-200 text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-rose-800" />
            <span>{isAdminUnlocked ? 'Add Entry' : 'Admin'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ToastProvider>
      <DonationProvider>
        <DashboardContent />
      </DonationProvider>
    </ToastProvider>
  );
}
