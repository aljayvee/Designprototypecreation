import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  ClipboardList, Bike, Users, Bell, LogOut, Menu, Search, Plus,
  MapPin, Phone, Clock, CheckCircle, AlertTriangle, Package,
  ChevronRight, X, FileText, Zap, Navigation, RefreshCw, Save, Printer
} from "lucide-react";
import { riders, errands, customers, Errand, ErrandStatus } from "./mockData";
import { NotificationPanel, useNotifications, dispatcherNotifications } from "./NotificationPanel";
import { toast, Toaster } from "sonner";

const NAVY = "#1E3A5F";
const NAVY_DARK = "#162D4A";

type Section = "queue" | "active" | "riders" | "customers" | "history";

const statusConfig: Record<string, { bg: string; text: string }> = {
  Pending: { bg: "#FEF3C7", text: "#92400E" },
  Assigned: { bg: "#DBEAFE", text: "#1E40AF" },
  Traveling: { bg: "#EDE9FE", text: "#5B21B6" },
  "At Store": { bg: "#FEF3C7", text: "#B45309" },
  Purchased: { bg: "#DBEAFE", text: "#1D4ED8" },
  "En Route": { bg: "#D1FAE5", text: "#065F46" },
  Delivered: { bg: "#D1FAE5", text: "#065F46" },
  Cancelled: { bg: "#FEE2E2", text: "#991B1B" },
};

const riderStatusDot: Record<string, string> = {
  Available: "#10B981",
  "On Errand": "#3B82F6",
  Offline: "#9CA3AF",
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || { bg: "#F3F4F6", text: "#374151" };
  return (
    <span className="px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: cfg.bg, color: cfg.text, fontSize: "0.72rem", fontWeight: 600 }}>
      {status}
    </span>
  );
}

