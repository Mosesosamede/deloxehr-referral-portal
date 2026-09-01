"use client";

import React from "react";
import { motion } from "motion/react";
import { formatDate } from "@/lib/date-utils";
import { PartnerCommissionDocument } from "@/lib/db-helpers";

interface CommissionsTabProps {
  commissions: PartnerCommissionDocument[];
  dbLoading: boolean;
  currencySymbol: string;
}

export default function CommissionsTab({
  commissions,
  dbLoading,
  currencySymbol
}: CommissionsTabProps) {
  return (
    <motion.div 
      key="commissions"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[#23312C]/40 border border-[#DAF0DD]/15 rounded-2xl overflow-hidden shadow-xl"
      id="commissions-tab"
    >
      <div className="p-5 border-b border-[#DAF0DD]/15 bg-[#23312C]/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-display font-bold text-base text-[#DAF0DD]">Commission Ledger</h3>
          <p className="text-xs text-[#DAF0DD]/60 mt-1">Audit verified referral conversions and their payouts status</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs" id="commissions-table">
          <thead>
            <tr className="border-b border-[#DAF0DD]/15 text-[#DAF0DD]/50 uppercase tracking-widest font-mono text-[9px]">
              <th className="p-4 pl-6">Transaction ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total Value</th>
              <th className="p-4">My Commission</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6">Recorded Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DAF0DD]/10">
            {dbLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#DAF0DD]/50 font-mono">Syncing database registers...</td>
              </tr>
            ) : commissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-[#DAF0DD]/50 leading-relaxed font-mono">
                  No conversion commissions on record.<br />
                  <span className="text-[10px] mt-1 text-[#DAF0DD]/30 block">Commission records appear upon processing of verified conversions.</span>
                </td>
              </tr>
            ) : (
              commissions.map((comm) => (
                <tr key={comm.commissionId} className="hover:bg-[#131b19]/20 transition-all font-mono" id={`commission-row-${comm.commissionId}`}>
                  <td className="p-4 pl-6 text-[#DAF0DD]/60">{comm.transactionId}</td>
                  <td className="p-4 font-sans text-[#DAF0DD]">{comm.email}</td>
                  <td className="p-4 text-[#DAF0DD]/80">{currencySymbol}{comm.amountPaid.toLocaleString()}</td>
                  <td className="p-4 text-[#00CC88] font-bold">{currencySymbol}{comm.commissionAmount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold border uppercase tracking-wider ${
                      comm.payoutStatus === "paid" 
                        ? "bg-[#00CC88]/10 border-[#00CC88]/20 text-[#00CC88]" 
                        : comm.payoutStatus === "processing"
                        ? "bg-[#F7F167]/10 border-[#F7F167]/20 text-[#F7F167]"
                        : "bg-[#DAF0DD]/10 border-[#DAF0DD]/20 text-[#DAF0DD]/80"
                    }`}>
                      {comm.payoutStatus}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-[#DAF0DD]/60">{formatDate(comm.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
