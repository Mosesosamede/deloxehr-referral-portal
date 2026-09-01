"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Grid, 
  DollarSign, 
  CreditCard, 
  Bell, 
  Settings, 
  LogOut,
  Share2
} from "lucide-react";

import { usePartner } from "@/hooks/usePartner";
import LoadingScreen from "@/components/LoadingScreen";
import LoginGate from "@/components/LoginGate";
import OnboardingWizard from "@/components/OnboardingWizard";
import DashboardTab from "@/components/DashboardTab";
import CommissionsTab from "@/components/CommissionsTab";
import PayoutsTab from "@/components/PayoutsTab";
import NotificationsTab from "@/components/NotificationsTab";
import SettingsTab from "@/components/SettingsTab";
import ReferralMaterialsTab from "@/components/ReferralMaterialsTab";
import DashboardTour from "@/components/DashboardTour";

export default function Home() {
  const {
    user,
    partner,
    stats,
    commissions,
    payouts,
    notifications,
    loading,
    authChecking,
    dbLoading,
    onboardingStep,
    onboardingError,
    existingAccountError,
    submittingOnboarding,
    isCopied,
    authEmail,
    authPassword,
    authMethod,
    authEmailMode,
    authEmailError,
    showPassword,
    currentTime,
    activeTab,
    obForm,
    editForm,
    editLoading,
    editError,
    editSuccess,
    currencySymbol,
    setAuthMethod,
    setAuthEmailMode,
    setAuthEmail,
    setAuthPassword,
    setShowPassword,
    setAuthEmailError,
    setObForm,
    setEditForm,
    setOnboardingStep,
    setOnboardingError,
    setActiveTab,
    handleLogin,
    handleEmailAuth,
    handleLogout,
    handleOnboardingSubmit,
    handleProfileUpdate,
    handleToggleRead,
    handleCopy
  } = usePartner();

  // Loading indicator for authentication layer checkup
  if (authChecking || loading) {
    return <LoadingScreen />;
  }

  // Pre-authentication Welcome Screen & Secure Gate
  if (!user) {
    return (
      <LoginGate
        currentTime={currentTime}
        authMethod={authMethod}
        authEmailMode={authEmailMode}
        authEmail={authEmail}
        authPassword={authPassword}
        showPassword={showPassword}
        authEmailError={authEmailError}
        loading={loading}
        setAuthMethod={setAuthMethod}
        setAuthEmailMode={setAuthEmailMode}
        setAuthEmail={setAuthEmail}
        setAuthPassword={setAuthPassword}
        setShowPassword={setShowPassword}
        setAuthEmailError={setAuthEmailError}
        handleLogin={handleLogin}
        handleEmailAuth={handleEmailAuth}
      />
    );
  }

  // Partner Multi-step Onboarding (triggers if no profile is in database)
  if (!partner) {
    return (
      <OnboardingWizard
        onboardingStep={onboardingStep}
        onboardingError={onboardingError}
        existingAccountError={existingAccountError}
        submittingOnboarding={submittingOnboarding}
        obForm={obForm}
        currentTime={currentTime}
        setObForm={setObForm}
        setOnboardingStep={setOnboardingStep}
        setOnboardingError={setOnboardingError}
        handleLogout={handleLogout}
        handleOnboardingSubmit={handleOnboardingSubmit}
      />
    );
  }

  // Active Partner Dashboard Interface
  return (
    <div id="dashboard-root" className="min-h-screen bg-[#1A2421] text-[#DAF0DD] flex flex-col justify-between font-sans selection:bg-[#00CC88]/20 selection:text-[#00CC88]">
      
      {/* Real-time System Rail */}
      <div className="w-full bg-[#131b19] border-b border-[#DAF0DD]/10 py-2.5 px-6 flex justify-between items-center text-[10px] font-mono text-[#DAF0DD]/60 z-10" id="live-system-rail">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00CC88] animate-pulse"></span>
            <span>DELOXE PARTNER PROTOCOL: SECURE & ACTIVE</span>
          </div>
          <span className="text-[#DAF0DD]/20">|</span>
          <div>REFERRAL INCENTIVE ID: <span className="text-[#DAF0DD] font-bold">{partner.partnerDisplayId || ("DELXp" + partner.partnerId.slice(0, 4).toUpperCase())}</span></div>
          <span className="text-[#DAF0DD]/20">|</span>
          <div className="hidden sm:inline">REWARD_RATE: <span className="text-[#F7F167] font-bold">{currencySymbol}{partner.rewardRate.toLocaleString()} / milestone</span></div>
        </div>
        
        {/* Dynamic ticking clock */}
        <div className="flex items-center gap-2">
          <span>{currentTime || "UTC CLOCK"}</span>
        </div>
      </div>

      {/* Header Panel */}
      <header className="bg-[#23312C]/40 border-b border-[#DAF0DD]/15 sticky top-0 z-30 backdrop-blur-xl" id="portal-header">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#131b19] border border-[#00CC88]/20 rounded-lg flex items-center justify-center overflow-hidden shadow-lg shadow-[#00CC88]/5">
              <img src="https://i.ibb.co/pjxqNW0p/favicon.png" alt="Deloxe HR Logo" className="w-7 h-7 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-base tracking-tight text-white leading-none">
                DELOXE HR
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#DAF0DD]/50 mt-1">REFERRAL INCENTIVE HUB v1.2</span>
            </div>
          </div>

          {/* Nav / View Toggle */}
          <nav className="hidden md:flex items-center gap-1 bg-[#131b19] border border-[#DAF0DD]/15 rounded-xl p-1" id="desktop-nav">
            {[
              { id: "dashboard", label: "Overview", icon: Grid },
              { id: "commissions", label: "Commissions", icon: DollarSign },
              { id: "payouts", label: "Payouts Ledger", icon: CreditCard },
              { id: "materials", label: "Promo Materials", icon: Share2 },
              { id: "notifications", label: "Alerts", icon: Bell, count: notifications.filter(n => !n.read).length },
              { id: "settings", label: "Settings", icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#23312C] text-[#00CC88] border border-[#DAF0DD]/15 shadow-md shadow-[#00CC88]/5"
                      : "text-[#DAF0DD]/60 hover:text-[#DAF0DD]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Widget */}
          <div className="flex items-center gap-4" id="header-user-widget">
            <div className="flex items-center gap-3 pl-3 border-l border-[#DAF0DD]/15">
              <div className="flex flex-col items-end text-right hidden sm:flex">
                <span className="text-xs font-bold text-[#DAF0DD] leading-none">{partner.fullName}</span>
                <span className="text-[9px] font-mono text-[#DAF0DD]/50 mt-1 uppercase tracking-wider">
                  {partner.partnerType === "corporate" ? "Corporate Entity" : "Individual Referral"}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#131b19] border border-[#DAF0DD]/15 flex items-center justify-center text-xs font-mono font-bold text-[#DAF0DD]/80 uppercase">
                {partner.fullName[0]}
              </div>
              <button
                id="logout-btn"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-[#F7F069] hover:bg-[#F7F069]/10 transition-all cursor-pointer flex items-center gap-1.5"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold hidden md:inline">EXIT</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 pb-32 md:pb-12 flex-grow" id="main-content">
        
        {/* Dashboard Title & Quick Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8" id="title-status-section">
          <div>
            <h1 className="text-xl font-display font-extrabold text-white tracking-tight">
              {activeTab === "dashboard" && "Ambassador Central"}
              {activeTab === "commissions" && "Conversion Records"}
              {activeTab === "payouts" && "Historic Distribution Ledgers"}
              {activeTab === "materials" && "Referral Message Center"}
              {activeTab === "notifications" && "Operational Alerts"}
              {activeTab === "settings" && "Profile Configuration"}
            </h1>
            <p className="text-[#DAF0DD]/60 text-xs mt-1 font-mono">
              STATUS: <span className="text-[#00CC88] font-bold uppercase">{partner.status}</span>
              <span className="mx-2 text-[#DAF0DD]/20">|</span>
              CODE: <span className="text-[#F7F167] font-bold">{partner.referralCode}</span>
            </p>
          </div>
        </div>

        {/* Dynamic Views Rendering with Animation Transitions */}
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <DashboardTab
              partner={partner}
              stats={stats}
              commissions={commissions}
              dbLoading={dbLoading}
              currencySymbol={currencySymbol}
              isCopied={isCopied}
              handleCopy={handleCopy}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "commissions" && (
            <CommissionsTab
              commissions={commissions}
              dbLoading={dbLoading}
              currencySymbol={currencySymbol}
            />
          )}

          {activeTab === "payouts" && (
            <PayoutsTab
              payouts={payouts}
              dbLoading={dbLoading}
              currencySymbol={currencySymbol}
            />
          )}

          {activeTab === "notifications" && (
            <NotificationsTab
              notifications={notifications}
              dbLoading={dbLoading}
              handleToggleRead={handleToggleRead}
            />
          )}

          {activeTab === "settings" && (
            <SettingsTab
              partner={partner}
              editForm={editForm}
              setEditForm={setEditForm}
              editLoading={editLoading}
              editError={editError}
              editSuccess={editSuccess}
              currencySymbol={currencySymbol}
              handleProfileUpdate={handleProfileUpdate}
            />
          )}

          {activeTab === "materials" && (
            <ReferralMaterialsTab partner={partner} />
          )}
        </AnimatePresence>

      </main>

      {/* Interactive Onboarding Site Tour */}
      <DashboardTour
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        partnerCode={partner.referralCode}
      />

      {/* FOOTER */}
      <footer className="bg-[#131b19] text-[#DAF0DD]/40 py-6 text-center text-xs font-mono border-t border-[#DAF0DD]/10 mt-16 z-10 pb-28 md:pb-6" id="portal-footer">
        <div className="max-w-7xl w-full mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© {new Date().getFullYear()} Deloxe Inc. Unified Referral Incentive Security Registry.</span>
          <span>Secured via Deloxe Private Ledger & Cryptographic Protocol.</span>
        </div>
      </footer>

      {/* Floating Instagram/iOS-Style Bottom Navigation Capsule */}
      <div className="md:hidden fixed bottom-5 left-4 right-4 z-50 bg-[#131b19]/90 border border-[#DAF0DD]/15 rounded-[22px] px-2.5 py-1.5 flex justify-around items-center shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl" id="ios-bottom-nav-bar">
        {[
          { id: "dashboard", label: "Overview", icon: Grid },
          { id: "commissions", label: "Commissions", icon: DollarSign },
          { id: "payouts", label: "Payouts", icon: CreditCard },
          { id: "materials", label: "Promo", icon: Share2 },
          { id: "notifications", label: "Alerts", icon: Bell, count: notifications.filter(n => !n.read).length },
          { id: "settings", label: "Settings", icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="relative py-2.5 px-3 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all cursor-pointer active:scale-95"
              style={{ minWidth: "48px", minHeight: "48px" }}
              id={`ios-nav-${tab.id}`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-[21px] h-[21px] transition-transform duration-200 ${
                  isActive ? "text-[#00CC88] scale-110" : "text-[#DAF0DD]/50"
                }`} />
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white border border-[#131b19] animate-pulse">
                    {tab.count}
                  </span>
                )}
              </div>
              
              <span className={`text-[9px] tracking-tight transition-colors ${
                isActive ? "text-[#00CC88] font-bold" : "text-[#DAF0DD]/40"
              }`}>
                {tab.label}
              </span>

              {/* Instagram Active indicator line */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 w-3 h-[2px] bg-[#00CC88] rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
