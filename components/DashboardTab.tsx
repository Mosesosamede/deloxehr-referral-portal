"use client";

import React from "react";
import { motion } from "motion/react";
import { 
  Globe, 
  Copy, 
  Check, 
  Info, 
  UserCheck, 
  Award, 
  DollarSign, 
  Calendar, 
  Activity, 
  ChevronRight,
  Cpu
} from "lucide-react";
import ClockIcon from "./ClockIcon";
import { formatDate } from "@/lib/date-utils";
import { 
  PartnerDocument, 
  PartnerStatsDocument, 
  PartnerCommissionDocument 
} from "@/lib/db-helpers";

interface DashboardTabProps {
  partner: PartnerDocument;
  stats: PartnerStatsDocument | null;
  commissions: PartnerCommissionDocument[];
  dbLoading: boolean;
  currencySymbol: string;
  isCopied: boolean;
  handleCopy: () => void;
  setActiveTab: (tab: "dashboard" | "commissions" | "payouts" | "notifications" | "settings") => void;
}

export default function DashboardTab({
  partner,
  stats,
  commissions,
  dbLoading,
  currencySymbol,
  isCopied,
  handleCopy,
  setActiveTab
}: DashboardTabProps) {
  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-8"
      id="dashboard-tab"
    >
      {/* Top Bento Layout: Referral URL Panel (Left) & QR Code (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="bento-top-row">
        {/* Referral Link Manager */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#23312C]/40 border border-[#DAF0DD]/15 backdrop-blur shadow-xl relative overflow-hidden flex flex-col justify-between" id="referral-link-manager">
          <div className="absolute top-[-30%] right-[-10%] w-[200px] h-[200px] bg-[#00CC88]/5 rounded-full blur-[50px] pointer-events-none"></div>
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-[#00CC88]/10 text-[#00CC88]">
                <Globe className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-display font-bold text-base text-white">Unique Referral Slug</h3>
            </div>
            <p className="text-[#DAF0DD]/70 text-xs leading-relaxed mb-6">
              Distribute this link. Any talent applying through this structured URL is automatically linked to your partner account, initializing the commission tracking process.
            </p>
          </div>

          <div>
            {/* URL Input Box */}
            <div className="flex items-center gap-2 bg-[#131b19] border border-[#DAF0DD]/15 rounded-xl p-2.5 mb-3 font-mono text-xs text-[#DAF0DD]">
              <input
                type="text"
                readOnly
                value={`https://ecosystem.deloxehr.com/?ref=${partner.referralCode}`}
                className="bg-transparent flex-grow focus:outline-none select-all font-mono"
              />
              <button
                onClick={handleCopy}
                className={`p-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCopied 
                    ? "bg-[#00CC88] text-[#1A2421] font-bold" 
                    : "bg-[#23312C] hover:bg-[#23312C]/80 text-[#DAF0DD]"
                }`}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[10px] font-bold">{isCopied ? "COPIED" : "COPY"}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-[#DAF0DD]/50 font-mono">
              <Info className="w-3.5 h-3.5 text-[#00CC88]/70" />
              <span>Tracking Slug matches: /?ref={partner.referralCode}</span>
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="p-6 rounded-2xl bg-[#23312C]/40 border border-[#DAF0DD]/15 backdrop-blur shadow-xl relative overflow-hidden flex flex-col justify-between items-center text-center" id="qr-code-card">
          <div className="absolute top-0 left-0 w-[100px] h-[100px] bg-[#00CC88]/5 rounded-full blur-[45px] pointer-events-none"></div>
          
          <div className="w-full">
            <h3 className="font-display font-bold text-sm text-[#DAF0DD]">Scan & Refer</h3>
            <p className="text-[11px] text-[#DAF0DD]/60 mt-1 leading-relaxed">Direct visual link scan</p>
          </div>

          {/* Dynamic clean QR Code via api.qrserver.com using brand primary color */}
          <div className="w-32 h-32 bg-[#131b19] rounded-xl border border-[#DAF0DD]/15 flex items-center justify-center p-2 relative my-4">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=00CC88&bgcolor=131b19&data=${encodeURIComponent(
                `https://ecosystem.deloxehr.com/?ref=${partner.referralCode}`
              )}`}
              alt="Referral QR Code" 
              className="w-full h-full rounded"
              referrerPolicy="no-referrer"
            />
          </div>

          <span className="text-[10px] font-mono text-[#00CC88]/80 font-bold tracking-widest">{partner.referralCode}</span>
        </div>
      </div>

      {/* Cute Ambassador Step-by-Step Success Roadmap */}
      <div className="p-6 rounded-2xl bg-[#23312C]/40 border border-[#00CC88]/20 backdrop-blur-md space-y-4 shadow-xl" id="dashboard-success-roadmap">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="font-display font-bold text-sm text-[#DAF0DD] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#00CC88] animate-pulse" />
              <span>Ambassador Blueprint: How it Works</span>
            </h3>
            <p className="text-[11px] text-[#DAF0DD]/60 mt-0.5">Your simple, cute 4-step guide to refer talent and earn automated payouts</p>
          </div>
          <span className="self-start sm:self-center text-[10px] bg-[#00CC88]/10 text-[#00CC88] px-2.5 py-0.5 rounded-full font-mono font-bold border border-[#00CC88]/20">
            PARTNER STATS SECURED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" id="dashboard-roadmap-grid">
          {/* Step 1 */}
          <div className="p-3 bg-[#131b19]/60 rounded-xl border border-[#DAF0DD]/10 hover:border-[#00CC88]/30 transition-all flex items-start gap-3 group cursor-default" id="dash-step-1">
            <span className="w-6 h-6 rounded-full bg-[#00CC88]/10 border border-[#00CC88]/30 flex items-center justify-center font-mono font-extrabold text-[#00CC88] text-xs shrink-0 group-hover:scale-115 group-hover:bg-[#00CC88] group-hover:text-[#1A2421] transition-all duration-200">
              1
            </span>
            <div className="space-y-0.5">
              <h4 className="font-display font-bold text-[11px] text-white flex items-center gap-1.5">
                <span>Share Link</span>
                <span className="text-[10px]">🔗</span>
              </h4>
              <p className="text-[10px] text-[#DAF0DD]/70 leading-relaxed">
                Post your unique tracking link across your social network.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3 bg-[#131b19]/60 rounded-xl border border-[#DAF0DD]/10 hover:border-[#00CC88]/30 transition-all flex items-start gap-3 group cursor-default" id="dash-step-2">
            <span className="w-6 h-6 rounded-full bg-[#00CC88]/10 border border-[#00CC88]/30 flex items-center justify-center font-mono font-extrabold text-[#00CC88] text-xs shrink-0 group-hover:scale-115 group-hover:bg-[#00CC88] group-hover:text-[#1A2421] transition-all duration-200">
              2
            </span>
            <div className="space-y-0.5">
              <h4 className="font-display font-bold text-[11px] text-white flex items-center gap-1.5">
                <span>Invite Talents</span>
                <span className="text-[10px]">🎓</span>
              </h4>
              <p className="text-[10px] text-[#DAF0DD]/70 leading-relaxed">
                Invite student & graduate professionals looking for internships.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3 bg-[#131b19]/60 rounded-xl border border-[#DAF0DD]/10 hover:border-[#00CC88]/30 transition-all flex items-start gap-3 group cursor-default" id="dash-step-3">
            <span className="w-6 h-6 rounded-full bg-[#00CC88]/10 border border-[#00CC88]/30 flex items-center justify-center font-mono font-extrabold text-[#00CC88] text-xs shrink-0 group-hover:scale-115 group-hover:bg-[#00CC88] group-hover:text-[#1A2421] transition-all duration-200">
              3
            </span>
            <div className="space-y-0.5">
              <h4 className="font-display font-bold text-[11px] text-white flex items-center gap-1.5">
                <span>Earn Payouts</span>
                <span className="text-[10px]">💰</span>
              </h4>
              <p className="text-[10px] text-[#DAF0DD]/70 leading-relaxed">
                Instantly earn automated reward payouts once they join successfully.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3 bg-[#131b19]/60 rounded-xl border border-[#DAF0DD]/10 hover:border-[#00CC88]/30 transition-all flex items-start gap-3 group cursor-default" id="dash-step-4">
            <span className="w-6 h-6 rounded-full bg-[#00CC88]/10 border border-[#00CC88]/30 flex items-center justify-center font-mono font-extrabold text-[#00CC88] text-xs shrink-0 group-hover:scale-115 group-hover:bg-[#00CC88] group-hover:text-[#1A2421] transition-all duration-200">
              4
            </span>
            <div className="space-y-0.5">
              <h4 className="font-display font-bold text-[11px] text-white flex items-center gap-1.5">
                <span>Track Analytics</span>
                <span className="text-[10px]">📊</span>
              </h4>
              <p className="text-[10px] text-[#DAF0DD]/70 leading-relaxed">
                Monitor real-time stats and metrics inside your private cockpit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid Analytics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4" id="analytics-grid">
        {[
          { label: "Total Clicks", value: stats?.totalClicks ?? 0, icon: Globe, color: "text-[#DAF0DD]/80" },
          { label: "Verified Purchases", value: stats?.totalPurchases ?? 0, icon: UserCheck, color: "text-[#F7F167]" },
          { label: "Total Earned", value: stats ? `${currencySymbol}${stats.totalCommission.toLocaleString()}` : `${currencySymbol}0`, icon: Award, color: "text-[#00CC88]" },
          { label: "Available Balance", value: stats ? `${currencySymbol}${stats.balance.toLocaleString()}` : `${currencySymbol}0`, icon: DollarSign, color: "text-[#00CC88] font-extrabold" },
          { label: "Payout Frequency", value: partner.payoutFrequency, icon: Calendar, color: "text-[#DAF0DD]/80 uppercase text-xs" },
          { label: "Next Payout Date", value: stats?.nextPayout ? formatDate(stats.nextPayout) : "TBD", icon: ClockIcon, color: "text-[#F7F167]" }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="p-4 rounded-xl bg-[#23312C]/40 border border-[#DAF0DD]/15 backdrop-blur shadow-sm flex flex-col justify-between" id={`analytic-card-${idx}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[#DAF0DD]/50 text-[10px] font-mono tracking-wider uppercase leading-tight">{item.label}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className={`text-xl font-display font-extrabold ${item.color} tracking-tight mt-2 truncate`}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Commissions Overview Snippet */}
      <div className="bg-[#23312C]/40 border border-[#DAF0DD]/15 rounded-2xl overflow-hidden shadow-xl" id="recent-activity-container">
        <div className="p-5 border-b border-[#DAF0DD]/15 flex justify-between items-center bg-[#23312C]/20">
          <h3 className="font-display font-bold text-sm text-[#DAF0DD] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00CC88]" />
            <span>Recent Activity Stream</span>
          </h3>
          <button 
            onClick={() => setActiveTab("commissions")}
            className="text-xs text-[#F7F167] hover:underline flex items-center gap-1.5 cursor-pointer font-mono"
          >
            <span>Full Ledger</span> <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="divide-y divide-[#DAF0DD]/10">
          {dbLoading ? (
            <div className="p-8 text-center text-[#DAF0DD]/50 font-mono text-xs">Accessing datastore...</div>
          ) : commissions.length === 0 ? (
            <div className="p-10 text-center text-[#DAF0DD]/50 text-xs leading-relaxed">
              No active commission metrics recorded yet.<br />
              <span className="text-[10px] mt-1 text-[#DAF0DD]/30 block">Once applications progress under your code, logs will appear.</span>
            </div>
          ) : (
            commissions.slice(0, 2).map((comm) => (
              <div key={comm.commissionId} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#131b19]/20 transition-all">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-[#DAF0DD]/50">{comm.transactionId}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${
                      comm.payoutStatus === "paid" 
                        ? "bg-[#00CC88]/10 border-[#00CC88]/20 text-[#00CC88]" 
                        : comm.payoutStatus === "processing"
                        ? "bg-[#F7F167]/10 border-[#F7F167]/20 text-[#F7F167]"
                        : "bg-[#DAF0DD]/10 border-[#DAF0DD]/20 text-[#DAF0DD]/80"
                    }`}>
                      {comm.payoutStatus}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#DAF0DD]">{comm.email}</span>
                  <span className="text-[10px] font-mono text-[#DAF0DD]/50">Milestone Completed At: {formatDate(comm.createdAt)}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[#DAF0DD]/50 text-[10px] font-mono block">COMMISSION</span>
                  <span className="text-base font-mono font-bold text-[#00CC88]">{currencySymbol}{comm.commissionAmount.toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