// ─── NEW ERRAND MODAL ────────────────────────────────────────────────────────
function NewErrandModal({ onClose }: { onClose: () => void }) {
  const [errandType, setErrandType] = useState("Pabili");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [payment, setPayment] = useState("Cash on Delivery");
  const [amount, setAmount] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!customerName.trim() || !customerPhone.trim() || !address.trim()) {
      setError("Customer Name, Phone, and Address are required.");
      return;
    }
    setSaved(true);
    toast.success("New errand created!", { description: `${errandType} for ${customerName} — queued for dispatch.` });
    setTimeout(() => { onClose(); }, 1200);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5" style={{ background: NAVY }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <ClipboardList size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white" style={{ fontSize: "0.95rem", fontWeight: 700 }}>Create New Errand</p>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.72rem" }}>Fill in the errand details below</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.7)" }}><X size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-96 overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
              <AlertTriangle size={14} style={{ color: "#EF4444" }} />
              <p style={{ color: "#DC2626", fontSize: "0.8rem" }}>{error}</p>
            </div>
          )}
          {/* Type */}
          <div>
            <label className="block mb-1.5" style={{ color: "#374151", fontSize: "0.82rem" }}>Errand Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Pabili",        bg: "#DBEAFE", text: "#1E40AF" },
                { id: "Padala",        bg: "#D1FAE5", text: "#065F46" },
                { id: "Bills Payment", bg: "#FEF3C7", text: "#92400E" },
              ].map(t => (
                <button key={t.id} type="button" onClick={() => setErrandType(t.id)}
                  className="py-2 rounded-xl transition-all"
                  style={{ background: errandType === t.id ? t.bg : "#F9FAFB", border: `1.5px solid ${errandType === t.id ? t.text : "#E5E7EB"}`, color: errandType === t.id ? t.text : "#9CA3AF", fontSize: "0.78rem", fontWeight: errandType === t.id ? 700 : 400 }}>
                  {t.id}
                </button>
              ))}
            </div>
          </div>
          {/* Customer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Customer Name *</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Full name"
                className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
            </div>
            <div>
              <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Phone *</label>
              <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="09XXXXXXXXX"
                className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
            </div>
          </div>
          {/* Address */}
          <div>
            <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Delivery Address *</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, Barangay, City"
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
          </div>
          <div>
            <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Landmark</label>
            <input value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="e.g. Near SM, beside church"
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
          </div>
          {/* Amount & Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Est. Amount (₱)</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
            </div>
            <div>
              <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Payment Mode</label>
              <select value={payment} onChange={e => setPayment(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }}>
                <option>Cash on Delivery</option>
                <option>GCash</option>
                <option>Bank Transfer</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl" style={{ border: "1.5px solid #E5E7EB", color: "#374151", fontSize: "0.85rem" }}>Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2"
            style={{ background: saved ? "#10B981" : NAVY, fontSize: "0.85rem", fontWeight: 600 }}>
            {saved ? <><CheckCircle size={16} /> Created!</> : <><Zap size={16} /> Create Errand</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ADD CUSTOMER MODAL ───────────────────────────────────────────────────────
function AddCustomerModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: any) => void }) {
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [address, setAddress]   = useState("");
  const [landmark, setLandmark] = useState("");
  const [error, setError]       = useState("");
  const [saved, setSaved]       = useState(false);

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) { setError("Name and Phone are required."); return; }
    onAdd({ id: Date.now(), name, phone, address, landmark, totalErrands: 0, lastErrand: "—", status: "New" });
    setSaved(true);
    toast.success("Customer added successfully!");
    setTimeout(() => onClose(), 1200);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5" style={{ background: NAVY }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Users size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white" style={{ fontSize: "0.95rem", fontWeight: 700 }}>Add Customer</p>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.72rem" }}>Register a new customer record</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.7)" }}><X size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
              <AlertTriangle size={14} style={{ color: "#EF4444" }} />
              <p style={{ color: "#DC2626", fontSize: "0.8rem" }}>{error}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Full Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Juan dela Cruz"
                className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
            </div>
            <div>
              <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Phone *</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="09XXXXXXXXX"
                className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
            </div>
          </div>
          <div>
            <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, Barangay, City"
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
          </div>
          <div>
            <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Landmark</label>
            <input value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="e.g. Near SM"
              className="w-full px-3 py-2.5 rounded-xl outline-none"
              style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl" style={{ border: "1.5px solid #E5E7EB", color: "#374151", fontSize: "0.85rem" }}>Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2"
            style={{ background: saved ? "#10B981" : NAVY, fontSize: "0.85rem", fontWeight: 600 }}>
            {saved ? <><CheckCircle size={16} /> Added!</> : <><Save size={16} /> Save Customer</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── WAYBILL MODAL ────────────────────────────────────────────────────────────
function WaybillModal({ customer, onClose }: { customer: typeof customers[0]; onClose: () => void }) {
  const customerErrands = errands.filter(e => e.customer === customer.name);
  const lastErrand = customerErrands[0];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5" style={{ background: NAVY }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white" style={{ fontSize: "0.95rem", fontWeight: 700 }}>Customer Waybill</p>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.72rem" }}>{customer.name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.7)" }}><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Customer Info */}
          <div className="p-4 rounded-xl" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
            <p style={{ color: "#6B7280", fontSize: "0.72rem", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer Details</p>
            <p style={{ color: "#1F2937", fontSize: "0.9rem", fontWeight: 700 }}>{customer.name}</p>
            <p style={{ color: "#374151", fontSize: "0.82rem" }}>{customer.phone}</p>
            <p style={{ color: "#374151", fontSize: "0.82rem", marginTop: 4 }}>{customer.address}</p>
            <p style={{ color: "#6B7280", fontSize: "0.75rem" }}>📍 {customer.landmark}</p>
          </div>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl text-center" style={{ background: "#EFF6FF" }}>
              <p style={{ color: NAVY, fontSize: "1.3rem", fontWeight: 800 }}>{customer.totalErrands}</p>
              <p style={{ color: "#6B7280", fontSize: "0.72rem" }}>Total Errands</p>
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: customer.status === "VIP" ? "#FEF3C7" : customer.status === "New" ? "#D1FAE5" : "#F3F4F6" }}>
              <p style={{ color: customer.status === "VIP" ? "#92400E" : customer.status === "New" ? "#065F46" : "#374151", fontSize: "1.1rem", fontWeight: 800 }}>{customer.status}</p>
              <p style={{ color: "#6B7280", fontSize: "0.72rem" }}>Customer Type</p>
            </div>
          </div>
          {lastErrand && (
            <div className="p-3 rounded-xl" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
              <p style={{ color: "#065F46", fontSize: "0.72rem", fontWeight: 600, marginBottom: 4 }}>LAST ERRAND</p>
              <p style={{ color: "#1F2937", fontSize: "0.82rem", fontWeight: 600 }}>{lastErrand.id} — {lastErrand.type}</p>
              <p style={{ color: "#6B7280", fontSize: "0.75rem" }}>{lastErrand.address}</p>
              <p style={{ color: "#374151", fontSize: "0.78rem" }}>₱{lastErrand.amount.toLocaleString()} · {lastErrand.paymentMode}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => { window.print(); toast.success("Waybill sent to printer!"); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white"
              style={{ background: NAVY, fontSize: "0.82rem" }}>
              <Printer size={14} /> Print Waybill
            </button>
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl"
              style={{ border: "1.5px solid #E5E7EB", color: "#374151", fontSize: "0.82rem" }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DISPATCH QUEUE SECTION ─────────────────────────────────────────────────
function DispatchQueueSection() {
  const [assignModal, setAssignModal] = useState<Errand | null>(null);
  const [selectedRider, setSelectedRider] = useState<number | null>(null);
  const [assigned, setAssigned] = useState<Record<string, string>>({});
  const [showNewErrand, setShowNewErrand] = useState(false);

  const pendingErrands = errands.filter(e => e.status === "Pending");
  const availableRiders = riders.filter(r => r.status === "Available");

  const handleAssign = () => {
    if (!selectedRider || !assignModal) return;
    const rider = riders.find(r => r.id === selectedRider);
    if (rider) {
      setAssigned(prev => ({ ...prev, [assignModal.id]: rider.name }));
      toast.success(`${assignModal.id} dispatched to ${rider.name}!`);
    }
    setAssignModal(null);
    setSelectedRider(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending Errands", value: pendingErrands.length, color: "#F59E0B", icon: Clock },
          { label: "Available Riders", value: availableRiders.length, color: "#10B981", icon: Bike },
          { label: "High-Value Alerts", value: 1, color: "#EF4444", icon: AlertTriangle },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ color: "#6B7280", fontSize: "0.78rem" }}>{m.label}</p>
                  <p style={{ color: "#1F2937", fontSize: "1.8rem", fontWeight: 700, lineHeight: 1.2 }}>{m.value}</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: m.color + "20" }}>
                  <Icon size={22} style={{ color: m.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
        <AlertTriangle size={18} style={{ color: "#D97706", flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ color: "#92400E", fontSize: "0.85rem", fontWeight: 600 }}>High-Value Transaction Alert</p>
          <p style={{ color: "#92400E", fontSize: "0.8rem" }}>
            SGO-004 — Ben Navarro — ₱2,500 Bills Payment via Cash on Delivery. Please verify payment arrangements before dispatch.
          </p>
        </div>
      </div>

      {/* Pending Queue */}
      <div className="bg-white rounded-2xl shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid #F3F4F6" }}>
          <h3 style={{ color: "#1F2937" }}>Pending Errand Queue</h3>
          <button onClick={() => setShowNewErrand(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white" style={{ background: NAVY, fontSize: "0.78rem" }}>
            <Plus size={14} /> New Errand
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {pendingErrands.map((errand) => (
            <div key={errand.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: NAVY, fontSize: "0.85rem", fontWeight: 700 }}>{errand.id}</span>
                    <span className="px-2 py-0.5 rounded" style={{
                      background: errand.type === "Pabili" ? "#DBEAFE" : errand.type === "Padala" ? "#D1FAE5" : "#FEF3C7",
                      color: errand.type === "Pabili" ? "#1E40AF" : errand.type === "Padala" ? "#065F46" : "#92400E",
                      fontSize: "0.72rem", fontWeight: 600
                    }}>{errand.type}</span>
                    <StatusBadge status={assigned[errand.id] ? "Assigned" : errand.status} />
                    {errand.amount > 3000 && (
                      <span className="px-2 py-0.5 rounded" style={{ background: "#FEE2E2", color: "#991B1B", fontSize: "0.68rem", fontWeight: 700 }}>HIGH-VALUE</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <div className="flex items-center gap-1.5">
                      <Users size={13} style={{ color: "#9CA3AF" }} />
                      <span style={{ color: "#374151", fontSize: "0.8rem" }}>{errand.customer}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} style={{ color: "#9CA3AF" }} />
                      <span style={{ color: "#374151", fontSize: "0.8rem" }}>{errand.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} style={{ color: "#9CA3AF" }} />
                      <span style={{ color: "#374151", fontSize: "0.8rem" }}>{errand.address}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} style={{ color: "#9CA3AF" }} />
                      <span style={{ color: "#374151", fontSize: "0.8rem" }}>{errand.createdAt}</span>
                    </div>
                  </div>
                  <p style={{ color: "#9CA3AF", fontSize: "0.75rem", marginTop: 4 }}>
                    Landmark: {errand.landmark} &bull; {errand.distance} &bull; {errand.paymentMode} &bull; ₱{errand.amount.toLocaleString()}
                  </p>
                  {assigned[errand.id] && (
                    <p style={{ color: "#10B981", fontSize: "0.78rem", marginTop: 4, fontWeight: 600 }}>
                      ✓ Assigned to {assigned[errand.id]}
                    </p>
                  )}
                </div>
                {!assigned[errand.id] && (
                  <button
                    onClick={() => setAssignModal(errand)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white flex-shrink-0"
                    style={{ background: NAVY, fontSize: "0.8rem" }}
                  >
                    <Zap size={14} /> Dispatch
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ color: "#1F2937" }}>Assign Rider — {assignModal.id}</h3>
              <button onClick={() => setAssignModal(null)} style={{ color: "#9CA3AF" }}><X size={20} /></button>
            </div>

            <div className="p-3 rounded-xl mb-4" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
              <p style={{ color: "#374151", fontSize: "0.82rem", fontWeight: 600 }}>{assignModal.customer} — {assignModal.type}</p>
              <p style={{ color: "#6B7280", fontSize: "0.78rem" }}>{assignModal.address}</p>
              <p style={{ color: "#6B7280", fontSize: "0.78rem" }}>{assignModal.landmark} &bull; {assignModal.distance} &bull; ₱{assignModal.amount.toLocaleString()}</p>
            </div>

            <p className="mb-3" style={{ color: "#374151", fontSize: "0.85rem", fontWeight: 600 }}>Select Available Rider:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {availableRiders.map(r => (
                <label
                  key={r.id}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: selectedRider === r.id ? "#EFF6FF" : "#F9FAFB",
                    border: `1.5px solid ${selectedRider === r.id ? "#3B82F6" : "#E5E7EB"}`
                  }}
                >
                  <input
                    type="radio"
                    name="rider"
                    value={r.id}
                    checked={selectedRider === r.id}
                    onChange={() => setSelectedRider(r.id)}
                    className="sr-only"
                  />
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: NAVY, fontSize: "0.72rem", fontWeight: 700 }}>{r.avatar}</div>
                  <div className="flex-1">
                    <p style={{ color: "#1F2937", fontSize: "0.85rem", fontWeight: 500 }}>{r.name}</p>
                    <p style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>{r.plateNumber} &bull; {r.completedToday} trips today</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#10B981" }} />
                    <span style={{ color: "#065F46", fontSize: "0.72rem" }}>Available</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="flex-1 py-2.5 rounded-xl" style={{ border: "1.5px solid #E5E7EB", color: "#374151", fontSize: "0.85rem" }}>Cancel</button>
              <button
                onClick={handleAssign}
                disabled={!selectedRider}
                className="flex-1 py-2.5 rounded-xl text-white"
                style={{ background: selectedRider ? NAVY : "#D1D5DB", fontSize: "0.85rem" }}
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Errand Modal */}
      {showNewErrand && <NewErrandModal onClose={() => setShowNewErrand(false)} />}
    </div>
  );
}

// ─── ACTIVE ERRANDS SECTION ──────────────────────────────────────────────────
function ActiveErrandsSection() {
  const activeErrands = errands.filter(e =>
    ["Assigned", "Traveling", "At Store", "Purchased", "En Route"].includes(e.status)
  );
  return (
    <div className="space-y-4">
      {activeErrands.map((e) => {
        const steps = ["Assigned", "Traveling", "At Store", "Purchased", "En Route", "Delivered"];
        const currentStep = steps.indexOf(e.status);
        return (
          <div key={e.id} className="bg-white rounded-2xl shadow-sm p-5" style={{ border: "1px solid #E5E7EB" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: NAVY, fontWeight: 700, fontSize: "0.9rem" }}>{e.id}</span>
                  <span className="px-2 py-0.5 rounded" style={{ background: "#DBEAFE", color: "#1E40AF", fontSize: "0.72rem" }}>{e.type}</span>
                  <StatusBadge status={e.status} />
                </div>
                <div className="flex items-center gap-4">
                  <span style={{ color: "#374151", fontSize: "0.82rem" }}>{e.customer} — {e.customerPhone}</span>
                  <span style={{ color: "#9CA3AF", fontSize: "0.78rem" }}>Rider: <strong style={{ color: "#1F2937" }}>{e.riderName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <MapPin size={13} style={{ color: "#9CA3AF" }} />
                  <span style={{ color: "#6B7280", fontSize: "0.78rem" }}>{e.address} — {e.landmark}</span>
                </div>
              </div>
              <div className="text-right">
                <p style={{ color: "#1F2937", fontSize: "1.1rem", fontWeight: 700 }}>₱{e.amount.toLocaleString()}</p>
                <p style={{ color: "#10B981", fontSize: "0.78rem" }}>Fee: ₱{e.serviceFee}</p>
                <p style={{ color: "#6B7280", fontSize: "0.72rem" }}>{e.paymentMode}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-1">
              {steps.slice(0, -1).map((step, i) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        background: i <= currentStep ? NAVY : "#E5E7EB",
                        border: i === currentStep ? `2px solid #60A5FA` : "2px solid transparent"
                      }}
                    >
                      {i < currentStep ? (
                        <CheckCircle size={12} className="text-white" />
                      ) : (
                        <span style={{ color: i <= currentStep ? "white" : "#9CA3AF", fontSize: "0.6rem", fontWeight: 700 }}>{i + 1}</span>
                      )}
                    </div>
                    <span style={{ color: i <= currentStep ? NAVY : "#9CA3AF", fontSize: "0.6rem", whiteSpace: "nowrap", fontWeight: i === currentStep ? 600 : 400 }}>{step}</span>
                  </div>
                  {i < steps.length - 2 && (
                    <div className="flex-1 h-0.5 mb-3" style={{ background: i < currentStep ? NAVY : "#E5E7EB" }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── RIDERS BOARD SECTION ────────────────────────────────────────────────────
function RidersBoardSection() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-2">
        {[
          { label: "Available", count: riders.filter(r => r.status === "Available").length, color: "#10B981", bg: "#D1FAE5" },
          { label: "On Errand", count: riders.filter(r => r.status === "On Errand").length, color: "#3B82F6", bg: "#DBEAFE" },
          { label: "Offline", count: riders.filter(r => r.status === "Offline").length, color: "#9CA3AF", bg: "#F3F4F6" },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl p-4 shadow-sm text-center" style={{ border: "1px solid #E5E7EB" }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: m.bg }}>
              <span style={{ color: m.color, fontSize: "1.3rem", fontWeight: 800 }}>{m.count}</span>
            </div>
            <p style={{ color: "#374151", fontSize: "0.82rem" }}>{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {riders.map((r) => {
          const dotColor = riderStatusDot[r.status];
          const statusBg = r.status === "Available" ? "#D1FAE5" : r.status === "On Errand" ? "#DBEAFE" : "#F3F4F6";
          const statusText = r.status === "Available" ? "#065F46" : r.status === "On Errand" ? "#1E40AF" : "#6B7280";
          return (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm p-4" style={{ border: "1px solid #E5E7EB" }}>
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white" style={{ background: NAVY, fontWeight: 700 }}>{r.avatar}</div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ background: dotColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: "#1F2937", fontSize: "0.85rem", fontWeight: 600 }}>{r.name}</p>
                  <p style={{ color: "#9CA3AF", fontSize: "0.72rem" }}>{r.plateNumber} &bull; {r.phone}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded-full" style={{ background: statusBg, color: statusText, fontSize: "0.7rem", fontWeight: 600 }}>{r.status}</span>
                    {r.currentErrand && (
                      <span style={{ color: NAVY, fontSize: "0.7rem", fontWeight: 600 }}>{r.currentErrand}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p style={{ color: NAVY, fontSize: "1rem", fontWeight: 700 }}>{r.completedToday}</p>
                  <p style={{ color: "#9CA3AF", fontSize: "0.68rem" }}>trips</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CUSTOMERS SECTION ───────────────────────────────────────────────────────
function CustomersSection() {
  const [search, setSearch] = useState("");
  const [customerList, setCustomerList] = useState(customers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [waybillCustomer, setWaybillCustomer] = useState<typeof customers[0] | null>(null);

  const filtered = customerList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none"
            style={{ background: "#FFFFFF", border: "1.5px solid #E5E7EB", fontSize: "0.85rem", color: "#1F2937" }}
          />
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white" style={{ background: NAVY, fontSize: "0.82rem" }}>
          <Plus size={15} /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["Customer", "Phone", "Address", "Landmark", "Total Errands", "Last Errand", "Type", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap" style={{ color: "#6B7280", fontSize: "0.72rem", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ borderTop: i > 0 ? "1px solid #F9FAFB" : "none" }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: NAVY, fontSize: "0.68rem", fontWeight: 700 }}>
                      {c.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                    <span style={{ color: "#1F2937", fontSize: "0.82rem", fontWeight: 500 }}>{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3" style={{ color: "#374151", fontSize: "0.82rem" }}>{c.phone}</td>
                <td className="px-4 py-3" style={{ color: "#374151", fontSize: "0.8rem", maxWidth: 180 }}>{c.address}</td>
                <td className="px-4 py-3" style={{ color: "#6B7280", fontSize: "0.78rem" }}>{c.landmark}</td>
                <td className="px-4 py-3" style={{ color: "#1F2937", fontSize: "0.82rem", fontWeight: 600, textAlign: "center" }}>{c.totalErrands}</td>
                <td className="px-4 py-3" style={{ color: "#6B7280", fontSize: "0.78rem" }}>{c.lastErrand}</td>
                <td className="px-4 py-3">
                  <span className="px-2.5 py-1 rounded-full" style={{
                    background: c.status === "VIP" ? "#FEF3C7" : c.status === "New" ? "#D1FAE5" : "#F3F4F6",
                    color: c.status === "VIP" ? "#92400E" : c.status === "New" ? "#065F46" : "#6B7280",
                    fontSize: "0.72rem", fontWeight: 600
                  }}>{c.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setWaybillCustomer(c)} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-white" style={{ background: NAVY, fontSize: "0.75rem" }}>
                    <FileText size={13} /> Waybill
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <AddCustomerModal
          onClose={() => setShowAddModal(false)}
          onAdd={(newCustomer) => setCustomerList(prev => [...prev, newCustomer])}
        />
      )}
      {waybillCustomer && (
        <WaybillModal customer={waybillCustomer} onClose={() => setWaybillCustomer(null)} />
      )}
    </div>
  );
}

// ─── MAIN DISPATCHER PORTAL ──────────────────────────────────────────────────
export default function DispatcherPortal() {
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("queue");
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead, dismiss } = useNotifications(dispatcherNotifications);

  const navItems: { id: Section; label: string; icon: any; badge?: number }[] = [
    { id: "queue", label: "Dispatch Queue", icon: ClipboardList, badge: 2 },
    { id: "active", label: "Active Errands", icon: Navigation, badge: 4 },
    { id: "riders", label: "Rider Board", icon: Bike },
    { id: "customers", label: "Customer Records", icon: Users },
    { id: "history", label: "Errand History", icon: Package },
  ];

  const titles: Record<Section, string> = {
    queue: "Dispatch Queue",
    active: "Active Errands",
    riders: "Rider Board",
    customers: "Customer Records",
    history: "Errand History",
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F3F4F6" }}>
      <Toaster position="top-right" richColors />
      {/* Sidebar */}
      <div className="flex flex-col flex-shrink-0" style={{ width: 240, background: NAVY_DARK }}>
        <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#E53935" }}>
            </div>
            <div>
              <p className="text-white" style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "0.05em" }}>Company Name</p>
              <p style={{ color: "#93C5FD", fontSize: "0.6rem", letterSpacing: "0.1em" }}>DISPATCHER</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className="w-full flex items-center justify-between px-5 py-3 transition-all"
                style={{
                  background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                  borderLeft: active ? "3px solid #60A5FA" : "3px solid transparent",
                }}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span style={{ fontSize: "0.85rem" }}>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: "#EF4444", fontSize: "0.65rem", fontWeight: 700 }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: "#2563EB", fontSize: "0.75rem", fontWeight: 700 }}>MB</div>
            <div>
              <p className="text-white" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Mark Dennis Batcharo</p>
              <p style={{ color: "#93C5FD", fontSize: "0.72rem" }}>Head Dispatcher</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="relative flex items-center justify-between px-6 py-4 bg-white flex-shrink-0" style={{ borderBottom: "1px solid #E5E7EB" }}>
          <div>
            <h2 style={{ color: "#1F2937" }}>{titles[section]}</h2>
            <p style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>Monday, March 23, 2026 — 11:32 AM</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "#D1FAE5" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "#10B981" }} />
              <span style={{ color: "#065F46", fontSize: "0.78rem", fontWeight: 600 }}>System Live</span>
            </div>
            <button
              onClick={() => setNotifOpen(o => !o)}
              className="relative p-2 rounded-xl transition-colors"
              style={{ background: notifOpen ? "#EFF6FF" : "#F3F4F6", color: "#374151" }}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: "#EF4444", fontSize: "0.6rem", fontWeight: 700 }}>
                  {unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => toast.success("Data refreshed!", { description: "All errand data is now up to date." })} className="p-2 rounded-xl" style={{ background: "#F3F4F6", color: "#374151" }}>
              <RefreshCw size={18} />
            </button>
          </div>

          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            markAllRead={markAllRead}
            markRead={markRead}
            dismiss={dismiss}
            accentColor="#1E3A5F"
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
          />
        </div>

        {/* Section Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {section === "queue" && <DispatchQueueSection />}
          {section === "active" && <ActiveErrandsSection />}
          {section === "riders" && <RidersBoardSection />}
          {section === "customers" && <CustomersSection />}
          {section === "history" && (
            <div className="bg-white rounded-2xl shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
              <div className="p-5" style={{ borderBottom: "1px solid #F3F4F6" }}>
                <h3 style={{ color: "#1F2937" }}>Completed & Cancelled Errands</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#F9FAFB" }}>
                      {["ID", "Type", "Customer", "Rider", "Amount", "Fee", "Status", "Completed"].map(h => (
                        <th key={h} className="px-4 py-3 text-left" style={{ color: "#6B7280", fontSize: "0.72rem", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {errands.filter(e => ["Delivered", "Cancelled"].includes(e.status)).map((e, i) => (
                      <tr key={e.id} style={{ borderTop: i > 0 ? "1px solid #F9FAFB" : "none" }}>
                        <td className="px-4 py-3" style={{ color: NAVY, fontSize: "0.8rem", fontWeight: 600 }}>{e.id}</td>
                        <td className="px-4 py-3" style={{ color: "#374151", fontSize: "0.8rem" }}>{e.type}</td>
                        <td className="px-4 py-3" style={{ color: "#374151", fontSize: "0.8rem" }}>{e.customer}</td>
                        <td className="px-4 py-3" style={{ color: "#374151", fontSize: "0.8rem" }}>{e.riderName || "—"}</td>
                        <td className="px-4 py-3" style={{ color: "#1F2937", fontSize: "0.8rem" }}>₱{e.amount.toLocaleString()}</td>
                        <td className="px-4 py-3" style={{ color: "#10B981", fontSize: "0.8rem", fontWeight: 600 }}>₱{e.serviceFee}</td>
                        <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                        <td className="px-4 py-3" style={{ color: "#6B7280", fontSize: "0.78rem" }}>{e.updatedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
