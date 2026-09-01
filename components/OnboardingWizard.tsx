"use client";

import React from "react";
import { motion } from "motion/react";
import { 
  AlertCircle, 
  ArrowRight, 
  User, 
  Briefcase, 
  Calendar, 
  X 
} from "lucide-react";
import { getRewardConfig } from "@/lib/db-helpers";

const CRYPTO_NETWORKS_MAP: Record<string, string[]> = {
  USDT: ['SOL', 'Polygon', 'Ethereum', 'Arbitrum'],
  USDC: ['SOL', 'Polygon', 'Ethereum', 'Base', 'Arbitrum'],
  RLUSD: ['Ethereum']
};

interface OnboardingWizardProps {
  onboardingStep: number;
  onboardingError: string;
  existingAccountError: string;
  submittingOnboarding: boolean;
  obForm: {
    partnerType: "individual" | "corporate";
    country: string;
    fullName: string;
    companyName: string;
    representativeName: string;
    representativeTitle: string;
    email: string;
    phone: string;
    socialHandle: string;
    payoutMethod: "bank_transfer" | "crypto";
    bankName: string;
    accountName: string;
    accountNumber: string;
    cryptoCurrency: "USDT" | "USDC" | "RLUSD";
    cryptoNetwork: string;
    walletAddress: string;
    payoutFrequency: "weekly" | "monthly";
    agreementAccepted: boolean;
    digitalSignature: string;
  };
  currentTime: string;
  setObForm: React.Dispatch<React.SetStateAction<any>>;
  setOnboardingStep: React.Dispatch<React.SetStateAction<number>>;
  setOnboardingError: (err: string) => void;
  handleLogout: () => Promise<void>;
  handleOnboardingSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function OnboardingWizard({
  onboardingStep,
  onboardingError,
  existingAccountError,
  submittingOnboarding,
  obForm,
  currentTime,
  setObForm,
  setOnboardingStep,
  setOnboardingError,
  handleLogout,
  handleOnboardingSubmit
}: OnboardingWizardProps) {
  return (
    <div className="min-h-screen bg-[#1A2421] text-[#DAF0DD] flex flex-col justify-between relative overflow-hidden" id="onboarding-root">
      {/* Utilities Rail */}
      <div className="w-full bg-[#131b19] border-b border-[#DAF0DD]/10 py-2.5 px-6 flex justify-between items-center text-[11px] font-mono text-[#DAF0DD]/60" id="onboarding-rail">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00CC88] animate-pulse"></span>
          <span>WIZARD GATEWAY: PROFILE NEEDED</span>
        </div>
        <div>{currentTime}</div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl w-full mx-auto px-6 py-12 z-10 flex-grow flex flex-col justify-center font-sans" id="onboarding-main">
        {existingAccountError ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#131b19] border border-red-500/30 rounded-2xl p-8 text-center max-w-md mx-auto shadow-2xl" id="blocked-screen">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-3">Onboarding Blocked</h2>
            <p className="text-[#DAF0DD]/80 text-sm leading-relaxed mb-6 font-mono">
              {existingAccountError}
            </p>
            <button
              onClick={handleLogout}
              className="px-6 py-3 rounded-xl bg-[#F7F069]/10 border border-[#F7F069]/30 text-[#F7F069] text-xs font-bold hover:bg-[#F7F069]/20 transition cursor-pointer font-mono"
            >
              Go back to Login
            </button>
          </motion.div>
        ) : (
          <>
            <div className="mb-8 text-center" id="onboarding-header">
              <div className="w-12 h-12 bg-[#23312C] border border-[#DAF0DD]/20 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-[#00CC88]/5 mx-auto mb-4">
                <img src="https://i.ibb.co/pjxqNW0p/favicon.png" alt="Deloxe HR Logo" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
              </div>
              <h1 className="text-3xl font-display font-extrabold text-white">Referral Incentive Onboarding</h1>
              <p className="text-[#DAF0DD]/60 text-xs font-mono mt-1 uppercase tracking-widest">Complete registration to activate tracking slugs</p>
            </div>

            {/* Stepper Indicators */}
            <div className="grid grid-cols-4 gap-2 mb-10 text-center font-mono text-[10px]" id="stepper-indicators">
              {[
                { label: "INCENTIVE TYPE", step: 1 },
                { label: "PROFILE INFO", step: 2 },
                { label: "FINANCIALS", step: 3 },
                { label: "AGREEMENT", step: 4 }
              ].map((s) => (
                <div key={s.step} className="flex flex-col gap-1.5" id={`step-indicator-${s.step}`}>
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${onboardingStep >= s.step ? "bg-[#00CC88] shadow-sm shadow-[#00CC88]/20" : "bg-[#23312C]"}`}></div>
                  <span className={onboardingStep === s.step ? "text-[#00CC88] font-bold" : "text-[#DAF0DD]/40"}>{s.label}</span>
                </div>
              ))}
            </div>

            {/* Wizard Card */}
            <div className="p-8 rounded-2xl bg-[#23312C]/60 border border-[#DAF0DD]/15 backdrop-blur-xl shadow-2xl relative" id="wizard-card">
              <form onSubmit={handleOnboardingSubmit} className="flex flex-col gap-6">
                {onboardingError && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono flex items-center gap-2" id="onboarding-error-box">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{onboardingError}</span>
                  </div>
                )}

                {/* Step 1: Selection */}
                {onboardingStep === 1 && (() => {
                  const configIndividual = getRewardConfig(obForm.country, "individual");
                  const configCorporate = getRewardConfig(obForm.country, "corporate");
                  return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4" id="step-1-view">
                      <h3 className="font-display font-bold text-lg text-white">1. Select Structure</h3>
                      <p className="text-[#DAF0DD]/80 text-xs leading-relaxed mb-2">
                        Your allocation rate depends automatically on your structure and country. Choose your operating country below to see local currency rates.
                      </p>

                      {/* Country Selector */}
                      <div className="flex flex-col gap-1.5 mb-2 bg-[#131b19] border border-[#DAF0DD]/15 p-4 rounded-xl" id="country-select-wrapper">
                        <label className="text-xs font-semibold text-[#DAF0DD]/80">Country of Operation *</label>
                        <select
                          value={obForm.country}
                          onChange={(e) => setObForm({ ...obForm, country: e.target.value })}
                          className="p-3 bg-[#1A2421] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60 font-sans cursor-pointer"
                        >
                          <option value="Nigeria">Nigeria (₦ / NGN)</option>
                          <option value="United States">United States ($ / USD)</option>
                          <option value="United Kingdom">United Kingdom (£ / GBP)</option>
                          <option value="Europe">Europe (€ / EUR)</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="structure-options">
                        <button
                          type="button"
                          id="partner-type-individual-btn"
                          onClick={() => setObForm({ ...obForm, partnerType: "individual" })}
                          className={`p-6 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                            obForm.partnerType === "individual" 
                              ? "bg-[#00CC88]/5 border-[#00CC88]/60 shadow-lg shadow-[#00CC88]/5" 
                              : "bg-[#131b19]/30 border-[#DAF0DD]/10 hover:border-[#DAF0DD]/30"
                          }`}
                        >
                          <User className={`w-6 h-6 ${obForm.partnerType === "individual" ? "text-[#00CC88]" : "text-[#DAF0DD]/40"}`} />
                          <span className="font-display font-bold text-sm text-slate-100">Individual Influencer</span>
                          <span className="text-[11px] text-[#DAF0DD]/70 mt-1">Perfect for content creators, social agents, and independent referrers.</span>
                          <span className="text-xs font-mono text-[#00CC88] mt-3 font-semibold">
                            {configIndividual.symbol}{configIndividual.rate.toLocaleString()} per Verified Milestone
                          </span>
                        </button>

                        <button
                          type="button"
                          id="partner-type-corporate-btn"
                          onClick={() => setObForm({ ...obForm, partnerType: "corporate" })}
                          className={`p-6 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${
                            obForm.partnerType === "corporate" 
                              ? "bg-[#00CC88]/5 border-[#00CC88]/60 shadow-lg shadow-[#00CC88]/5" 
                              : "bg-[#131b19]/30 border-[#DAF0DD]/10 hover:border-[#DAF0DD]/30"
                          }`}
                        >
                          <Briefcase className={`w-6 h-6 ${obForm.partnerType === "corporate" ? "text-[#00CC88]" : "text-[#DAF0DD]/40"}`} />
                          <span className="font-display font-bold text-sm text-slate-100">Corporate Referral Incentive</span>
                          <span className="text-[11px] text-[#DAF0DD]/70 mt-1">Tailored for HR agencies, talent consulting firms, and institutions.</span>
                          <span className="text-xs font-mono text-[#00CC88] mt-3 font-semibold">
                            {configCorporate.symbol}{configCorporate.rate.toLocaleString()} per Verified Milestone
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })()}

                {/* Step 2: Profile Info */}
                {onboardingStep === 2 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4" id="step-2-view">
                    <h3 className="font-display font-bold text-lg text-white">2. Profile & Identification</h3>
                    <p className="text-[#DAF0DD]/80 text-xs leading-relaxed mb-2">
                      Provide real contact details and social media anchors for account verification.
                    </p>

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#DAF0DD]/80">Full Legal Name *</label>
                        <input
                          type="text"
                          required
                          value={obForm.fullName}
                          onChange={(e) => setObForm({ ...obForm, fullName: e.target.value })}
                          className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
                          placeholder="John Doe"
                        />
                      </div>

                      {obForm.partnerType === "corporate" && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="corporate-details-fields">
                          <div className="flex flex-col gap-1 sm:col-span-1">
                            <label className="text-xs font-semibold text-[#DAF0DD]/80">Company Name *</label>
                            <input
                              type="text"
                              required
                              value={obForm.companyName}
                              onChange={(e) => setObForm({ ...obForm, companyName: e.target.value })}
                              className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
                              placeholder="Acme Talent Ltd"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[#DAF0DD]/80">Rep. Name *</label>
                            <input
                              type="text"
                              required
                              value={obForm.representativeName}
                              onChange={(e) => setObForm({ ...obForm, representativeName: e.target.value })}
                              className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
                              placeholder="Alice Smith"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[#DAF0DD]/80">Rep. Title *</label>
                            <input
                              type="text"
                              required
                              value={obForm.representativeTitle}
                              onChange={(e) => setObForm({ ...obForm, representativeTitle: e.target.value })}
                              className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
                              placeholder="Managing Director"
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-[#DAF0DD]/60">Primary Contact Email *</label>
                          <input
                            type="email"
                            required
                            disabled
                            value={obForm.email}
                            className="p-3 bg-[#131b19]/50 border border-[#DAF0DD]/10 rounded-xl text-xs text-[#DAF0DD]/40 focus:outline-none cursor-not-allowed"
                            placeholder="partner@example.com"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-semibold text-[#DAF0DD]/80">Mobile Phone Number *</label>
                          <input
                            type="tel"
                            required
                            value={obForm.phone}
                            onChange={(e) => setObForm({ ...obForm, phone: e.target.value })}
                            className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
                            placeholder="+234 80 1234 5678"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#DAF0DD]/80">Social Media Anchor/Handle *</label>
                        <input
                          type="text"
                          required
                          value={obForm.socialHandle}
                          onChange={(e) => setObForm({ ...obForm, socialHandle: e.target.value })}
                          className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
                          placeholder="e.g. linkedin.com/in/username or @twitter_handle"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Financials */}
                {onboardingStep === 3 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4" id="step-3-view">
                    <h3 className="font-display font-bold text-lg text-white">3. Payout & Financial Routing</h3>
                    <p className="text-[#DAF0DD]/80 text-xs leading-relaxed mb-2">
                      Select your preferred payout method and enter your settlement routing details.
                    </p>

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-[#DAF0DD]/85">Payout Method *</label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setObForm({ ...obForm, payoutMethod: "bank_transfer" })}
                            className={`p-3.5 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              obForm.payoutMethod === "bank_transfer"
                                ? "bg-[#00CC88]/10 border-[#00CC88]/60 text-[#00CC88]"
                                : "bg-[#131b19] border-[#DAF0DD]/15 text-[#DAF0DD]/60"
                            }`}
                          >
                            Bank Transfer
                          </button>
                          <button
                            type="button"
                            onClick={() => setObForm({ ...obForm, payoutMethod: "crypto" })}
                            className={`p-3.5 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              obForm.payoutMethod === "crypto"
                                ? "bg-[#00CC88]/10 border-[#00CC88]/60 text-[#00CC88]"
                                : "bg-[#131b19] border-[#DAF0DD]/15 text-[#DAF0DD]/60"
                            }`}
                          >
                            Crypto
                          </button>
                        </div>
                      </div>

                      {obForm.payoutMethod === "bank_transfer" ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-[#DAF0DD]/80">Settlement Bank Name *</label>
                              <input
                                type="text"
                                required
                                value={obForm.bankName}
                                onChange={(e) => setObForm({ ...obForm, bankName: e.target.value })}
                                className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
                                placeholder="e.g. Access Bank, GTBank"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-[#DAF0DD]/80">Account Number (10 digits) *</label>
                              <input
                                type="text"
                                required
                                maxLength={10}
                                value={obForm.accountNumber}
                                onChange={(e) => setObForm({ ...obForm, accountNumber: e.target.value })}
                                className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60 font-mono"
                                placeholder="0123456789"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[#DAF0DD]/80">Account Name *</label>
                            <input
                              type="text"
                              required
                              value={obForm.accountName}
                              onChange={(e) => setObForm({ ...obForm, accountName: e.target.value })}
                              className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
                              placeholder="John Doe Enterprises"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-[#DAF0DD]/80">Cryptocurrency *</label>
                              <select
                                value={obForm.cryptoCurrency}
                                onChange={(e) => {
                                  const cur = e.target.value as "USDT" | "USDC" | "RLUSD";
                                  const validNetworks = CRYPTO_NETWORKS_MAP[cur] || ["Ethereum"];
                                  setObForm({
                                    ...obForm,
                                    cryptoCurrency: cur,
                                    cryptoNetwork: validNetworks[0]
                                  });
                                }}
                                className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60 font-mono"
                              >
                                <option value="USDT">USDT</option>
                                <option value="USDC">USDC</option>
                                <option value="RLUSD">RLUSD</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-semibold text-[#DAF0DD]/80">Network *</label>
                              <select
                                value={obForm.cryptoNetwork}
                                onChange={(e) => setObForm({ ...obForm, cryptoNetwork: e.target.value })}
                                className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60 font-mono"
                              >
                                {(CRYPTO_NETWORKS_MAP[obForm.cryptoCurrency] || []).map(net => (
                                  <option key={net} value={net}>{net}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[#DAF0DD]/80">Wallet Address *</label>
                            <input
                              type="text"
                              required
                              value={obForm.walletAddress}
                              onChange={(e) => setObForm({ ...obForm, walletAddress: e.target.value })}
                              className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60 font-mono"
                              placeholder="Enter your crypto wallet address..."
                            />
                          </div>
                        </>
                      )}

                      <div className="flex flex-col gap-1.5 mt-2">
                        <label className="text-xs font-semibold text-[#DAF0DD]/80">Payout Settlement Frequency *</label>
                        <div className="grid grid-cols-2 gap-4 mt-1">
                          <button
                            type="button"
                            onClick={() => setObForm({ ...obForm, payoutFrequency: "weekly" })}
                            className={`p-3.5 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              obForm.payoutFrequency === "weekly"
                                ? "bg-[#00CC88]/10 border-[#00CC88]/60 text-[#00CC88]"
                                : "bg-[#131b19] border-[#DAF0DD]/15 text-[#DAF0DD]/60"
                            }`}
                          >
                            <Calendar className="w-4 h-4" /> Weekly Settlement
                          </button>
                          <button
                            type="button"
                            onClick={() => setObForm({ ...obForm, payoutFrequency: "monthly" })}
                            className={`p-3.5 rounded-xl border font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              obForm.payoutFrequency === "monthly"
                                ? "bg-[#00CC88]/10 border-[#00CC88]/60 text-[#00CC88]"
                                : "bg-[#131b19] border-[#DAF0DD]/15 text-[#DAF0DD]/60"
                            }`}
                          >
                            <Calendar className="w-4 h-4" /> Monthly Settlement
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Digital Signature */}
                {onboardingStep === 4 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4" id="step-4-view">
                    <h3 className="font-display font-bold text-lg text-white">4. Referral Incentive Agreement & Sign-off</h3>
                    <p className="text-[#DAF0DD]/80 text-xs leading-relaxed mb-1">
                      Please read through the legal stipulations below and provide your digital signature authorization.
                    </p>

                    <div className="p-4 bg-[#131b19] rounded-xl border border-[#DAF0DD]/15 max-h-40 overflow-y-auto text-[10px] text-[#DAF0DD]/80 leading-relaxed font-mono">
                      <p className="font-bold text-[#F7F167] mb-2">DELOXE HR REFERRAL INCENTIVE AGREEMENT</p>
                      <p className="mb-2">1. SCOPE OF ENGAGEMENT: Referral incentive representative will act as an independent representative distributing approved tracking URLs to refer competent candidates.</p>
                      <p className="mb-2">2. CONVERSION AUDITING: All stats, clicks, and subsequent milestone payments are calculated exclusively by Deloxe’s backend. Self-calculations or client-side logs are non-binding.</p>
                      <p className="mb-2">3. REWARD CRITERIA: Conversion commissions trigger strictly upon candidate advancement to milestones. Rate schedules are assigned automatically based on selected structure.</p>
                      <p>4. PRIVILEGE REVOCATION: Deloxe reserves the right to suspend any referral code found in violation of referral policies or executing malicious bot click traffic.</p>
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                      <label className="flex items-start gap-2.5 text-slate-300 text-xs select-none cursor-pointer">
                        <input
                          type="checkbox"
                          checked={obForm.agreementAccepted}
                          onChange={(e) => setObForm({ ...obForm, agreementAccepted: e.target.checked })}
                          className="mt-0.5 accent-[#00CC88]"
                        />
                        <span>I hereby accept and authorize the legal parameters, and acknowledge that all statistics calculations are administered strictly by Deloxe backend systems. *</span>
                      </label>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-[#DAF0DD]/80">Digital Signature (Type legal name to sign) *</label>
                        <input
                          type="text"
                          required
                          value={obForm.digitalSignature}
                          onChange={(e) => setObForm({ ...obForm, digitalSignature: e.target.value })}
                          className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60 font-mono italic"
                          placeholder={obForm.fullName || "Your Full Name"}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation controls */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#DAF0DD]/15">
                  {onboardingStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setOnboardingError("");
                        setOnboardingStep(prev => prev - 1);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#131b19] border border-[#DAF0DD]/15 text-xs font-semibold text-[#DAF0DD]/80 hover:text-white transition cursor-pointer font-sans"
                    >
                      Back
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {onboardingStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (onboardingStep === 2) {
                          if (!obForm.fullName || !obForm.phone || !obForm.email || !obForm.socialHandle) {
                            setOnboardingError("Please complete all profile details to continue.");
                            return;
                          }
                        }
                        if (onboardingStep === 3) {
                          if (obForm.payoutMethod === "bank_transfer") {
                            if (!obForm.bankName || !obForm.accountName || !obForm.accountNumber) {
                              setOnboardingError("Please complete all bank transfer details.");
                              return;
                            }
                          } else {
                            if (!obForm.cryptoCurrency || !obForm.cryptoNetwork || !obForm.walletAddress) {
                              setOnboardingError("Please complete all crypto payout details.");
                              return;
                            }
                          }
                        }
                        setOnboardingError("");
                        setOnboardingStep(prev => prev + 1);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#00CC88] hover:bg-[#00CC88]/90 text-[#1A2421] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-sans"
                    >
                      Continue <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submittingOnboarding}
                      className="px-6 py-2.5 rounded-xl bg-[#00CC88] hover:bg-[#00CC88]/90 text-[#1A2421] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer font-sans disabled:opacity-50"
                    >
                      {submittingOnboarding ? "Activating Portal..." : "Activate Referral Incentive Code"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
