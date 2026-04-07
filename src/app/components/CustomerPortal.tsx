import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  ShoppingCart, Package, CreditCard, MapPin, Phone, Clock,
  Bell, ChevronRight, Search, Star, CheckCircle, Bike,
  LogOut, Home, ClipboardList, User, Navigation, Plus,
  ArrowLeft, X, ChevronDown, AlertCircle, Zap
} from "lucide-react";
import { NotificationPanel, useNotifications, customerNotifications } from "./NotificationPanel";
import { toast, Toaster } from "sonner";

const PINK = "#F62459";
const PINK_DARK = "#C41B47";
const PINK_LIGHT = "#FFEEF3";

type NavTab = "home" | "orders" | "track" | "account";
type OrderView = "services" | "pabili-form" | "padala-form" | "bills-form" | "confirm" | "tracking";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

const serviceTypes = [
  {
    id: "pabili",
    name: "Pabili",
    icon: ShoppingCart,
    tagline: "We'll buy it for you",
    desc: "Send your shopping list & we'll purchase and deliver",
    color: PINK,
    bg: PINK_LIGHT,
    gradient: `linear-gradient(135deg, ${PINK}, #FF6B8A)`,
  },
  {
    id: "padala",
    name: "Padala",
    icon: Package,
    tagline: "Fast package delivery",
    desc: "Send documents, items, or packages to any address",
    color: "#7C3AED",
    bg: "#F5F3FF",
    gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)",
  },
  {
    id: "bills",
    name: "Bills Payment",
    icon: CreditCard,
    tagline: "Pay your bills hassle-free",
    desc: "Let us pay your electricity, water, or other bills",
    color: "#059669",
    bg: "#ECFDF5",
    gradient: "linear-gradient(135deg, #059669, #34D399)",
  },
];

const orderHistory = [
  { id: "SGO-006", type: "Padala", status: "Delivered", date: "Today, 09:30 AM", total: "₱240", rider: "Jose Dela Cruz", desc: "Documents to Brgy New Isabela" },
  { id: "SGO-003", type: "Pabili", status: "En Route", date: "Today, 09:45 AM", total: "₱1,410", rider: "Mario Santos", desc: "Grocery shopping — SM Supermarket" },
  { id: "SGO-B01", type: "Bills Payment", status: "Delivered", date: "Mar 22, 03:15 PM", total: "₱1,845", rider: "Ramon Torres", desc: "Meralco bill payment" },
  { id: "SGO-P01", type: "Pabili", status: "Delivered", date: "Mar 21, 10:00 AM", total: "₱895", rider: "Fernando Lopez", desc: "Jollibee order + Mercury Drug" },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  Delivered: { bg: "#D1FAE5", text: "#065F46" },
  "En Route": { bg: "#DBEAFE", text: "#1E40AF" },
  Assigned: { bg: PINK_LIGHT, text: PINK_DARK },
  Pending: { bg: "#FEF3C7", text: "#92400E" },
};

const trackingSteps = [
  { label: "Order Received", done: true, time: "10:30 AM" },
  { label: "Rider Assigned", done: true, time: "10:34 AM" },
  { label: "Traveling to Store", done: true, time: "10:36 AM" },
  { label: "Items Purchased", done: false, time: "" },
  { label: "En Route to You", done: false, time: "" },
  { label: "Delivered", done: false, time: "" },
];

