"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Copy, Check, Share2, Megaphone, HelpCircle, Cpu } from "lucide-react";
import { PartnerDocument } from "@/lib/db-helpers";

interface ReferralMaterialsTabProps {
  partner: PartnerDocument;
}

export default function ReferralMaterialsTab({ partner }: ReferralMaterialsTabProps) {
  const referralUrl = `https://ecosystem.deloxehr.com/?ref=${partner.referralCode}`;
  
  // State to track copied templates
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const templates = [
    {
      title: "Direct & Direct (WhatsApp, Telegram, or SMS)",
      description: "Best for quick sharing with friends, classmates, and study groups.",
      text: `Are you looking for internship training and high-value career skills? 🚀 Join Deloxe HR to gain practical, hands-on experience and accelerate your professional growth. Register through my exclusive portal link to start your career journey today: ${referralUrl}`
    },
    {
      title: "Professional & Value-Focused (LinkedIn or Email)",
      description: "Tailored to position the training opportunity as an essential resume-builder.",
      text: `Are you looking to break into your dream industry? Deloxe HR offers hands-on internship programs designed to equip you with critical career skills and practical experience. Don't just study—build a real portfolio under expert guidance. Register through my custom ambassador link below and secure your placement: ${referralUrl}`
    },
    {
      title: "Social Media Hook (Instagram, Twitter/X, or Facebook)",
      description: "Includes hashtags and highly engaging callouts designed to capture attention.",
      text: `🎓 Students & Graduates! Stop searching for empty theory. Join Deloxe HR, gain practical hands-on career skills, and get real internship training to jumpstart your career. Register using my personal ambassador invite link: ${referralUrl} #Internship #CareerSkills #DeloxeHR #PracticalExperience`
    }
  ];

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <motion.div
      key="materials"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
      id="referral-materials-tab"
    >
      {/* Intro Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#23312C] via-[#131b19] to-[#23312C] border border-[#DAF0DD]/15 shadow-xl relative overflow-hidden" id="materials-banner">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#00CC88]/5 rounded-full blur-[40px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#00CC88]/10 border border-[#00CC88]/20 rounded-full text-[10px] font-mono text-[#00CC88]">
              <Cpu className="w-3.5 h-3.5 animate-pulse text-[#00CC88]" /> PROMOTIONAL SUITE
            </div>
            <h2 className="font-display font-bold text-lg text-[#DAF0DD] mt-2">Ambassador Referral Materials</h2>
            <p className="text-xs text-[#DAF0DD]/70 max-w-2xl leading-relaxed">
              Use these pre-refined, high-converting copy templates to invite students and graduates. Dynamic parameter injection automatically bundles your personal referral code into every link.
            </p>
          </div>
          <div className="p-4 bg-[#131b19]/60 border border-[#DAF0DD]/10 rounded-xl font-mono text-[11px] text-right" id="materials-link-box">
            <span className="text-[#DAF0DD]/40 block text-[9px] uppercase tracking-wider mb-1">Your Referral Link</span>
            <span className="text-[#00CC88] font-bold select-all">{referralUrl}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Templates List */}
        <div className="lg:col-span-2 space-y-4" id="materials-templates-section">
          <h3 className="font-display font-bold text-sm text-[#DAF0DD] flex items-center gap-2 px-1">
            <Megaphone className="w-4.5 h-4.5 text-[#00CC88]" />
            <span>High-Converting Message Templates</span>
          </h3>

          {templates.map((tpl, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#23312C]/40 border border-[#DAF0DD]/15 backdrop-blur shadow-md flex flex-col justify-between gap-4 hover:border-[#DAF0DD]/25 transition-all"
              id={`template-card-${idx}`}
            >
              <div>
                <span className="text-[10px] font-mono text-[#F7F167] font-semibold uppercase tracking-wider">{tpl.title}</span>
                <p className="text-[11px] text-[#DAF0DD]/50 mt-0.5 mb-3">{tpl.description}</p>
                <div className="p-4 bg-[#131b19]/80 rounded-xl border border-[#DAF0DD]/10 text-xs text-[#DAF0DD]/90 leading-relaxed font-sans whitespace-pre-line relative select-all">
                  {tpl.text}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleCopyText(tpl.text, idx)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedIndex === idx
                      ? "bg-[#00CC88] text-[#1A2421]"
                      : "bg-[#23312C] hover:bg-[#23312C]/80 text-[#00CC88] border border-[#00CC88]/20"
                  }`}
                  id={`copy-tpl-btn-${idx}`}
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>COPIED TO CLIPBOARD</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>COPY TEMPLATE</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Promotion Tips */}
        <div className="p-5 rounded-2xl bg-[#23312C]/40 border border-[#DAF0DD]/15 backdrop-blur shadow-xl space-y-6 self-start" id="materials-tips-sidebar">
          <div className="flex items-center gap-2 text-[#00CC88]">
            <HelpCircle className="w-5 h-5" />
            <h3 className="font-display font-bold text-sm text-[#DAF0DD]">Ambassador Growth Strategy</h3>
          </div>
          
          <div className="space-y-4 text-xs leading-relaxed">
            <div className="p-3 bg-[#131b19]/50 rounded-xl border border-[#DAF0DD]/10" id="tip-1">
              <span className="font-bold text-[#F7F167] block mb-1">1. Share in School Groups</span>
              <p className="text-[#DAF0DD]/70 text-[11px]">
                Post message templates directly in university group chats, Telegram groups, and Discord channels where students look for opportunities.
              </p>
            </div>

            <div className="p-3 bg-[#131b19]/50 rounded-xl border border-[#DAF0DD]/10" id="tip-2">
              <span className="font-bold text-[#F7F167] block mb-1">2. Optimize Your LinkedIn Bio</span>
              <p className="text-[#DAF0DD]/70 text-[11px]">
                Add &quot;Deloxe HR Internship Ambassador&quot; to your LinkedIn bio and post your link. Write a short post about helping peers secure practical training.
              </p>
            </div>

            <div className="p-3 bg-[#131b19]/50 rounded-xl border border-[#DAF0DD]/10" id="tip-3">
              <span className="font-bold text-[#F7F167] block mb-1">3. Reach Out Individually</span>
              <p className="text-[#DAF0DD]/70 text-[11px]">
                Identify classmates or graduates looking for placements. Send them the Direct WhatsApp message to introduce them personally.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#DAF0DD]/10 text-center">
            <p className="text-[10px] font-mono text-[#DAF0DD]/50">
              Each successful referral advances students toward career training while securing your reward distribution.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
