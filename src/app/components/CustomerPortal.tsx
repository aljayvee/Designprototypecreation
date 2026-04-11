import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ShoppingCart, Package, CreditCard, MapPin, Phone, Clock,
  Bell, ChevronRight, Search, Star, CheckCircle, Bike,
  LogOut, Home, ClipboardList, User, Navigation, Plus,
  ArrowLeft, X, ChevronDown, AlertCircle, Zap, MessageCircle
} from "lucide-react";
import { NotificationPanel, useNotifications, customerNotifications } from "./NotificationPanel";
import { toast, Toaster } from "sonner";
import { merchants, conversations, ChatMessage, DUMMY_ACCOUNTS } from "./mockData";

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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead, dismiss } = useNotifications(customerNotifications);

  // ── Messaging state ──
  const [cdChatOpen, setCdChatOpen] = useState(false);
  const [crChatOpen, setCrChatOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  
  // New State for Merchant Request Modal in Chat
  const [showMerchantReqModal, setShowMerchantReqModal] = useState(false);
  const [merchantReqSearch, setMerchantReqSearch] = useState("");
  const [merchantReqSelected, setMerchantReqSelected] = useState<number | null>(null);
  const [merchantReqInput, setMerchantReqInput] = useState("");

  const filteredReqMerchants = merchants.filter(m =>
    m.businessName.toLowerCase().includes(merchantReqSearch.toLowerCase())
  );

  const customer = DUMMY_ACCOUNTS.find(a => a.role === "customer");

  const [cdMessages, setCdMessages] = useState<ChatMessage[]>(
    conversations.find(c => c.type === "customer-dispatcher")?.messages ?? []
  );
  const [crMessages, setCrMessages] = useState<ChatMessage[]>(
    conversations.find(c => c.type === "customer-rider")?.messages ?? []
  );
  const cdInputRef = useRef<HTMLInputElement>(null);
  const crInputRef = useRef<HTMLInputElement>(null);
  const cdBodyRef = useRef<HTMLDivElement>(null);
  const crBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (cdBodyRef.current) cdBodyRef.current.scrollTop = cdBodyRef.current.scrollHeight; }, [cdMessages, cdChatOpen]);
  useEffect(() => { if (crBodyRef.current) crBodyRef.current.scrollTop = crBodyRef.current.scrollHeight; }, [crMessages, crChatOpen]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "requestPayment" && e.newValue) {
        setShowPaymentModal(true);
        localStorage.removeItem("requestPayment");
      }
      if (e.key === "riderAssigned" && e.newValue) {
        setCdChatOpen(false);
        toast.success("Rider Assigned!", { description: "You can track your order now." });
        setOrderView("tracking");
        setNavTab("track");
        localStorage.removeItem("riderAssigned");
      }
      if (e.key === "chat_d2c" && e.newValue) {
        try {
          const msg = JSON.parse(e.newValue);
          setCdMessages(prev => [...prev, msg]);
          localStorage.removeItem("chat_d2c"); // consume event
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const now = () => { const d = new Date(); const h = d.getHours(); const m = String(d.getMinutes()).padStart(2,"0"); return `${h > 12 ? h-12 : h}:${m} ${h>=12?"PM":"AM"}`; };

  const sendCD = (text: string) => {
    const msg = { id: Date.now(), from: "customer", text, timestamp: now() };
    setCdMessages(prev => [...prev, msg]);
    localStorage.setItem("chat_c2d", JSON.stringify(msg));
  };
  
  const confirmPayment = (mode: string) => {
    setPaymentMode(mode);
    localStorage.setItem("paymentConfirmed", JSON.stringify({ mode, errandId: "SGO-001", ts: Date.now() }));
    setShowPaymentModal(false);
    sendCD(`Payment Mode confirmed: ${mode}`);
    toast.success("Payment confirmed!");
  };
  const sendCR = (text: string) => {
    setCrMessages(prev => [...prev, { id: Date.now(), from: "customer", text, timestamp: now() }]);
  };

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
                    </div>
                    <span className="text-white" style={{ fontSize: "0.9rem", fontWeight: 800, letterSpacing: "0.05em" }}>Company Name</span>
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

                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.82rem" }}>Hi, Jiane Gamboa! 👋</p>
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
                    <div key={service.id} className="bg-white rounded-2xl shadow-sm" style={{ border: "1px solid #F0F0F0" }}>
                      <button
                        onClick={() => { 
                          setSelectedService(service.name);
                          setMerchantReqSelected(null);
                          setMerchantReqSearch("");
                          setShowMerchantReqModal(false);
                          setCdChatOpen(true);
                        }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl text-left"
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
                    </div>
                  );
                })}
              </div>

              {/* Promo Banner */}
              <div className="mx-4 mb-4 p-4 rounded-2xl overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${PINK}, #FF8C69)` }}>
                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white opacity-10" />
                <p className="text-white" style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em" }}>LIMITED OFFER</p>
                <p className="text-white" style={{ fontSize: "1rem", fontWeight: 800, lineHeight: 1.2, marginTop: 2 }}>First Pabili order?<br />FREE delivery!</p>
                <button
                  onClick={() => { setSelectedService("Pabili"); setCdChatOpen(true); toast.success("Promo applied! 🎉", { description: "Your first Pabili order gets FREE delivery." }); }}
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
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={() => { setCrChatOpen(true); }}
                            className="flex items-center gap-1 px-3 py-1 rounded-full"
                            style={{ background: "#ECFDF5", color: "#059669", fontSize: "0.72rem", fontWeight: 600 }}
                          >
                            <MessageCircle size={12} /> Chat Rider
                          </button>
                          <button
                            onClick={() => setNavTab("track")}
                            className="flex items-center gap-1 px-3 py-1 rounded-full"
                            style={{ background: PINK_LIGHT, color: PINK, fontSize: "0.72rem", fontWeight: 600 }}
                          >
                            <Navigation size={12} /> Track
                          </button>
                        </div>
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
        {/* ── CUSTOMER ↔ DISPATCHER CHAT MODAL ── */}
        {cdChatOpen && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", display: "flex", flexDirection: "column", maxHeight: "85%", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ background: PINK, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>💬 Chat with Dispatcher</p>
                    <p style={{ color: "#FECACA", fontSize: "0.72rem" }}>{selectedService} Order Request</p>
                  </div>
                  <button onClick={() => setCdChatOpen(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}>✕</button>
                </div>
                {/* Customer Details */}
                {customer && (
                  <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 10px", marginTop: 8 }}>
                    <p style={{ color: "#fff", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><User size={12} /> {customer.name}</p>
                    <p style={{ color: "#fff", fontSize: "0.7rem", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}><Phone size={12} /> {customer.phone}</p>
                    <p style={{ color: "#fff", fontSize: "0.7rem", marginTop: 2, display: "flex", alignItems: "center", gap: 4, lineHeight: 1.2 }}><MapPin size={12} style={{ flexShrink: 0 }} /> {customer.address}</p>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div ref={cdBodyRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {cdMessages.length === 0 && (
                  <p style={{ color: "#9CA3AF", fontSize: "0.78rem", textAlign: "center", marginTop: 20 }}>No messages yet. Describe your order!</p>
                )}
                {cdMessages.map((msg: ChatMessage) => (
                  <div key={msg.id} style={{ display: "flex", justifyContent: msg.from === "customer" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "75%", padding: "8px 12px", borderRadius: msg.from === "customer" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.from === "customer" ? PINK : "#F3F4F6", color: msg.from === "customer" ? "#fff" : "#1F2937", fontSize: "0.82rem" }}>
                      <p>{msg.text}</p>
                      <p style={{ fontSize: "0.62rem", color: msg.from === "customer" ? "#FECACA" : "#9CA3AF", marginTop: 3, textAlign: "right" }}>{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div style={{ padding: "6px 14px", display: "flex", gap: 6, overflowX: "auto" }}>
                {["I need help with my order", `${selectedService} request`].map(t => (
                  <button key={t} onClick={() => sendCD(t)}
                    style={{ flexShrink: 0, padding: "4px 10px", borderRadius: 20, border: `1px solid ${PINK}`, background: PINK_LIGHT, color: PINK, fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                  >{t}</button>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding: "10px 12px", borderTop: "1px solid #E5E7EB", display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={() => setShowMerchantReqModal(true)}
                  style={{ background: "#F3F4F6", border: "none", borderRadius: 20, padding: "8px 12px", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, color: "#374151" }}
                  title="Select Merchant"
                >
                  🏪
                </button>
                <input
                  ref={cdInputRef}
                  placeholder="Type your message..."
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 20, border: "1px solid #D1D5DB", fontSize: "0.82rem", outline: "none" }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter" && cdInputRef.current?.value.trim()) {
                      sendCD(cdInputRef.current.value.trim());
                      cdInputRef.current.value = "";
                    }
                  }}
                />
                <button
                  style={{ background: PINK, color: "#fff", border: "none", borderRadius: 20, padding: "8px 16px", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}
                  onClick={() => { if (cdInputRef.current?.value.trim()) { sendCD(cdInputRef.current.value.trim()); cdInputRef.current.value = ""; } }}
                >Send</button>
              </div>

              {/* Merchant Request Modal inside Chat */}
              {showMerchantReqModal && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 70, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                  <div style={{ background: "#fff", borderRadius: "16px 16px 0 0", padding: "16px", display: "flex", flexDirection: "column", maxHeight: "80%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#111827", margin: 0 }}>Request from Merchant</h3>
                      <button onClick={() => setShowMerchantReqModal(false)} style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer" }}><X size={20} /></button>
                    </div>

                    <p style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 600, marginBottom: 8 }}>Select Merchant (optional)</p>
                    <input
                      value={merchantReqSearch}
                      onChange={e => { setMerchantReqSearch(e.target.value); setMerchantReqSelected(null); }}
                      placeholder="Search merchant..."
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #D1D5DB", fontSize: "0.85rem", outline: "none", boxSizing: "border-box", marginBottom: 8 }}
                    />
                    
                    {merchantReqSearch && merchantReqSelected === null && filteredReqMerchants.length > 0 && (
                      <div style={{ maxHeight: 150, overflowY: "auto", border: "1px solid #E5E7EB", borderRadius: 12, marginBottom: 12 }}>
                        {filteredReqMerchants.map(m => (
                          <button
                            key={m.id}
                            onClick={() => { setMerchantReqSelected(m.id); setMerchantReqSearch(m.businessName); }}
                            style={{ width: "100%", textAlign: "left", padding: "10px 12px", background: "transparent", border: "none", borderBottom: "1px solid #F3F4F6", cursor: "pointer", fontSize: "0.8rem", color: "#111827" }}
                          >
                            <span style={{ fontWeight: 600 }}>{m.businessName}</span>
                            <span style={{ color: "#9CA3AF", fontSize: "0.75rem", marginLeft: 6 }}>{m.barangay}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <p style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 600, marginBottom: 8, marginTop: 8 }}>What to Buy / Do</p>
                    <textarea
                      value={merchantReqInput}
                      onChange={e => setMerchantReqInput(e.target.value)}
                      placeholder="e.g. Please buy 2 packs of sugar..."
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #D1D5DB", fontSize: "0.85rem", outline: "none", boxSizing: "border-box", minHeight: "80px", resize: "none", marginBottom: 16 }}
                    />

                    <button
                      onClick={() => {
                        const merchantText = merchantReqSelected ? `[Merchant: ${merchantReqSearch}]\n` : "";
                        const reqText = merchantReqInput.trim();
                        if (reqText) {
                          sendCD(`${merchantText}${reqText}`);
                          setShowMerchantReqModal(false);
                          setMerchantReqInput("");
                          setMerchantReqSelected(null);
                          setMerchantReqSearch("");
                        } else {
                          toast.error("Please enter what to buy/do.");
                        }
                      }}
                      style={{ width: "100%", padding: "12px", borderRadius: 24, background: PINK, color: "#fff", fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: "pointer" }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Request Modal from Dispatcher */}
              {showPaymentModal && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ background: "#fff", borderRadius: 24, padding: "24px", width: "85%", maxWidth: 320, textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
                    <div style={{ width: 48, height: 48, background: PINK_LIGHT, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <CreditCard size={24} style={{ color: PINK }} />
                    </div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1F2937", marginBottom: 8 }}>Select Payment Mode</h3>
                    <p style={{ fontSize: "0.8rem", color: "#6B7280", marginBottom: 24 }}>The dispatcher needs your payment preference to assign a rider.</p>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {["Cash on Delivery", "GCash", "Bank Transfer"].map(mode => (
                        <button
                          key={mode}
                          onClick={() => confirmPayment(mode)}
                          style={{ padding: "12px", borderRadius: 12, border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#374151", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* ── CUSTOMER ↔ RIDER CHAT MODAL ── */}
        {crChatOpen && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", display: "flex", flexDirection: "column", maxHeight: "80%", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ background: "#059669", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>💬 Chat with Rider</p>
                  <p style={{ color: "#A7F3D0", fontSize: "0.72rem" }}>Mario Santos · On the way to you</p>
                </div>
                <button onClick={() => setCrChatOpen(false)} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, padding: "4px 10px", cursor: "pointer" }}>✕</button>
              </div>
              {/* Messages */}
              <div ref={crBodyRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {crMessages.length === 0 && (
                  <p style={{ color: "#9CA3AF", fontSize: "0.78rem", textAlign: "center", marginTop: 20 }}>No messages yet.</p>
                )}
                {crMessages.map((msg: ChatMessage) => (
                  <div key={msg.id} style={{ display: "flex", justifyContent: msg.from === "customer" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "75%", padding: "8px 12px", borderRadius: msg.from === "customer" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.from === "customer" ? "#059669" : "#F3F4F6", color: msg.from === "customer" ? "#fff" : "#1F2937", fontSize: "0.82rem" }}>
                      <p>{msg.text}</p>
                      <p style={{ fontSize: "0.62rem", color: msg.from === "customer" ? "#A7F3D0" : "#9CA3AF", marginTop: 3, textAlign: "right" }}>{msg.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Input */}
              <div style={{ padding: "10px 12px", borderTop: "1px solid #E5E7EB", display: "flex", gap: 8 }}>
                <input
                  ref={crInputRef}
                  placeholder="Message your rider..."
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 20, border: "1px solid #D1D5DB", fontSize: "0.82rem", outline: "none" }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter" && crInputRef.current?.value.trim()) {
                      sendCR(crInputRef.current.value.trim());
                      crInputRef.current.value = "";
                    }
                  }}
                />
                <button
                  style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 20, padding: "8px 16px", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}
                  onClick={() => { if (crInputRef.current?.value.trim()) { sendCR(crInputRef.current.value.trim()); crInputRef.current.value = ""; } }}
                >Send</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}