export default function CustomerPortal() {
  const navigate = useNavigate();
  const [navTab, setNavTab] = useState<NavTab>("home");
  const [orderView, setOrderView] = useState<OrderView>("services");
  const [items, setItems] = useState<OrderItem[]>([{ name: "", qty: 1, price: 0 }]);
  const [deliveryAddress, setDeliveryAddress] = useState("Maharlika Highway, Brgy Calean, Tacurong City");
  const [landmark, setLandmark] = useState("Near SM Sultan Kudarat");
  const [paymentMode, setPaymentMode] = useState("Cash on Delivery");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead, dismiss } = useNotifications(customerNotifications);

  const totalPurchase = items.reduce((s, i) => s + i.price * i.qty, 0);
  const commission = totalPurchase > 1000 ? totalPurchase * 0.1 : totalPurchase > 0 ? 50 : 0;
  const serviceFee = 50;
  const grandTotal = totalPurchase + commission + serviceFee;

  const addItem = () => setItems([...items, { name: "", qty: 1, price: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof OrderItem, value: string | number) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    setItems(updated);
  };

  const handlePlaceOrder = () => {
    setOrderPlaced(true);
    setOrderView("tracking");
    setNavTab("track");
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F5F5F5" }}>
      <Toaster position="top-center" richColors />
      <div
        className="relative flex flex-col overflow-hidden shadow-2xl"
        style={{
          width: "100%",
          maxWidth: 400,
          height: "100dvh",
          maxHeight: 860,
          borderRadius: 32,
          background: "#F8F8F8",
          border: "1px solid #E5E7EB"
        }}
      >
        {/* ── HOME TAB ── */}
        {navTab === "home" && orderView === "services" && (
          <>
            {/* Pink Header */}
            <div className="flex-shrink-0 relative" style={{ background: `linear-gradient(135deg, ${PINK} 0%, #FF6B8A 100%)` }}>
              <div className="px-5 pt-10 pb-16">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
                      <Bike size={16} className="text-white" />
                    </div>
                    <span className="text-white" style={{ fontSize: "0.9rem", fontWeight: 800, letterSpacing: "0.05em" }}>SUGO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setNotifOpen(o => !o)} className="relative p-2 rounded-xl bg-white bg-opacity-20">
                      <Bell size={16} className="text-white" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ background: "#FCD34D", color: "#92400E", fontSize: "0.55rem", fontWeight: 800 }}>
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <button onClick={() => navigate("/")} className="p-2 rounded-xl bg-white bg-opacity-20">
                      <LogOut size={16} className="text-white" />
                    </button>
                  </div>
                </div>

                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.82rem" }}>Hi, Liza! 👋</p>
                <h2 className="text-white" style={{ fontSize: "1.3rem" }}>What can we get for you today?</h2>

                {/* Search */}
                <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-2xl bg-white">
                  <Search size={16} style={{ color: "#9CA3AF" }} />
                  <input
                    placeholder="Search services, stores..."
                    className="flex-1 outline-none bg-transparent"
                    style={{ color: "#374151", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
            </div>

              {/* Customer Notification Panel */}
              <div className="absolute top-16 right-4 left-4 z-50">
                <NotificationPanel
                  notifications={notifications}
                  unreadCount={unreadCount}
                  markAllRead={markAllRead}
                  markRead={markRead}
                  dismiss={dismiss}
                  accentColor={PINK}
                  open={notifOpen}
                  onClose={() => setNotifOpen(false)}
                />
              </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto" style={{ marginTop: -24 }}>
              {/* Service Cards */}
              <div className="px-4 space-y-3 mb-4">
                {serviceTypes.map((service) => {
                  const Icon = service.icon;
                  return (
                    <button
                      key={service.id}
                      onClick={() => { setOrderView(`${service.id === "bills" ? "bills" : service.id}-form` as OrderView); setNavTab("home"); }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm text-left"
                      style={{ border: "1px solid #F0F0F0" }}
                    >
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: service.gradient }}>
                        <Icon size={26} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p style={{ color: "#1F2937", fontSize: "1rem", fontWeight: 700 }}>{service.name}</p>
                        <p style={{ color: service.color, fontSize: "0.75rem", fontWeight: 600 }}>{service.tagline}</p>
                        <p style={{ color: "#9CA3AF", fontSize: "0.73rem" }}>{service.desc}</p>
                      </div>
                      <ChevronRight size={18} style={{ color: "#D1D5DB" }} />
                    </button>
                  );
                })}
              </div>

              {/* Promo Banner */}
              <div className="mx-4 mb-4 p-4 rounded-2xl overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${PINK}, #FF8C69)` }}>
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white opacity-10" />
                <p className="text-white" style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em" }}>LIMITED OFFER</p>
                <p className="text-white" style={{ fontSize: "1rem", fontWeight: 800, lineHeight: 1.2, marginTop: 2 }}>First Pabili order?<br />FREE delivery!</p>
                <button
                  onClick={() => { setOrderView("pabili-form"); setNavTab("home"); toast.success("Promo applied! 🎉", { description: "Your first Pabili order gets FREE delivery." }); }}
                  className="mt-3 px-4 py-1.5 rounded-full bg-white"
                  style={{ color: PINK, fontSize: "0.75rem", fontWeight: 700 }}
                >
                  Avail Now
                </button>
              </div>

              {/* Recent Orders */}
              <div className="px-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p style={{ color: "#1F2937", fontSize: "0.9rem", fontWeight: 700 }}>Recent Orders</p>
                  <button onClick={() => setNavTab("orders")} style={{ color: PINK, fontSize: "0.78rem", fontWeight: 600 }}>See all</button>
                </div>
                <div className="space-y-2">
                  {orderHistory.slice(0, 2).map((o) => {
                    const sc = statusColors[o.status];
                    return (
                      <div key={o.id} className="bg-white rounded-xl p-3 flex items-center gap-3" style={{ border: "1px solid #F0F0F0" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: PINK_LIGHT }}>
                          <Package size={18} style={{ color: PINK }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p style={{ color: "#1F2937", fontSize: "0.82rem", fontWeight: 600 }}>{o.type} — {o.id}</p>
                          <p style={{ color: "#9CA3AF", fontSize: "0.72rem" }}>{o.date}</p>
                        </div>
                        <div className="text-right">
                          <p style={{ color: "#1F2937", fontSize: "0.85rem", fontWeight: 700 }}>{o.total}</p>
                          <span className="px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text, fontSize: "0.62rem", fontWeight: 600 }}>{o.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tips */}
              <div className="mx-4 mb-6 p-4 rounded-2xl" style={{ background: "#FFF3E0" }}>
                <p style={{ color: "#E65100", fontSize: "0.82rem", fontWeight: 700, marginBottom: 4 }}>💡 Did you know?</p>
                <p style={{ color: "#BF360C", fontSize: "0.78rem" }}>Track your rider's real-time location from the <strong>Track</strong> tab the moment they're dispatched!</p>
              </div>
            </div>
          </>
        )}

        {/* ── PABILI FORM ── */}
        {navTab === "home" && orderView === "pabili-form" && (
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0 px-5 pt-10 pb-4" style={{ background: `linear-gradient(135deg, ${PINK}, #FF6B8A)` }}>
              <div className="flex items-center gap-3">
                <button onClick={() => setOrderView("services")} className="p-2 rounded-xl bg-white bg-opacity-20">
                  <ArrowLeft size={18} className="text-white" />
                </button>
                <div>
                  <h2 className="text-white">Pabili Order</h2>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.75rem" }}>Tell us what to buy</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Delivery Address */}
              <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F0F0F0" }}>
                <p style={{ color: "#374151", fontSize: "0.82rem", fontWeight: 700, marginBottom: 8 }}>📍 Delivery Details</p>
                <div className="space-y-3">
                  <div>
                    <label style={{ color: "#6B7280", fontSize: "0.75rem" }}>Complete Address *</label>
                    <input
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl outline-none"
                      style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }}
                    />
                  </div>
                  <div>
                    <label style={{ color: "#6B7280", fontSize: "0.75rem" }}>Landmark</label>
                    <input
                      value={landmark}
                      onChange={e => setLandmark(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl outline-none"
                      style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }}
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F0F0F0" }}>
                <p style={{ color: "#374151", fontSize: "0.82rem", fontWeight: 700, marginBottom: 8 }}>🛒 Shopping List</p>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-1 space-y-1">
                        <input
                          value={item.name}
                          onChange={e => updateItem(i, "name", e.target.value)}
                          placeholder={`Item ${i + 1} name`}
                          className="w-full px-3 py-2 rounded-xl outline-none"
                          style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "0.8rem", color: "#1F2937" }}
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={e => updateItem(i, "qty", Number(e.target.value))}
                            placeholder="Qty"
                            className="w-16 px-2 py-1.5 rounded-xl outline-none text-center"
                            style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "0.78rem", color: "#1F2937" }}
                          />
                          <input
                            type="number"
                            value={item.price || ""}
                            onChange={e => updateItem(i, "price", Number(e.target.value))}
                            placeholder="Est. price (₱)"
                            className="flex-1 px-2 py-1.5 rounded-xl outline-none"
                            style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "0.78rem", color: "#1F2937" }}
                          />
                        </div>
                      </div>
                      {items.length > 1 && (
                        <button onClick={() => removeItem(i)} style={{ color: "#EF4444" }}><X size={16} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addItem}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl"
                  style={{ border: `1.5px dashed ${PINK}`, color: PINK, fontSize: "0.8rem" }}
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              {/* Payment Mode */}
              <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F0F0F0" }}>
                <p style={{ color: "#374151", fontSize: "0.82rem", fontWeight: 700, marginBottom: 8 }}>💳 Payment Mode</p>
                <div className="space-y-2">
                  {["Cash on Delivery", "GCash", "Bank Transfer"].map(pm => (
                    <label key={pm} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer" style={{ background: paymentMode === pm ? PINK_LIGHT : "#F9FAFB", border: `1.5px solid ${paymentMode === pm ? PINK : "#E5E7EB"}` }}>
                      <input type="radio" name="payment" value={pm} checked={paymentMode === pm} onChange={() => setPaymentMode(pm)} className="sr-only" />
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: paymentMode === pm ? PINK : "#D1D5DB" }}>
                        {paymentMode === pm && <div className="w-2 h-2 rounded-full" style={{ background: PINK }} />}
                      </div>
                      <span style={{ color: "#374151", fontSize: "0.82rem" }}>{pm}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {totalPurchase > 0 && (
                <div className="bg-white rounded-2xl p-4" style={{ border: `1px solid ${PINK_LIGHT}` }}>
                  <p style={{ color: "#374151", fontSize: "0.82rem", fontWeight: 700, marginBottom: 8 }}>🧾 Order Summary</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span style={{ color: "#6B7280", fontSize: "0.8rem" }}>Est. Purchase Total</span>
                      <span style={{ color: "#1F2937", fontSize: "0.8rem" }}>₱{totalPurchase.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#6B7280", fontSize: "0.8rem" }}>Service Fee</span>
                      <span style={{ color: "#1F2937", fontSize: "0.8rem" }}>₱{serviceFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "#6B7280", fontSize: "0.8rem" }}>Commission ({totalPurchase > 1000 ? "10%" : "flat ₱50"})</span>
                      <span style={{ color: "#1F2937", fontSize: "0.8rem" }}>₱{commission}</span>
                    </div>
                    <div className="flex justify-between pt-2" style={{ borderTop: "1px solid #F3F4F6" }}>
                      <span style={{ color: "#1F2937", fontSize: "0.85rem", fontWeight: 700 }}>Total to Pay</span>
                      <span style={{ color: PINK, fontSize: "0.9rem", fontWeight: 800 }}>₱{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Place Order Button */}
            <div className="flex-shrink-0 p-4" style={{ background: "#FFFFFF", borderTop: "1px solid #F0F0F0" }}>
              <button
                onClick={handlePlaceOrder}
                className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${PINK}, #FF6B8A)`, fontSize: "0.95rem", fontWeight: 700, boxShadow: `0 8px 24px ${PINK}40` }}
              >
                <Zap size={18} /> Place Order Now
              </button>
              <p className="text-center mt-2" style={{ color: "#9CA3AF", fontSize: "0.72rem" }}>
                A dispatcher will review and assign a rider shortly
              </p>
            </div>
          </div>
        )}

        {/* ── PADALA FORM ── */}
        {navTab === "home" && orderView === "padala-form" && (
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0 px-5 pt-10 pb-4" style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)" }}>
              <div className="flex items-center gap-3">
                <button onClick={() => setOrderView("services")} className="p-2 rounded-xl bg-white bg-opacity-20">
                  <ArrowLeft size={18} className="text-white" />
                </button>
                <div>
                  <h2 className="text-white">Padala</h2>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.75rem" }}>Package & document delivery</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F0F0F0" }}>
                <p style={{ color: "#374151", fontSize: "0.82rem", fontWeight: 700, marginBottom: 8 }}>📦 Package Details</p>
                <div className="space-y-3">
                  {[
                    { label: "Description of Item", placeholder: "e.g. Documents, clothes, small package" },
                    { label: "Recipient Name", placeholder: "Full name of recipient" },
                    { label: "Recipient Phone", placeholder: "09XXXXXXXXX" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label style={{ color: "#6B7280", fontSize: "0.75rem" }}>{f.label}</label>
                      <input
                        placeholder={f.placeholder}
                        className="w-full mt-1 px-3 py-2 rounded-xl outline-none"
                        style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F0F0F0" }}>
                <p style={{ color: "#374151", fontSize: "0.82rem", fontWeight: 700, marginBottom: 8 }}>📍 Delivery Address</p>
                <div className="space-y-3">
                  {[
                    { label: "Complete Address", placeholder: "Street, Barangay, City", val: deliveryAddress, set: setDeliveryAddress },
                    { label: "Landmark", placeholder: "e.g. Near SM, beside church", val: landmark, set: setLandmark },
                  ].map((f) => (
                    <div key={f.label}>
                      <label style={{ color: "#6B7280", fontSize: "0.75rem" }}>{f.label}</label>
                      <input
                        value={f.val}
                        onChange={e => f.set(e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full mt-1 px-3 py-2 rounded-xl outline-none"
                        style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F0F0F0" }}>
                <p style={{ color: "#374151", fontSize: "0.82rem", fontWeight: 700, marginBottom: 8 }}>💳 Payment Mode</p>
                <div className="space-y-2">
                  {["Cash on Delivery", "GCash", "Bank Transfer"].map(pm => (
                    <label key={pm} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer" style={{ background: paymentMode === pm ? "#F5F3FF" : "#F9FAFB", border: `1.5px solid ${paymentMode === pm ? "#7C3AED" : "#E5E7EB"}` }}>
                      <input type="radio" name="payment2" value={pm} checked={paymentMode === pm} onChange={() => setPaymentMode(pm)} className="sr-only" />
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: paymentMode === pm ? "#7C3AED" : "#D1D5DB" }}>
                        {paymentMode === pm && <div className="w-2 h-2 rounded-full" style={{ background: "#7C3AED" }} />}
                      </div>
                      <span style={{ color: "#374151", fontSize: "0.82rem" }}>{pm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 p-4" style={{ background: "#FFFFFF", borderTop: "1px solid #F0F0F0" }}>
              <button
                onClick={handlePlaceOrder}
                className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #7C3AED, #A78BFA)", fontSize: "0.95rem", fontWeight: 700 }}
              >
                <Zap size={18} /> Place Padala Order
              </button>
            </div>
          </div>
        )}

        {/* ── BILLS FORM ── */}
        {navTab === "home" && orderView === "bills-form" && (
          <div className="flex flex-col h-full">
            <div className="flex-shrink-0 px-5 pt-10 pb-4" style={{ background: "linear-gradient(135deg, #059669, #34D399)" }}>
              <div className="flex items-center gap-3">
                <button onClick={() => setOrderView("services")} className="p-2 rounded-xl bg-white bg-opacity-20">
                  <ArrowLeft size={18} className="text-white" />
                </button>
                <div>
                  <h2 className="text-white">Bills Payment</h2>
                  <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.75rem" }}>We'll pay your bills for you</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F0F0F0" }}>
                <p style={{ color: "#374151", fontSize: "0.82rem", fontWeight: 700, marginBottom: 8 }}>🧾 Bill Details</p>
                <div className="space-y-3">
                  <div>
                    <label style={{ color: "#6B7280", fontSize: "0.75rem" }}>Bill Type</label>
                    <select className="w-full mt-1 px-3 py-2 rounded-xl outline-none" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }}>
                      {["Meralco (Electric)", "MWSS (Water)", "PLDT (Telephone/Internet)", "Globe/Smart (Mobile)", "SSS / PhilHealth / Pag-IBIG", "Credit Card", "Other"].map(b => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  {[
                    { label: "Account/Reference Number", placeholder: "Bill account number" },
                    { label: "Amount to Pay (₱)", placeholder: "0.00" },
                    { label: "Billing Month", placeholder: "e.g. March 2026" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label style={{ color: "#6B7280", fontSize: "0.75rem" }}>{f.label}</label>
                      <input
                        placeholder={f.placeholder}
                        className="w-full mt-1 px-3 py-2 rounded-xl outline-none"
                        style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-xl flex items-start gap-2" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
                <AlertCircle size={15} style={{ color: "#059669", flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: "#065F46", fontSize: "0.78rem" }}>
                  A ₱45 service fee applies. Your bill amount will be collected from you via your chosen payment method.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 p-4" style={{ background: "#FFFFFF", borderTop: "1px solid #F0F0F0" }}>
              <button
                onClick={handlePlaceOrder}
                className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #059669, #34D399)", fontSize: "0.95rem", fontWeight: 700 }}
              >
                <Zap size={18} /> Submit Bills Payment Request
              </button>
            </div>
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {navTab === "orders" && (
          <>
            <div className="flex-shrink-0 px-5 pt-10 pb-5" style={{ background: `linear-gradient(135deg, ${PINK}, #FF6B8A)` }}>
              <h2 className="text-white">My Orders</h2>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem" }}>View and manage your errand history</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {orderHistory.map((o) => {
                const sc = statusColors[o.status] || { bg: "#F3F4F6", text: "#6B7280" };
                return (
                  <div key={o.id} className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0F0F0" }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span style={{ color: PINK, fontSize: "0.85rem", fontWeight: 700 }}>{o.id}</span>
                          <span className="px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text, fontSize: "0.68rem", fontWeight: 600 }}>{o.status}</span>
                        </div>
                        <p style={{ color: "#374151", fontSize: "0.82rem", fontWeight: 500 }}>{o.type} — {o.desc}</p>
                        <p style={{ color: "#9CA3AF", fontSize: "0.72rem" }}>{o.date}</p>
                      </div>
                      <p style={{ color: "#1F2937", fontSize: "0.95rem", fontWeight: 800 }}>{o.total}</p>
                    </div>

                    {o.status !== "Delivered" && (
                      <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: "1px solid #F9FAFB" }}>
                        <Bike size={14} style={{ color: PINK }} />
                        <span style={{ color: "#374151", fontSize: "0.78rem" }}>Rider: <strong>{o.rider}</strong></span>
                        <button
                          onClick={() => setNavTab("track")}
                          className="ml-auto flex items-center gap-1 px-3 py-1 rounded-full"
                          style={{ background: PINK_LIGHT, color: PINK, fontSize: "0.72rem", fontWeight: 600 }}
                        >
                          <Navigation size={12} /> Track
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── TRACK TAB ── */}
        {navTab === "track" && (
          <>
            <div className="flex-shrink-0 px-5 pt-10 pb-5" style={{ background: `linear-gradient(135deg, ${PINK}, #FF6B8A)` }}>
              <h2 className="text-white">Track Your Errand</h2>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem" }}>Real-time rider location & status</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Map placeholder */}
              <div
                className="w-full rounded-2xl flex flex-col items-center justify-center overflow-hidden"
                style={{ height: 200, background: "linear-gradient(135deg, #E8F4FD, #D1E8F7)", border: "1px solid #BFD7EA", position: "relative" }}
              >
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: "repeating-linear-gradient(0deg, #93C5FD 0, #93C5FD 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #93C5FD 0, #93C5FD 1px, transparent 1px, transparent 40px)"
                }} />
                <div className="relative flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ background: PINK }}>
                    <Bike size={22} className="text-white" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-white shadow-sm" style={{ color: "#374151", fontSize: "0.78rem", fontWeight: 600 }}>
                    Rider is 1.2 km away
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-white shadow-sm">
                  <div className="w-2 h-2 rounded-full" style={{ background: "#10B981" }} />
                  <span style={{ color: "#374151", fontSize: "0.68rem" }}>Live</span>
                </div>
              </div>

              {/* Rider Card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0F0F0" }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: "#1E3A5F", fontWeight: 700 }}>MS</div>
                  <div className="flex-1">
                    <p style={{ color: "#1F2937", fontSize: "0.9rem", fontWeight: 700 }}>Mario Santos</p>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => <Star key={s} size={11} fill={s <= 4 ? "#F59E0B" : "transparent"} style={{ color: "#F59E0B" }} />)}
                      <span style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>4.9</span>
                    </div>
                    <p style={{ color: "#9CA3AF", fontSize: "0.72rem" }}>DEF-5678</p>
                  </div>
                  <a href="tel:09392345678" className="flex items-center gap-2 px-3 py-2 rounded-xl text-white" style={{ background: PINK, fontSize: "0.78rem" }}>
                    <Phone size={14} /> Call
                  </a>
                </div>
              </div>

              {/* Order status */}
              <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0F0F0" }}>
                <div className="flex items-center justify-between mb-3">
                  <p style={{ color: "#374151", fontSize: "0.85rem", fontWeight: 700 }}>SGO-003 — Pabili</p>
                  <span style={{ color: "#9CA3AF", fontSize: "0.72rem" }}>₱1,410 total</span>
                </div>
                <div className="space-y-3">
                  {trackingSteps.map((step, i) => (
                    <div key={step.label} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                        style={{ background: step.done ? PINK : "#F3F4F6" }}>
                        {step.done
                          ? <CheckCircle size={14} className="text-white" />
                          : <Clock size={14} style={{ color: "#D1D5DB" }} />
                        }
                      </div>
                      <div className="flex-1">
                        <p style={{ color: step.done ? "#1F2937" : "#9CA3AF", fontSize: "0.82rem", fontWeight: step.done ? 600 : 400 }}>
                          {step.label}
                        </p>
                      </div>
                      <span style={{ color: step.done ? PINK : "#D1D5DB", fontSize: "0.72rem", fontWeight: 600 }}>
                        {step.time || "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #F0F0F0" }}>
                <p style={{ color: "#374151", fontSize: "0.82rem", fontWeight: 700, marginBottom: 6 }}>📍 Delivery Address</p>
                <p style={{ color: "#374151", fontSize: "0.82rem" }}>Maharlika Highway, Brgy Calean, Tacurong City</p>
                <p style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>Near SM Sultan Kudarat</p>
              </div>
            </div>
          </>
        )}

        {/* ── ACCOUNT TAB ── */}
        {navTab === "account" && (
          <>
            <div className="flex-shrink-0" style={{ background: `linear-gradient(160deg, ${PINK} 0%, #FF6B8A 60%, #FECDD3 85%, #FFFFFF 100%)` }}>
              <div className="px-5 pt-10 pb-10 text-center">
                <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center mx-auto mb-3 shadow-md" style={{ background: PINK_DARK }}>
                  <span className="text-white" style={{ fontSize: "1.5rem", fontWeight: 800 }}>LR</span>
                </div>
                <p className="text-white" style={{ fontSize: "1.1rem", fontWeight: 700 }}>Liza Marie Reyes</p>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.8rem" }}>liza.reyes@gmail.com</p>
                <span className="mt-2 inline-block px-3 py-1 rounded-full bg-white" style={{ color: PINK, fontSize: "0.72rem", fontWeight: 700 }}>
                  VIP Customer
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ marginTop: -12 }}>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Errands", value: "24" },
                  { label: "This Month", value: "8" },
                  { label: "Total Spent", value: "₱14k+" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl p-3 text-center shadow-sm" style={{ border: "1px solid #F0F0F0" }}>
                    <p style={{ color: PINK, fontSize: "1.1rem", fontWeight: 800 }}>{s.value}</p>
                    <p style={{ color: "#9CA3AF", fontSize: "0.68rem" }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-sm" style={{ border: "1px solid #F0F0F0" }}>
                {[
                  { label: "Phone", value: "09501234567" },
                  { label: "Address", value: "Brgy Calean, Tacurong City" },
                  { label: "Landmark", value: "Near SM Sultan Kudarat" },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: i < 2 ? "1px solid #F9FAFB" : "none" }}>
                    <span style={{ color: "#6B7280", fontSize: "0.82rem" }}>{item.label}</span>
                    <span style={{ color: "#1F2937", fontSize: "0.82rem", fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {[
                { label: "Edit Profile",     icon: User,    action: () => toast.info("Profile editor coming soon!") },
                { label: "Saved Addresses",  icon: MapPin,  action: () => toast.info("Saved addresses coming soon!") },
                { label: "Notifications",    icon: Bell,    action: () => toast.success("Notifications are enabled for your account.") },
              ].map(({ label, icon: Icon, action }) => (
                <button key={label} onClick={action} className="w-full bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm" style={{ border: "1px solid #F0F0F0" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: PINK_LIGHT }}>
                    <Icon size={18} style={{ color: PINK }} />
                  </div>
                  <span style={{ color: "#374151", fontSize: "0.85rem" }}>{label}</span>
                  <ChevronRight size={16} style={{ color: "#D1D5DB", marginLeft: "auto" }} />
                </button>
              ))}

              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl"
                style={{ background: PINK_LIGHT, color: PINK, fontSize: "0.85rem", fontWeight: 600 }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </>
        )}

        {/* Bottom Nav */}
        {!(navTab === "home" && orderView !== "services") && (
          <div
            className="flex-shrink-0 flex items-center justify-around px-4 py-3"
            style={{ background: "#FFFFFF", borderTop: "1px solid #F0F0F0", boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}
          >
            {[
              { id: "home" as NavTab, icon: Home, label: "Home" },
              { id: "orders" as NavTab, icon: ClipboardList, label: "Orders" },
              { id: "track" as NavTab, icon: Navigation, label: "Track" },
              { id: "account" as NavTab, icon: User, label: "Account" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => { setNavTab(id); setOrderView("services"); }}
                className="flex flex-col items-center gap-1 px-3 py-1"
                style={{ color: navTab === id ? PINK : "#9CA3AF" }}
              >
                <Icon size={20} />
                <span style={{ fontSize: "0.65rem", fontWeight: navTab === id ? 700 : 400 }}>{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}