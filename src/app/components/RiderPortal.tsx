import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  MapPin, Phone, Package, CheckCircle, Clock, DollarSign,
  Navigation, LogOut, Bell, ChevronRight, Camera, AlertCircle,
  Bike, Star, TrendingUp, Home, ClipboardList, User, X
} from "lucide-react";
import { riderCurrentErrand, riderEarnings, errands } from "./mockData";
import { NotificationPanel, useNotifications, riderNotifications } from "./NotificationPanel";
import { toast, Toaster } from "sonner";

type StatusStep = "Traveling" | "At Store" | "Purchased" | "En Route" | "Delivered";
type NavTab = "home" | "tasks" | "earnings" | "profile";

const STATUS_STEPS: StatusStep[] = ["Traveling", "At Store", "Purchased", "En Route", "Delivered"];

const stepMeta: Record<StatusStep, { icon: any; label: string; action: string }> = {
  Traveling: { icon: Navigation, label: "Traveling to Pickup", action: "Mark Arrived at Store" },
  "At Store": { icon: Package, label: "Arrived at Store", action: "Mark Items Purchased" },
  Purchased: { icon: CheckCircle, label: "Items Purchased", action: "Mark En Route" },
  "En Route": { icon: Bike, label: "En Route to Customer", action: "Mark as Delivered" },
  Delivered: { icon: CheckCircle, label: "Delivered!", action: "Complete" },
};

