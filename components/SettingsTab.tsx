"use client";

import React from "react";
import { motion } from "motion/react";
import { Lock, Shield } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { PartnerDocument } from "@/lib/db-helpers";

const CRYPTO_NETWORKS_MAP: Record<string, string[]> = {
  USDT: ['SOL', 'Polygon', 'Ethereum', 'Arbitrum'],
  USDC: ['SOL', 'Polygon', 'Ethereum', 'Base', 'Arbitrum'],
  RLUSD: ['Ethereum']
};

interface SettingsTabProps {
  partner: PartnerDocument;
  editForm: {
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
  };
  setEditForm: React.Dispatch<React.SetStateAction<any>>;
  editLoading: boolean;
  editError: string;
  editSuccess: string;
  currencySymbol: string;
  handleProfileUpdate: (e: React.FormEvent) => Promise<void>;
}

export default function SettingsTab({
  partner,
  editForm,
  setEditForm,
  editLoading,
  editError,
  editSuccess,
  currencySymbol,
  handleProfileUpdate
}: SettingsTabProps) {
  return (
    <motion.div 
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      id="settings-tab"
    >
      {/* Profile Config Form */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-[#23312C]/40 border border-[#DAF0DD]/15 backdrop-blur shadow-xl" id="edit-preferences-card">
        <h3 className="font-display font-bold text-base text-[#DAF0DD] mb-2">Edit Preferences</h3>
        <p className="text-xs text-[#DAF0DD]/60 mb-6 leading-relaxed">Update your contact profile and financial routing records instantly. All writes adhere strictly to security filters.</p>

        <form onSubmit={handleProfileUpdate} className="flex flex-col gap-5" id="profile-edit-form">
          {editError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono" id="edit-error-display">
              {editError}
            </div>
          )}
          {editSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-[#00CC88]/20 rounded-xl text-[#00CC88] text-xs font-mono" id="edit-success-display">
              {editSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#DAF0DD]/70">Full Legal Name *</label>
              <input
                type="text"
                required
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#DAF0DD]/50">Contact Email *</label>
              <input
                type="email"
                required
                disabled
                value={editForm.email}
                className="p-3 bg-[#131b19]/50 border border-[#DAF0DD]/10 rounded-xl text-xs text-[#DAF0DD]/40 focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {partner.partnerType === "corporate" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="corporate-edit-fields">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#DAF0DD]/70">Company Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.companyName}
                  onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                  className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#DAF0DD]/70">Representative Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.representativeName}
                  onChange={(e) => setEditForm({ ...editForm, representativeName: e.target.value })}
                  className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#DAF0DD]/70">Representative Title *</label>
                <input
                  type="text"
                  required
                  value={editForm.representativeTitle}
                  onChange={(e) => setEditForm({ ...editForm, representativeTitle: e.target.value })}
                  className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#DAF0DD]/70">Mobile Phone Number *</label>
              <input
                type="tel"
                required
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#DAF0DD]/70">Social Media handle *</label>
              <input
                type="text"
                required
                value={editForm.socialHandle}
                onChange={(e) => setEditForm({ ...editForm, socialHandle: e.target.value })}
                className="p-3 bg-[#131b19] border border-[#DAF0DD]/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
              />
            </div>
          </div>

          <div className="p-4 bg-[#131b19]/40 rounded-xl border border-[#DAF0DD]/15 flex flex-col gap-4" id="financial-settlements-box">
            <h4 className="font-display font-semibold text-xs text-[#DAF0DD]">Financial Settlements Routing</h4>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-[#DAF0DD]/60 font-mono">Payout Method</label>
              <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, payoutMethod: "bank_transfer" })}
                  className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    editForm.payoutMethod === "bank_transfer"
                      ? "bg-[#00CC88]/10 border-[#00CC88]/60 text-[#00CC88]"
                      : "bg-[#131b19] border border-[#DAF0DD]/15 text-[#DAF0DD]/50"
                  }`}
                >
                  BANK TRANSFER
                </button>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, payoutMethod: "crypto" })}
                  className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    editForm.payoutMethod === "crypto"
                      ? "bg-[#00CC88]/10 border-[#00CC88]/60 text-[#00CC88]"
                      : "bg-[#131b19] border border-[#DAF0DD]/15 text-[#DAF0DD]/50"
                  }`}
                >
                  CRYPTO
                </button>
              </div>
            </div>

            {editForm.payoutMethod === "bank_transfer" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-[#DAF0DD]/60 font-mono">Bank Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.bankName}
                      onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                      className="p-2.5 bg-[#131b19] border border-[#DAF0DD]/20 rounded-lg text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-[#DAF0DD]/60 font-mono">Account Number</label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={editForm.accountNumber}
                      onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                      className="p-2.5 bg-[#131b19] border border-[#DAF0DD]/20 rounded-lg text-xs text-white focus:outline-none focus:border-[#00CC88]/60 font-mono"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[#DAF0DD]/60 font-mono">Account Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.accountName}
                    onChange={(e) => setEditForm({ ...editForm, accountName: e.target.value })}
                    className="p-2.5 bg-[#131b19] border border-[#DAF0DD]/20 rounded-lg text-xs text-white focus:outline-none focus:border-[#00CC88]/60"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-[#DAF0DD]/60 font-mono">Cryptocurrency</label>
                    <select
                      value={editForm.cryptoCurrency}
                      onChange={(e) => {
                        const cur = e.target.value as "USDT" | "USDC" | "RLUSD";
                        const validNetworks = CRYPTO_NETWORKS_MAP[cur] || ["Ethereum"];
                        setEditForm({
                          ...editForm,
                          cryptoCurrency: cur,
                          cryptoNetwork: validNetworks[0]
                        });
                      }}
                      className="p-2.5 bg-[#131b19] border border-[#DAF0DD]/20 rounded-lg text-xs text-white focus:outline-none focus:border-[#00CC88]/60 font-mono"
                    >
                      <option value="USDT">USDT</option>
                      <option value="USDC">USDC</option>
                      <option value="RLUSD">RLUSD</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-[#DAF0DD]/60 font-mono">Network</label>
                    <select
                      value={editForm.cryptoNetwork}
                      onChange={(e) => setEditForm({ ...editForm, cryptoNetwork: e.target.value })}
                      className="p-2.5 bg-[#131b19] border border-[#DAF0DD]/20 rounded-lg text-xs text-white focus:outline-none focus:border-[#00CC88]/60 font-mono"
                    >
                      {(CRYPTO_NETWORKS_MAP[editForm.cryptoCurrency] || []).map(net => (
                        <option key={net} value={net}>{net}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-[#DAF0DD]/60 font-mono">Wallet Address</label>
                  <input
                    type="text"
                    required
                    value={editForm.walletAddress}
                    onChange={(e) => setEditForm({ ...editForm, walletAddress: e.target.value })}
                    className="p-2.5 bg-[#131b19] border border-[#DAF0DD]/20 rounded-lg text-xs text-white focus:outline-none focus:border-[#00CC88]/60 font-mono"
                    placeholder="Enter crypto wallet address..."
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1 mt-1">
              <label className="text-[10px] font-semibold text-[#DAF0DD]/60 font-mono">Payout Settlement Frequency</label>
              <div className="grid grid-cols-2 gap-3 mt-1 font-mono text-[11px]">
                <button
                  type="button"
                  id="settings-payout-weekly"
                  onClick={() => setEditForm({ ...editForm, payoutFrequency: "weekly" })}
                  className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    editForm.payoutFrequency === "weekly"
                      ? "bg-[#00CC88]/10 border-[#00CC88]/60 text-[#00CC88]"
                      : "bg-[#131b19] border border-[#DAF0DD]/15 text-[#DAF0DD]/50"
                  }`}
                >
                  WEEKLY
                </button>
                <button
                  type="button"
                  id="settings-payout-monthly"
                  onClick={() => setEditForm({ ...editForm, payoutFrequency: "monthly" })}
                  className={`p-2.5 rounded-lg border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    editForm.payoutFrequency === "monthly"
                      ? "bg-[#00CC88]/10 border-[#00CC88]/60 text-[#00CC88]"
                      : "bg-[#131b19] border border-[#DAF0DD]/15 text-[#DAF0DD]/50"
                  }`}
                >
                  MONTHLY
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            id="settings-save-btn"
            disabled={editLoading}
            className="w-fit px-6 py-2.5 rounded-xl bg-[#00CC88] hover:bg-[#00CC88]/90 text-[#1A2421] font-sans font-bold text-xs transition active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {editLoading ? "Saving Updates..." : "Save Preferences"}
          </button>
        </form>
      </div>

      {/* Immutable Security Parameters Card */}
      <div className="p-6 rounded-2xl bg-[#23312C]/40 border border-[#DAF0DD]/15 backdrop-blur shadow-xl relative overflow-hidden flex flex-col justify-between" id="immutable-ledger-card">
        <div>
          <div className="flex items-center gap-2 mb-4 text-[#00CC88]">
            <Lock className="w-4.5 h-4.5" />
            <h3 className="font-display font-bold text-sm text-[#DAF0DD]">Locked Ledger Profiles</h3>
          </div>
          <p className="text-[#DAF0DD]/60 text-xs leading-relaxed mb-6">
            To maintain transactional auditing safety and prevent privilege fraud, the following parameters are strictly read-only and locked at the database rule layer.
          </p>

          <div className="flex flex-col gap-3 font-mono text-[11px] text-[#DAF0DD]/80">
            {[
              { label: "Referral Incentive ID", value: partner.partnerDisplayId || ("DELXp" + partner.partnerId.slice(0, 4).toUpperCase()) },
              { label: "Auth UID", value: `${partner.partnerId.slice(0, 8)}...` },
              { label: "Profile Structure", value: partner.partnerType.toUpperCase() },
              { label: "Reward Rate Allocation", value: `${currencySymbol}${partner.rewardRate.toLocaleString()} / Verified Milestone` },
              { label: "Referral Upper Code", value: partner.referralCode },
              { label: "Agreement Signature", value: "ACCEPTED" },
              { label: "Signed DateTime", value: formatDate(partner.agreementSignedAt) }
            ].map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#131b19]/40 border border-[#DAF0DD]/10 flex justify-between items-center" id={`locked-item-${idx}`}>
                <span className="text-[#DAF0DD]/50 text-[10px] uppercase">{item.label}</span>
                <span className="font-semibold text-[#DAF0DD] tracking-tight">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-3 bg-[#131b19]/50 rounded-xl border border-[#DAF0DD]/10 flex items-start gap-2.5 text-[#DAF0DD]/50 text-[10px] leading-relaxed font-mono" id="crypto-notice">
          <Shield className="w-4.5 h-4.5 text-[#00CC88]/70 shrink-0 mt-0.5" />
          <span>These parameters are cryptographically secured and managed directly by the ledger protocol. Client modifications are rejected.</span>
        </div>
      </div>
    </motion.div>
  );
}
