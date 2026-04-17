import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ShoppingCart, Package, CreditCard, MapPin, Phone, Clock,
  Bell, ChevronRight, Search, Star, CheckCircle, Bike,
  LogOut, Home, ClipboardList, User, Navigation, Plus,
  ArrowLeft, X, ChevronDown, AlertCircle, Zap, MessageCircle, Gift
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
  { label: "Items Purchased", done: true, time: "10:48 AM" },
  { label: "En Route to You", done: true, time: "10:52 AM" },
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
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead, dismiss } = useNotifications(customerNotifications);

  // ── Messaging state ──
  const [cdChatOpen, setCdChatOpen] = useState(false);
  const [crChatOpen, setCrChatOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

  // New State for Merchant Request Modal in Chat
  const [showMerchantReqModal, setShowMerchantReqModal] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [catItems, setCatItems] = useState<Record<string, string[]>>({});

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
        } catch (err) { }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const now = () => { const d = new Date(); const h = d.getHours(); const m = String(d.getMinutes()).padStart(2, "0"); return `${h > 12 ? h - 12 : h}:${m} ${h >= 12 ? "PM" : "AM"}`; };

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
                    <div className="w-8 h-8 rounded-xl bg-white bg-opacity-25 flex items-center justify-center">
                      <Package size={18} className="text-white" />
                    </div>
                    <span className="text-white" style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "0.08em" }}>Company Name</span>
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
            <div className="flex-1 overflow-y-auto" style={{ marginTop: 10 }}>
              {/* Service Cards */}
              <div className="px-4 space-y-3 mb-4">
                {serviceTypes.map((service) => {
                  const Icon = service.icon;
                  return (
                    <div key={service.id} className="bg-white rounded-2xl shadow-sm" style={{ border: "1px solid #F0F0F0" }}>
                      <button
                        onClick={() => {
                          setSelectedService(service.name);
                          setSelectedCats([]);
                          setCatItems({});
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
                        <div className="text-right flex flex-col items-end justify-center">
                          <p style={{ color: "#1F2937", fontSize: "0.85rem", fontWeight: 700, marginBottom: 2 }}>{o.total}</p>
                          <span className="px-2 py-0.5 rounded-full inline-block" style={{ background: sc.bg, color: sc.text, fontSize: "0.62rem", fontWeight: 600 }}>{o.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
              {/* Map simulation */}
              <div
                className="w-full rounded-2xl overflow-hidden relative shadow-inner"
                style={{ height: 200, border: "1px solid #E5E7EB", background: "#f8f9fa" }}
              >
                {/* Authentic Map Embed */}
                <iframe
                  width="100%"
                  height="100%"
                  className="absolute inset-0 pointer-events-none"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=124.6644%2C6.671%2C124.7077%2C6.7034&layer=mapnik&marker=6.6872%2C124.6861"
                  style={{ border: 0, filter: "opacity(0.85) sepia(0.1) hue-rotate(-10deg)" }}
                ></iframe>
                {/* Light overlay for better text contrast */}
                <div className="absolute inset-0 bg-white/30 pointer-events-none" />

                {/* Animated Path */}
                <svg className="absolute inset-0 w-full h-full">
                  <path d="M 50 150 Q 150 50 250 130 T 350 80" stroke="#F62459" strokeWidth="3" fill="transparent" strokeDasharray="8 4" />
                </svg>

                {/* Rider Icon */}
                <div className="absolute animate-bounce" style={{ left: "65%", top: "45%" }}>
                  <div className="relative">
                    <div className="absolute -inset-4 bg-pink-500/20 rounded-full animate-ping" />
                    <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-pink-500">
                      <Bike size={20} className="text-pink-500" />
                    </div>
                    <div className="absolute -top-10 -left-1/2 bg-gray-900 text-white text-[0.6rem] px-2 py-1 rounded-lg whitespace-nowrap font-bold">
                      RIDER ON THE MOVE
                    </div>
                  </div>
                </div>

                {/* Destination */}
                <div className="absolute" style={{ left: "85%", top: "25%" }}>
                  <MapPin size={24} className="text-gray-900 fill-gray-900" />
                </div>

                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white shadow-sm z-10 border border-gray-100">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span style={{ color: "#374151", fontSize: "0.7rem", fontWeight: 700 }}>Live Updates</span>
                </div>
              </div>

              {/* Rider Card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm" style={{ border: "1px solid #F0F0F0" }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: "#1E3A5F", fontWeight: 700 }}>MS</div>
                  <div className="flex-1">
                    <p style={{ color: "#1F2937", fontSize: "0.9rem", fontWeight: 700 }}>Mario Santos</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} fill={s <= 4 ? "#F59E0B" : "transparent"} style={{ color: "#F59E0B" }} />)}
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

              {/* DEMO: Simulate Completion */}
              <button
                onClick={() => setShowRatingModal(true)}
                className="w-full py-3 rounded-2xl text-white font-bold text-sm shadow-lg shadow-pink-100 transition-transform active:scale-95"
                style={{ background: PINK }}
              >
                🏁 Simulate Order Completion
              </button>
            </div>
          </>
        )}

        {/* ── ACCOUNT TAB ── */}
        {navTab === "account" && (
          <>
            <div className="flex-shrink-0" style={{ background: `linear-gradient(160deg, ${PINK} 0%, #FF6B8A 60%, #FECDD3 85%, #FFFFFF 100%)` }}>
              <div className="px-5 pt-10 pb-10 text-center">
                <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center mx-auto mb-3 shadow-md" style={{ background: PINK_DARK }}>
                  <span className="text-white" style={{ fontSize: "1.5rem", fontWeight: 800 }}>JG</span>
                </div>
                <p className="text-white" style={{ fontSize: "1.1rem", fontWeight: 700 }}>Jiane Gamboa</p>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.8rem" }}>jianegamboa@gmail.com</p>
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

              <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid #F0F0F0" }}>
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

              {/* Notification History (REQ034) */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid #F0F0F0" }}>
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                  <Bell size={14} className="text-gray-400" />
                  <span className="text-[0.7rem] font-bold text-gray-500 uppercase tracking-wider">Notification History</span>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-400 text-xs italic">No past notifications.</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-3 border-b border-gray-50 last:border-0 flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                          <Bell size={14} className="text-pink-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.8rem] font-bold text-gray-800 leading-tight">{n.title}</p>
                          <p className="text-[0.72rem] text-gray-500 mt-0.5">{n.message}</p>
                          <p className="text-[0.6rem] text-gray-400 mt-1">{n.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {[
                { label: "Edit Profile", icon: User, action: () => toast.info("Profile editor coming soon!") },
                { label: "Saved Addresses", icon: MapPin, action: () => toast.info("Saved addresses coming soon!") },
                { label: "Notifications", icon: Bell, action: () => toast.success("Notifications are enabled for your account.") },
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

              {/* Input area: 2-row layout */}
              <div style={{ borderTop: "1px solid #E5E7EB", padding: "8px 12px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
                {/* Row 1: shortcut buttons */}
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setShowMerchantReqModal(true)}
                    style={{ display: "flex", alignItems: "center", gap: 5, background: "#FFF0F5", border: `1px solid ${PINK}44`, borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, color: PINK }}
                  >
                    <Gift size={14} /> Request
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    style={{ display: "flex", alignItems: "center", gap: 5, background: "#F0FDF4", border: "1px solid #6EE7B744", borderRadius: 20, padding: "6px 12px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, color: "#059669" }}
                    title="Payment Mode"
                  >
                    <CreditCard size={14} /> Payment Mode
                  </button>
                </div>
                {/* Row 2: text input + Send */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
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
                    onClick={() => { if (cdInputRef.current?.value.trim()) { sendCD(cdInputRef.current.value.trim()); cdInputRef.current.value = ""; } }}
                    style={{ background: PINK, color: "#fff", border: "none", borderRadius: 20, padding: "8px 18px", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", flexShrink: 0 }}
                  >Send</button>
                </div>
              </div>

              {showMerchantReqModal && (() => {
                const CAT_ICONS: Record<string, string> = {
                  "Retail Store": "🛒", "Restaurant": "🍽️", "Pharmacy": "💊",
                  "Department Store": "🏬", "Convenience Store": "🏪", "Cafés": "☕",
                  "Bakery": "🥐", "Remittance": "💸", "Banks": "🏦",
                  "Food Stalls": "🥘", "Frozen Goods": "🧊", "Other": "📦",
                };
                const ALL_CATS = Object.keys(CAT_ICONS);

                const toggleCat = (cat: string) => {
                  setSelectedCats(prev => {
                    if (prev.includes(cat)) {
                      setCatItems(ci => { const n = { ...ci }; delete n[cat]; return n; });
                      return prev.filter(c => c !== cat);
                    }
                    if (prev.length >= 3) { toast.error("You can select up to 3 categories only."); return prev; }
                    setCatItems(ci => ({ ...ci, [cat]: [""] }));
                    return [...prev, cat];
                  });
                };

                const addItem = (cat: string) =>
                  setCatItems(ci => ({ ...ci, [cat]: [...(ci[cat] ?? []), ""] }));

                const updateItem = (cat: string, idx: number, val: string) =>
                  setCatItems(ci => { const arr = [...(ci[cat] ?? [])]; arr[idx] = val; return { ...ci, [cat]: arr }; });

                const removeItem = (cat: string, idx: number) =>
                  setCatItems(ci => { const arr = (ci[cat] ?? []).filter((_, i) => i !== idx); return { ...ci, [cat]: arr.length ? arr : [""] }; });

                const handleSend = () => {
                  if (selectedCats.length === 0) { toast.error("Please select at least one category."); return; }
                  const hasAnyItem = selectedCats.some(cat => (catItems[cat] ?? []).some(i => i.trim()));
                  if (!hasAnyItem) { toast.error("Please add at least one item."); return; }
                  const lines = selectedCats.map(cat => {
                    const items = (catItems[cat] ?? []).filter(i => i.trim());
                    return `${CAT_ICONS[cat]} ${cat}:\n${items.map((it, i) => `  ${i + 1}. ${it}`).join("\n")}`;
                  });
                  sendCD(`🛒 Order Request:\n${lines.join("\n\n")}`);
                  setShowMerchantReqModal(false);
                  setSelectedCats([]); setCatItems({});
                };

                const closeModal = () => { setShowMerchantReqModal(false); setSelectedCats([]); setCatItems({}); };

                return (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 70, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", display: "flex", flexDirection: "column", maxHeight: "90%", overflow: "hidden" }}>
                      <div style={{ background: PINK, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                        <div>
                          <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>🤝 Place an Order</p>
                          <p style={{ color: "#FECACA", fontSize: "0.72rem" }}>Select up to 3 categories • Add items per category</p>
                        </div>
                        <button onClick={closeModal} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: "1rem" }}>✕</button>
                      </div>
                      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>
                          <p style={{ color: "#374151", fontSize: "0.78rem", fontWeight: 700, marginBottom: 8 }}>Step 1 — Select Categories</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                            {ALL_CATS.map(cat => (
                              <button key={cat} onClick={() => toggleCat(cat)} disabled={!selectedCats.includes(cat) && selectedCats.length >= 3} style={{ padding: "7px 13px", borderRadius: 24, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", background: selectedCats.includes(cat) ? PINK : "#F9FAFB", color: selectedCats.includes(cat) ? "#fff" : "#374151", border: "1.5px solid #E5E7EB" }}>
                                {CAT_ICONS[cat]} {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                        {selectedCats.map(cat => (
                          <div key={cat} style={{ background: "#FFF5F7", borderRadius: 14, padding: "12px", border: `1.5px solid ${PINK}22` }}>
                            <p style={{ color: PINK, fontSize: "0.8rem", fontWeight: 700, marginBottom: 8 }}>{CAT_ICONS[cat]} {cat}</p>
                            {(catItems[cat] ?? [""]).map((item, idx) => (
                              <div key={idx} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                                <input value={item} onChange={e => updateItem(cat, idx, e.target.value)} placeholder={`Item ${idx + 1}...`} style={{ flex: 1, padding: "7px", borderRadius: 10, border: "1px solid #E5E7EB", fontSize: "0.82rem" }} />
                                {(catItems[cat] ?? []).length > 1 && <button onClick={() => removeItem(cat, idx)} style={{ color: "#EF4444" }}>×</button>}
                              </div>
                            ))}
                            <button onClick={() => addItem(cat)} style={{ color: PINK, fontSize: "0.75rem" }}>+ Add item</button>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: "14px", borderTop: "1px solid #F3F4F6" }}>
                        <button onClick={handleSend} style={{ width: "100%", padding: "13px", borderRadius: 24, background: PINK, color: "#fff", fontWeight: 700 }}>Send Request</button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Payment Request Modal */}
              {showPaymentModal && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ background: "#fff", borderRadius: 24, padding: "24px", width: "85%", maxWidth: 320, textAlign: "center" }}>
                    <div style={{ width: 48, height: 48, background: PINK_LIGHT, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                      <CreditCard size={24} style={{ color: PINK }} />
                    </div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>Select Payment Mode</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {["Cash on Delivery", "GCash", "Bank Transfer"].map(mode => (
                        <button key={mode} onClick={() => confirmPayment(mode)} style={{ padding: "12px", borderRadius: 12, border: "1px solid #E5E7EB", background: "#F9FAFB", fontWeight: 600 }}>{mode}</button>
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
              <div style={{ background: "#059669", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>💬 Chat with Rider</p>
                  <p style={{ color: "#A7F3D0", fontSize: "0.72rem" }}>Mario Santos · On the way to you</p>
                </div>
                <button onClick={() => setCrChatOpen(false)} style={{ color: "#fff" }}>✕</button>
              </div>
              <div ref={crBodyRef} style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                {crMessages.map((msg: ChatMessage) => (
                  <div key={msg.id} style={{ display: "flex", justifyContent: msg.from === "customer" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "75%", padding: "8px 12px", borderRadius: "16px", background: msg.from === "customer" ? "#059669" : "#F3F4F6", color: msg.from === "customer" ? "#fff" : "#1F2937", fontSize: "0.82rem" }}>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 12px", borderTop: "1px solid #E5E7EB", display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  ref={crInputRef}
                  placeholder="Message your rider..."
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 20, border: "1px solid #D1D5DB", outline: "none", fontSize: "0.82rem" }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter" && crInputRef.current?.value.trim()) {
                      sendCR(crInputRef.current.value.trim());
                      crInputRef.current.value = "";
                    }
                  }}
                />
                <button
                  onClick={() => { if (crInputRef.current?.value.trim()) { sendCR(crInputRef.current.value.trim()); crInputRef.current.value = ""; } }}
                  style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 20, padding: "8px 18px", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", flexShrink: 0 }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── RATING MODAL (REQ033, REQ036) ── */}
        {showRatingModal && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl border border-white/20">
              <div className="p-8 text-center text-gray-800">
                <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4 text-pink-600">
                  <Star size={32} fill="currentColor" />
                </div>
                <h3 className="font-extrabold text-xl mb-1">Rate Your Errand</h3>
                <p className="text-gray-500 text-xs mb-6 px-4 leading-relaxed">How was your experience with Mario Santos? Your feedback helps us improve.</p>
                <div className="flex justify-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-95 duration-100">
                      <Star size={32} fill={s <= rating ? PINK : "transparent"} stroke={s <= rating ? PINK : "#D1D5DB"} strokeWidth={s <= rating ? 0 : 2} />
                    </button>
                  ))}
                </div>
                <textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Tell us more about the service (optional)..." className="w-full h-24 p-4 rounded-2xl bg-gray-50 border border-gray-100 text-sm outline-none mb-6 resize-none" />
                <div className="flex flex-col gap-2">
                  <button disabled={rating === 0} onClick={() => { toast.success("Thank you for your feedback! ❤️"); setShowRatingModal(false); setRating(0); setReview(""); }} className="w-full py-4 rounded-2xl text-white font-black text-sm shadow-lg shadow-pink-200 uppercase tracking-widest" style={{ background: PINK }}>Submit Feedback</button>
                  <button onClick={() => setShowRatingModal(false)} className="py-2 text-gray-400 text-[0.7rem] font-bold">Skip for now</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}