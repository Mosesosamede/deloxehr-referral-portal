"use client";

import React from "react";
import { motion } from "motion/react";
import { Bell } from "lucide-react";
import { formatDateTime } from "@/lib/date-utils";
import { NotificationDocument } from "@/lib/db-helpers";

interface NotificationsTabProps {
  notifications: NotificationDocument[];
  dbLoading: boolean;
  handleToggleRead: (notifId: string, currentRead: boolean) => Promise<void>;
}

export default function NotificationsTab({
  notifications,
  dbLoading,
  handleToggleRead
}: NotificationsTabProps) {
  return (
    <motion.div 
      key="notifications"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-4"
      id="notifications-tab"
    >
      <div className="bg-[#23312C]/40 border border-[#DAF0DD]/15 rounded-2xl p-5 flex justify-between items-center bg-[#23312C]/20">
        <div>
          <h3 className="font-display font-bold text-base text-[#DAF0DD]">Operational Notices</h3>
          <p className="text-xs text-[#DAF0DD]/60 mt-1">Read alerts about commission payouts and conversion audits</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {dbLoading ? (
          <div className="p-8 text-center text-[#DAF0DD]/50 font-mono text-xs font-semibold">Querying alerts registry...</div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center text-[#DAF0DD]/50 text-xs leading-relaxed border border-[#DAF0DD]/10 bg-[#131b19]/20 rounded-2xl font-mono">
            Notification tray is empty.<br />
            <span className="text-[10px] mt-1 text-[#DAF0DD]/30 block">Status updates from administrative audits appear here.</span>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.notificationId} 
              className={`p-5 rounded-2xl border transition-all flex justify-between items-start gap-4 ${
                notif.read 
                  ? "bg-[#131b19]/20 border-[#DAF0DD]/10 opacity-65" 
                  : "bg-[#23312C]/50 border border-[#DAF0DD]/15 shadow-md"
              }`}
              id={`notification-box-${notif.notificationId}`}
            >
              <div className="flex gap-3">
                <div className={`p-2 rounded-lg mt-0.5 ${notif.read ? "bg-[#131b19] text-[#DAF0DD]/40" : "bg-[#00CC88]/10 text-[#00CC88]"}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold text-sm ${notif.read ? "text-[#DAF0DD]/60" : "text-white"}`}>{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00CC88]"></span>
                    )}
                  </div>
                  <p className="text-xs text-[#DAF0DD]/70 mt-1 leading-relaxed">{notif.message}</p>
                  <span className="text-[9px] font-mono text-[#DAF0DD]/40 mt-2 block">{formatDateTime(notif.createdAt)}</span>
                </div>
              </div>

              <button
                onClick={() => handleToggleRead(notif.notificationId, notif.read)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-all cursor-pointer ${
                  notif.read 
                    ? "bg-[#131b19] border-[#DAF0DD]/10 text-[#DAF0DD]/50 hover:text-[#DAF0DD]" 
                    : "bg-[#00CC88]/10 border-[#00CC88]/30 text-[#00CC88] hover:bg-[#00CC88]/20"
                }`}
              >
                {notif.read ? "Mark Unread" : "Mark Read"}
              </button>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
