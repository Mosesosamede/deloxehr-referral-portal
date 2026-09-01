"use client";

import React from "react";
import { motion } from "motion/react";
import { formatDate } from "@/lib/date-utils";
import { PayoutDocument } from "@/lib/db-helpers";

interface PayoutsTabProps {
  payouts: PayoutDocument[];
  dbLoading: boolean;
  currencySymbol: string;
}

export default function PayoutsTab({
  payouts,
  dbLoading,
  currencySymbol
}: PayoutsTabProps) {
  return (
    <motion.div 
      key="payouts"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[#23312C]/40 border border-[#DAF0DD]/15 rounded-2xl overflow-hidden shadow-xl"
      id="payouts-tab"
    >
      <div className="p-5 border-b border-[#DAF0DD]/15 bg-[#23312C]/20 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h3 className="font-display font-bold text-base text-[#DAF0DD]">Payout Settlement Ledger</h3>
          <p className="text-xs text-[#DAF0DD]/60 mt-1">Audit bank clearing dates and unique references for distributed funds</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs" id="payouts-table">
          <thead>
            <tr className="border-b border-[#DAF0DD]/15 text-[#DAF0DD]/50 uppercase tracking-widest font-mono text-[9px]">
              <th className="p-4 pl-6">Reference ID</th>
              <th className="p-4">Period Start</th>
              <th className="p-4">Period End</th>
              <th className="p-4">Total Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4 pr-6">Payment Cleared</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DAF0DD]/10">
            {dbLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#DAF0DD]/50 font-mono">Querying financial databases...</td>
              </tr>
            ) : payouts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-[#DAF0DD]/50 leading-relaxed font-mono">
                  No distributions recorded.<br />
                  <span className="text-[10px] mt-1 text-[#DAF0DD]/30 block">Payout records appear upon processing of verified conversions.</span>
                </td>
              </tr>
            ) : (
              payouts.map((pay) => (
                <tr key={pay.payoutId} className="hover:bg-[#131b19]/20 transition-all font-mono" id={`payout-row-${pay.payoutId}`}>
                  <td className="p-4 pl-6 text-[#DAF0DD] font-bold">{pay.paymentReference}</td>
                  <td className="p-4 text-[#DAF0DD]/60">{formatDate(pay.periodStart)}</td>
                  <td className="p-4 text-[#DAF0DD]/60">{formatDate(pay.periodEnd)}</td>
                  <td className="p-4 text-[#00CC88] font-bold">{currencySymbol}{pay.totalAmount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold border uppercase tracking-wider ${
                      pay.status === "completed" 
                        ? "bg-[#00CC88]/10 border-[#00CC88]/20 text-[#00CC88]" 
                        : pay.status === "failed"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : "bg-[#F7F167]/10 border-[#F7F167]/20 text-[#F7F167]"
                    }`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-[#DAF0DD]/80">{formatDate(pay.paidAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
