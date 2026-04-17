import React, { useState, useEffect, useRef } from "react";
import { Bell, X, Check, CheckCheck, AlertTriangle, Info, Bike, Package, DollarSign, User } from "lucide-react";

export interface Notification {
  id: number;
  type: "alert" | "info" | "success" | "warning";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface Props {
  notifications: Notification[];
  accentColor?: string;
  side?: "right" | "left";
}

const typeConfig = {
  alert:   { icon: AlertTriangle, bg: "#FEE2E2", text: "#991B1B",  dot: "#EF4444"  },
  warning: { icon: AlertTriangle, bg: "#FEF3C7", text: "#92400E",  dot: "#F59E0B"  },
  info:    { icon: Info,          bg: "#DBEAFE", text: "#1E40AF",  dot: "#3B82F6"  },
  success: { icon: Check,         bg: "#D1FAE5", text: "#065F46",  dot: "#10B981"  },
};

export function useNotifications(initial: Notification[]) {
  const [notifications, setNotifications] = useState(initial);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const markRead = (id: number) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const dismiss = (id: number) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  return { notifications, unreadCount, markAllRead, markRead, dismiss };
}

export function NotificationPanel({
  notifications,
  unreadCount,
  markAllRead,
  markRead,
  dismiss,
  accentColor = "#1E3A5F",
  open,
  onClose,
}: {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: number) => void;
  dismiss: (id: number) => void;
  accentColor?: string;
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute top-16 right-4 z-50 flex flex-col shadow-2xl rounded-2xl overflow-hidden"
      style={{
        width: 360,
        maxHeight: 520,
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{ background: accentColor, borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-white" />
          <span className="text-white" style={{ fontSize: "0.95rem", fontWeight: 700 }}>
            Notifications
          </span>
          {unreadCount > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-white"
              style={{ background: "#EF4444", fontSize: "0.68rem", fontWeight: 700 }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.9)", fontSize: "0.72rem" }}
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.7)" }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#F3F4F6" }}>
              <Bell size={24} style={{ color: "#D1D5DB" }} />
            </div>
            <p style={{ color: "#9CA3AF", fontSize: "0.85rem" }}>No notifications</p>
          </div>
        ) : (
          notifications.map((n, i) => {
            const cfg = typeConfig[n.type];
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                className="flex items-start gap-3 px-4 py-3.5 transition-colors cursor-pointer"
                style={{
                  background: n.read ? "#FFFFFF" : "#F8FAFF",
                  borderBottom: i < notifications.length - 1 ? "1px solid #F3F4F6" : "none",
                }}
                onClick={() => markRead(n.id)}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: cfg.bg }}
                >
                  <Icon size={16} style={{ color: cfg.text }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p style={{ color: "#1F2937", fontSize: "0.82rem", fontWeight: n.read ? 500 : 700 }}>
                      {n.title}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                        style={{ color: "#D1D5DB" }}
                        className="hover:text-gray-400 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-0.5" style={{ color: "#6B7280", fontSize: "0.78rem", lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                  <p className="mt-1" style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>{n.time}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div
          className="flex-shrink-0 px-5 py-3 text-center"
          style={{ borderTop: "1px solid #F3F4F6", background: "#FAFAFA" }}
        >
          <span style={{ color: accentColor, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
            View all notifications
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Per-portal default notifications ────────────────────────────────────────

export const ownerNotifications: Notification[] = [
  { id: 1,  type: "alert",   title: "High-Value Transaction",      message: "SGO-004 — Ben Navarro — ₱2,500 Bills Payment. Awaiting dispatcher verification before dispatch.", time: "Just now", read: false },
  { id: 2,  type: "warning", title: "Unassigned Errand — 12 mins", message: "SGO-001 has been waiting for 12 minutes with no rider assigned. Review dispatch queue.", time: "12 min ago", read: false },
  { id: 3,  type: "info",    title: "Weekly Revenue Milestone",     message: "Today's revenue has surpassed ₱5,000. On track to exceed weekly target by 18%.", time: "1 hr ago", read: false },
  { id: 4,  type: "success", title: "Rider Performance Update",     message: "Mario Santos completed 8 trips today — highest count in the fleet. Eligible for incentive bonus.", time: "2 hrs ago", read: true },
  { id: 5,  type: "warning", title: "Rider Offline Alert",          message: "Pedro Reyes & Roberto Mendoza are offline and unavailable. 2 riders short during peak hours.", time: "3 hrs ago", read: true },
  { id: 6,  type: "success", title: "Settlement Report Ready",      message: "End-of-day settlement for March 22 has been compiled. Sugo Share: ₱1,240. Ready for review.", time: "Yesterday", read: true },
];

export const dispatcherNotifications: Notification[] = [
  { id: 1,  type: "alert",   title: "New Errand — Immediate Dispatch",  message: "SGO-001 Pabili request from Liza Reyes is pending. No rider assigned. Please dispatch now.", time: "Just now", read: false },
  { id: 2,  type: "alert",   title: "High-Value Verification Required", message: "SGO-004 — ₱2,500 Bills Payment via GCash. Verify payment arrangement before assigning rider.", time: "3 min ago", read: false },
  { id: 3,  type: "warning", title: "Errand Threshold Exceeded",        message: "SGO-001 has exceeded the 15-minute wait threshold. Owner has been notified automatically.", time: "10 min ago", read: false },
  { id: 4,  type: "info",    title: "Rider Status Change",              message: "Al-Dhen Musali is now Available after completing SGO-002 (Padala — Brgy Buenaflor).", time: "25 min ago", read: false },
  { id: 5,  type: "success", title: "Delivery Confirmed",               message: "SGO-006 delivered by Jose Dela Cruz. Customer confirmed receipt. Service fee: ₱40.", time: "45 min ago", read: true },
  { id: 6,  type: "info",    title: "New Customer Registration",        message: "Ben Navarro registered as a new customer. Profile added to customer records.", time: "1 hr ago", read: true },
];

export const riderNotifications: Notification[] = [
  { id: 1,  type: "alert",   title: "New Assignment",           message: "SGO-002 Padala has been assigned to you. Customer: Mark Torres — Brgy Buenaflor. Accept now.", time: "Just now", read: false },
  { id: 2,  type: "success", title: "Payment Verified",         message: "High-value payment for SGO-009 has been verified by dispatcher. You may proceed to purchase.", time: "5 min ago", read: false },
  { id: 3,  type: "info",    title: "Earnings Update",          message: "You've earned ₱285 today from 5 completed trips. Keep it up!", time: "1 hr ago", read: true },
  { id: 4,  type: "warning", title: "Low Network Area Ahead",   message: "Your next delivery (SGO-002) is in an area with intermittent signal. Waybill cached locally.", time: "1 hr ago", read: true },
  { id: 5,  type: "success", title: "Trip Bonus Unlocked",      message: "You've completed 5 trips today! You've unlocked the daily consistency bonus of ₱50.", time: "2 hrs ago", read: true },
];

export const customerNotifications: Notification[] = [
  { id: 1,  type: "info",    title: "Rider Dispatched",         message: "Mario Santos (DEF-5678) has been assigned to your SGO-003 Pabili order. He is on his way.", time: "Just now", read: false },
  { id: 2,  type: "success", title: "Items Purchased",          message: "Your items have been purchased from the store. Mario is now en route to your location.", time: "20 min ago", read: false },
  { id: 3,  type: "info",    title: "Order Received",           message: "Your Pabili order SGO-003 has been received and is being reviewed by our dispatcher.", time: "45 min ago", read: true },
  { id: 4,  type: "success", title: "Previous Order Delivered", message: "SGO-006 Padala was successfully delivered. Thank you for choosing Sugo!", time: "2 hrs ago", read: true },
  { id: 5,  type: "info",    title: "Welcome Offer",            message: "Your first Pabili order gets FREE delivery! Promo valid until March 31, 2026.", time: "Yesterday", read: true },
];