export default function RiderPortal() {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState<StatusStep>("Traveling");
  const [navTab, setNavTab] = useState<NavTab>("home");
  const [showComplete, setShowComplete] = useState(false);
  const [uploadedReceipt, setUploadedReceipt] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead, dismiss } = useNotifications(riderNotifications);

  const stepIndex = STATUS_STEPS.indexOf(currentStatus);
  const isDelivered = currentStatus === "Delivered";
  const errand = riderCurrentErrand;

  const advanceStatus = () => {
    if (stepIndex < STATUS_STEPS.length - 1) {
      const next = STATUS_STEPS[stepIndex + 1];
      setCurrentStatus(next);
      if (next === "Delivered") {
        setShowComplete(true);
        toast.success("Errand delivered! 🎉", { description: `Earnings of ₱${errand.serviceFee} recorded.` });
      } else {
        toast.success(`Status updated: ${next}`);
      }
    }
  };

  const completedToday = errands.filter(e => e.status === "Delivered" && e.riderId === 1).length;

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F3F4F6" }}>
      <Toaster position="top-center" richColors />
      {/* Phone frame */}
      <div
        className="relative flex flex-col overflow-hidden shadow-2xl"
        style={{
          width: "100%",
          maxWidth: 400,
          height: "100dvh",
          maxHeight: 860,
          borderRadius: 32,
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
        }}
      >
        {/* ── HEADER ── */}
        <div
          className="flex-shrink-0 px-5 pt-10 pb-6 relative"
          style={{ background: "linear-gradient(160deg, #EF4444 0%, #F87171 60%, #FECACA 85%, #FFFFFF 100%)" }}
        >
          {/* Top row: logo + actions */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-sm">
              </div>
              <div>
                <p style={{ color: "#FFFFFF", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em" }}>Company Name</p>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.68rem" }}>On Duty</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative p-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <Bell size={18} className="text-white" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "#FCD34D", color: "#92400E", fontSize: "0.55rem", fontWeight: 800 }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate("/")}
                className="p-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                <LogOut size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Rider Info */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center shadow-md"
              style={{ background: "#DC2626" }}
            >
              <span className="text-white" style={{ fontSize: "1.1rem", fontWeight: 800 }}>AM</span>
            </div>
            <div>
              <p className="text-white" style={{ fontSize: "1rem", fontWeight: 700 }}>Carlos Bautista</p>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.78rem" }}>RDR-001 &bull; ABC-1234</p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.72rem" }}>Active — On Duty</span>
              </div>
            </div>
          </div>

          {/* Notification panel anchored inside phone frame */}
          <div className="absolute top-20 right-4 left-4 z-50">
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              markAllRead={markAllRead}
              markRead={markRead}
              dismiss={dismiss}
              accentColor="#DC2626"
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
            />
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto">

          {/* HOME TAB */}
          {navTab === "home" && (
            <div className="p-4 space-y-4">
              {/* Today's Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Trips",    value: riderEarnings.today.trips.toString(), color: "#DC2626" },
                  { label: "Earned",   value: `₱${riderEarnings.today.total}`,      color: "#1E3A5F" },
                  { label: "Avg Time", value: "28 min",                              color: "#F59E0B" },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                    <p style={{ color: s.color, fontSize: "1rem", fontWeight: 800 }}>{s.value}</p>
                    <p style={{ color: "#9CA3AF", fontSize: "0.68rem" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Current Assignment */}
              {!showComplete ? (
                <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#DC2626" }}>
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-white" />
                      <span className="text-white" style={{ fontSize: "0.82rem", fontWeight: 700 }}>Current Assignment</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white" style={{ color: "#DC2626", fontSize: "0.7rem", fontWeight: 700 }}>{errand.id}</span>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Type badges */}
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full" style={{ background: "#DBEAFE", color: "#1E40AF", fontSize: "0.72rem", fontWeight: 700 }}>{errand.type}</span>
                      <span className="px-2.5 py-1 rounded-full" style={{ background: "#FEF3C7", color: "#92400E", fontSize: "0.72rem", fontWeight: 600 }}>{errand.paymentMode}</span>
                    </div>

                    {/* Customer */}
                    <div className="p-3 rounded-xl" style={{ background: "#F9FAFB" }}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p style={{ color: "#1F2937", fontSize: "0.9rem", fontWeight: 700 }}>{errand.customer}</p>
                          <p style={{ color: "#6B7280", fontSize: "0.78rem" }}>{errand.customerPhone}</p>
                        </div>
                        <a href={`tel:${errand.customerPhone}`} className="p-2 rounded-xl" style={{ background: "#D1FAE5", color: "#065F46" }}>
                          <Phone size={16} />
                        </a>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MapPin size={14} style={{ color: "#9CA3AF", flexShrink: 0, marginTop: 2 }} />
                        <div>
                          <p style={{ color: "#374151", fontSize: "0.8rem" }}>{errand.address}</p>
                          <p style={{ color: "#9CA3AF", fontSize: "0.72rem" }}>📍 {errand.landmark}</p>
                        </div>
                      </div>
                    </div>

                    {/* Fee Breakdown */}
                    <div className="p-3 rounded-xl" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                      <p style={{ color: "#065F46", fontSize: "0.78rem", fontWeight: 700, marginBottom: 6 }}>Fee Breakdown</p>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span style={{ color: "#374151", fontSize: "0.78rem" }}>Base Delivery Fee</span>
                          <span style={{ color: "#1F2937", fontSize: "0.78rem", fontWeight: 600 }}>₱{errand.serviceFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "#374151", fontSize: "0.78rem" }}>Distance</span>
                          <span style={{ color: "#6B7280", fontSize: "0.78rem" }}>{errand.distance}</span>
                        </div>
                        <div className="flex justify-between pt-1" style={{ borderTop: "1px dashed #BBF7D0" }}>
                          <span style={{ color: "#065F46", fontSize: "0.82rem", fontWeight: 700 }}>Your Earnings</span>
                          <span style={{ color: "#065F46", fontSize: "0.82rem", fontWeight: 800 }}>₱{errand.serviceFee}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div>
                      <p style={{ color: "#374151", fontSize: "0.8rem", fontWeight: 600, marginBottom: 8 }}>Progress</p>
                      <div className="space-y-2">
                        {STATUS_STEPS.map((step, i) => {
                          const Icon = stepMeta[step].icon;
                          const done = i < stepIndex;
                          const active = i === stepIndex;
                          return (
                            <div key={step} className="flex items-center gap-3">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: done ? "#DC2626" : active ? "#FEE2E2" : "#F3F4F6",
                                  border: active ? "2px solid #DC2626" : "2px solid transparent",
                                }}
                              >
                                <Icon size={13} style={{ color: done ? "#FFFFFF" : active ? "#DC2626" : "#9CA3AF" }} />
                              </div>
                              <span style={{ color: done ? "#1F2937" : active ? "#DC2626" : "#9CA3AF", fontSize: "0.8rem", fontWeight: active ? 700 : done ? 500 : 400 }}>
                                {stepMeta[step].label}
                              </span>
                              {done && <CheckCircle size={14} style={{ color: "#DC2626", marginLeft: "auto" }} />}
                              {active && (
                                <span className="ml-auto px-2 py-0.5 rounded-full" style={{ background: "#FEE2E2", color: "#DC2626", fontSize: "0.65rem", fontWeight: 700 }}>
                                  CURRENT
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Receipt upload */}
                    {(currentStatus === "At Store" || currentStatus === "Purchased") && (
                      <button
                        onClick={() => { setUploadedReceipt(true); toast.success("Receipt uploaded successfully!"); }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl"
                        style={{
                          background: uploadedReceipt ? "#D1FAE5" : "#FEF3C7",
                          border: `1.5px dashed ${uploadedReceipt ? "#10B981" : "#F59E0B"}`,
                          color: uploadedReceipt ? "#065F46" : "#92400E",
                          fontSize: "0.82rem",
                        }}
                      >
                        <Camera size={16} />
                        {uploadedReceipt ? "✓ Receipt Uploaded" : "Upload Receipt Photo"}
                      </button>
                    )}

                    {/* Action button */}
                    {!isDelivered && (
                      <button
                        onClick={advanceStatus}
                        className="w-full py-3.5 rounded-xl text-white flex items-center justify-center gap-2"
                        style={{ background: "linear-gradient(135deg, #DC2626, #EF4444)", fontSize: "0.9rem", fontWeight: 700 }}
                      >
                        {stepMeta[currentStatus].action} <ChevronRight size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Completion card */
                <div className="rounded-2xl p-6 text-center" style={{ background: "linear-gradient(135deg, #DC2626, #EF4444)" }}>
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={32} style={{ color: "#DC2626" }} />
                  </div>
                  <h3 className="text-white mb-1" style={{ fontSize: "1.1rem" }}>Errand Completed!</h3>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.82rem" }}>Great job, Carlos! Payment collected.</p>
                  <div className="mt-4 p-3 rounded-xl bg-white bg-opacity-20">
                    <p style={{ color: "#FFFFFF", fontSize: "1.3rem", fontWeight: 800 }}>₱{errand.serviceFee}</p>
                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.75rem" }}>Earnings from this trip</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowComplete(false);
                      setCurrentStatus("Traveling");
                      setUploadedReceipt(false);
                      toast.success("Next errand accepted!", { description: "Stand by for the dispatcher's assignment." });
                    }}
                    className="mt-4 w-full py-2.5 rounded-xl bg-white"
                    style={{ color: "#DC2626", fontSize: "0.85rem", fontWeight: 700 }}
                  >
                    Accept Next Errand
                  </button>
                </div>
              )}

              {/* Reminder notice */}
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
                <AlertCircle size={16} style={{ color: "#D97706", flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: "#92400E", fontSize: "0.78rem" }}>
                  <strong>Reminder:</strong> Always get customer consent before taking photos of their property.
                </p>
              </div>
            </div>
          )}

          {/* TASKS TAB */}
          {navTab === "tasks" && (
            <div className="p-4 space-y-4">
              <h3 style={{ color: "#1F2937" }}>Today's Task History</h3>
              {errands.filter(e => e.status === "Delivered").map(e => (
                <div key={e.id} className="bg-white rounded-xl p-4 shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ color: "#DC2626", fontSize: "0.82rem", fontWeight: 700 }}>{e.id}</span>
                        <span className="px-2 py-0.5 rounded" style={{ background: "#D1FAE5", color: "#065F46", fontSize: "0.68rem" }}>Delivered</span>
                      </div>
                      <p style={{ color: "#374151", fontSize: "0.82rem" }}>{e.customer}</p>
                      <p style={{ color: "#9CA3AF", fontSize: "0.72rem" }}>{e.address}</p>
                    </div>
                    <div className="text-right">
                      <p style={{ color: "#DC2626", fontSize: "0.9rem", fontWeight: 700 }}>₱{e.serviceFee}</p>
                      <p style={{ color: "#9CA3AF", fontSize: "0.68rem" }}>{e.type}</p>
                    </div>
                  </div>
                  <p style={{ color: "#9CA3AF", fontSize: "0.72rem" }}>{e.createdAt} → {e.updatedAt}</p>
                </div>
              ))}
            </div>
          )}

          {/* EARNINGS TAB */}
          {navTab === "earnings" && (
            <div className="p-4 space-y-4">
              <h3 style={{ color: "#1F2937" }}>My Earnings</h3>
              {[
                { period: "Today",      data: riderEarnings.today },
                { period: "This Week",  data: riderEarnings.week },
                { period: "This Month", data: riderEarnings.month },
              ].map(({ period, data }) => (
                <div key={period} className="rounded-2xl p-5 shadow-sm" style={{ border: "1px solid #E5E7EB", background: "#FFFFFF" }}>
                  <p style={{ color: "#6B7280", fontSize: "0.8rem", marginBottom: 8 }}>{period}</p>
                  <div className="flex items-center justify-between mb-3">
                    <p style={{ color: "#1F2937", fontSize: "1.8rem", fontWeight: 800 }}>₱{data.total.toLocaleString()}</p>
                    <span style={{ color: "#DC2626", fontSize: "0.8rem", fontWeight: 600 }}>{data.trips} trips</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span style={{ color: "#6B7280", fontSize: "0.78rem" }}>Base Delivery Fees</span>
                      <span style={{ color: "#1F2937", fontSize: "0.78rem", fontWeight: 600 }}>₱{data.baseFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#6B7280", fontSize: "0.78rem" }}>Commissions</span>
                      <span style={{ color: "#1F2937", fontSize: "0.78rem", fontWeight: 600 }}>₱{data.commission.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2" style={{ borderTop: "1px solid #F3F4F6" }}>
                      <span style={{ color: "#DC2626", fontSize: "0.82rem", fontWeight: 700 }}>Total</span>
                      <span style={{ color: "#DC2626", fontSize: "0.82rem", fontWeight: 800 }}>₱{data.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROFILE TAB */}
          {navTab === "profile" && (
            <div className="p-4 space-y-4">
              <div className="rounded-2xl p-5 text-center" style={{ background: "linear-gradient(160deg, #EF4444, #FECACA)" }}>
                <div
                  className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center mx-auto mb-3 shadow-md"
                  style={{ background: "#DC2626" }}
                >
                  <span className="text-white" style={{ fontSize: "1.5rem", fontWeight: 800 }}>AM</span>
                </div>
                <p className="text-white" style={{ fontSize: "1.1rem", fontWeight: 700 }}>Al-Dhen Musali</p>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.8rem" }}>Rider ID: RDR-001</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} fill={s <= 4 ? "#FCD34D" : "transparent"} style={{ color: "#FCD34D" }} />
                  ))}
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.78rem", marginLeft: 4 }}>4.8</span>
                </div>
              </div>

              {[
                { label: "Phone Number",           value: "09391234567" },
                { label: "Vehicle",                value: "Motorcycle — ABC-1234" },
                { label: "Email",                  value: "ad.musali@company.ph" },
                { label: "Status",              value: "Active" },
                { label: "Total Trips (All Time)", value: "248" },
                { label: "Join Date",           value: "January 15, 2024" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 px-1" style={{ borderBottom: "1px solid #F3F4F6" }}>
                  <span style={{ color: "#6B7280", fontSize: "0.82rem" }}>{item.label}</span>
                  <span style={{ color: "#1F2937", fontSize: "0.82rem", fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}

              <button
                onClick={() => navigate("/")}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
                style={{ background: "#FEE2E2", color: "#DC2626", fontSize: "0.85rem", fontWeight: 600 }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}

        </div>

        {/* ── BOTTOM NAV ── */}
        <div
          className="flex-shrink-0 flex items-center justify-around px-4 py-3"
          style={{ background: "#FFFFFF", borderTop: "1px solid #F3F4F6", boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}
        >
          {[
            { id: "home"     as NavTab, icon: Home,         label: "Home" },
            { id: "tasks"    as NavTab, icon: ClipboardList, label: "Tasks" },
            { id: "earnings" as NavTab, icon: DollarSign,    label: "Earnings" },
            { id: "profile"  as NavTab, icon: User,          label: "Profile" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setNavTab(id)}
              className="flex flex-col items-center gap-1 px-3 py-1"
              style={{ color: navTab === id ? "#DC2626" : "#9CA3AF" }}
            >
              <Icon size={20} />
              <span style={{ fontSize: "0.65rem", fontWeight: navTab === id ? 700 : 400 }}>{label}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
