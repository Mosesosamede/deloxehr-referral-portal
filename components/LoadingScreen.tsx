"use client";

import React from "react";

export default function LoadingScreen() {
  return (
    <div id="loading-screen" className="min-h-screen bg-[#1A2421] flex flex-col justify-center items-center">
      <div className="relative" id="loading-spinner-container">
        <div className="w-16 h-16 border-4 border-[#00CC88]/10 border-t-[#00CC88] rounded-full animate-spin" id="loading-spinner"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center overflow-hidden" id="loading-logo">
          <img src="https://i.ibb.co/pjxqNW0p/favicon.png" alt="Deloxe HR" className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
        </div>
      </div>
      <p className="mt-6 text-[#DAF0DD]/60 font-mono text-xs tracking-wider uppercase animate-pulse" id="loading-status-text">
        Initializing Security Layers...
      </p>
    </div>
  );
}
