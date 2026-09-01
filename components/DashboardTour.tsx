"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cpu, ArrowRight, HelpCircle, X, ChevronRight } from "lucide-react";

interface DashboardTourProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  partnerCode: string;
}

export default function DashboardTour({
  activeTab,
  setActiveTab,
  partnerCode
}: DashboardTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Check if tour was previously completed or if it's the first time
  useEffect(() => {
    const isCompleted = localStorage.getItem("deloxe_tour_completed_v1");
    if (!isCompleted) {
      // Small delay to let the dashboard render beautifully before showing tour
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep === 1) {
      // Set tab to referral materials
      setActiveTab("materials");
      setCurrentStep(2);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem("deloxe_tour_completed_v1", "true");
    setIsOpen(false);
  };

  const restartTour = () => {
    setActiveTab("dashboard");
    setCurrentStep(1);
    setIsOpen(true);
  };

  if (!isOpen) {
    // Return a subtle "Take Tour" floating button so they can replay it anytime
    return (
      <button
        onClick={restartTour}
        className="fixed bottom-6 right-6 z-40 px-3.5 py-2 rounded-full bg-[#23312C] border border-[#00CC88]/30 hover:border-[#00CC88]/70 text-[#00CC88] text-[11px] font-bold font-mono shadow-lg flex items-center gap-1.5 cursor-pointer hover:bg-[#131b19] transition-all"
        id="restart-tour-btn"
      >
        <HelpCircle className="w-3.5 h-3.5 animate-pulse" />
        <span>TOUR NAVIGATOR</span>
      </button>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#131b19]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        
        {/* Dynamic spotlights using CSS class names */}
        {currentStep === 1 && (
          <div className="absolute inset-0 pointer-events-none border-[6px] border-[#00CC88]/30 animate-pulse rounded-2xl" />
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="max-w-md w-full bg-[#23312C] border border-[#00CC88]/30 rounded-2xl shadow-2xl overflow-hidden relative"
          id="tour-modal"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#DAF0DD]/10 bg-[#131b19]/50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-[#00CC88]">
              <Cpu className="w-4.5 h-4.5 animate-pulse text-[#00CC88]" />
              <span className="font-display font-bold text-xs tracking-wider uppercase">Ambassador Portal Navigator</span>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg text-[#DAF0DD]/40 hover:text-[#DAF0DD] hover:bg-[#131b19] transition-all cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-[#00CC88]/10 border border-[#00CC88]/30 flex items-center justify-center text-[11px] font-mono font-bold text-[#00CC88]">
                {currentStep}/2
              </span>
              <h4 className="font-display font-bold text-sm text-[#DAF0DD]">
                {currentStep === 1 ? "Step 1: Your Unique Referral Link" : "Step 2: Refined Promotion Materials"}
              </h4>
            </div>

            <p className="text-xs text-[#DAF0DD]/80 leading-relaxed font-sans">
              {currentStep === 1 ? (
                <span>
                  Welcome to the portal! Right on your main dashboard, you&apos;ll see your **Unique Referral Slug**. Copy this URL and share it with students or graduates looking for internship training.
                  <br /><br />
                  Any user who registers using this slug is permanently linked to your profile to track reward payouts automatically.
                </span>
              ) : (
                <span>
                  Excellent! The navigator has successfully unlocked the **Referral Materials** suite. 
                  <br /><br />
                  Here, you will find pre-refined, highly converting copy templates that you can copy to your clipboard in one tap. Use these templates to promote training opportunities on WhatsApp, LinkedIn, and Telegram!
                </span>
              )}
            </p>

            {currentStep === 1 && (
              <div className="p-3.5 bg-[#131b19]/60 rounded-xl border border-[#DAF0DD]/10 space-y-2 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-[#DAF0DD]/40">TARGET BOX:</span>
                  <span className="text-[#00CC88] font-bold">Unique Referral Slug</span>
                </div>
                <div className="p-2 bg-[#131b19] rounded border border-[#00CC88]/20 text-[#00CC88] truncate">
                  https://ecosystem.deloxehr.com/?ref={partnerCode}
                </div>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="p-4 bg-[#131b19]/40 border-t border-[#DAF0DD]/10 flex justify-between items-center">
            <button
              onClick={handleClose}
              className="text-xs text-[#DAF0DD]/50 hover:text-[#DAF0DD] font-mono cursor-pointer"
            >
              Skip Navigator
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-[#00CC88] hover:bg-[#00CC88]/90 text-[#1A2421] font-sans font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-[0.98]"
              id="tour-next-btn"
            >
              <span>{currentStep === 1 ? "Next: Promo Materials" : "Finish Tour"}</span>
              {currentStep === 1 ? <ArrowRight className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
