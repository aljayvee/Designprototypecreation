// @refresh reset
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  LayoutDashboard, Users, Bike, ClipboardList, BarChart2, Settings,
  LogOut, Bell, Search, TrendingUp, Package, DollarSign,
  CheckCircle, Clock, AlertTriangle, AlertCircle, XCircle, Menu, X, Plus, Edit2,
  Trash2, Download, Printer, Eye, RefreshCw, Star, Save,
  Phone, Shield, ToggleLeft, ToggleRight, Building2, Calendar as CalendarIcon, Store, ChevronDown, ChevronUp,
  MapPin, FileText, Tag, ChevronLeft, ChevronRight, MoreHorizontal
} from "lucide-react";
import { cn } from "./ui/utils";
import {
  format, subDays, subWeeks, subMonths, subYears,
  startOfToday, startOfYesterday, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, startOfYear, endOfYear,
  sub, differenceInDays, startOfDay, endOfDay
} from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar as CalendarUI } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "./ui/select";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import {
  riders, errands, customers, revenueData, weeklyData, serviceTypeData,
  rateConfig,
  Errand, Rider, Customer, ErrandStatus, MerchantCategory
} from "./mockData";
import { NotificationPanel, useNotifications, ownerNotifications } from "./NotificationPanel";
import { toast, Toaster } from "sonner";

const NAVY = "#1E3A5F";
const NAVY_DARK = "#162D4A";
const NAVY_LIGHT = "#2D5F8A";

const statusConfig: Record<ErrandStatus, { label: string; bg: string; text: string }> = {
  Pending: { label: "Pending", bg: "#FEF3C7", text: "#92400E" },
  Assigned: { label: "Assigned", bg: "#DBEAFE", text: "#1E40AF" },
  Traveling: { label: "Traveling", bg: "#EDE9FE", text: "#5B21B6" },
  "At Store": { label: "At Store", bg: "#FEF3C7", text: "#B45309" },
  Purchased: { label: "Purchased", bg: "#DBEAFE", text: "#1D4ED8" },
  "En Route": { label: "En Route", bg: "#D1FAE5", text: "#065F46" },
  Delivered: { label: "Delivered", bg: "#D1FAE5", text: "#065F46" },
  Cancelled: { label: "Cancelled", bg: "#FEE2E2", text: "#991B1B" },
};

const riderStatusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  Available: { bg: "#D1FAE5", text: "#065F46", dot: "#10B981" },
  "On Errand": { bg: "#DBEAFE", text: "#1E40AF", dot: "#3B82F6" },
  Offline: { bg: "#F3F4F6", text: "#6B7280", dot: "#9CA3AF" },
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "errands", label: "Errand Management", icon: ClipboardList },
  { id: "users", label: "User Management", icon: Users },
  { id: "riders", label: "Rider Management", icon: Bike },
  { id: "merchants", label: "Merchant Category", icon: Store },
  { id: "rates", label: "Rate Management", icon: DollarSign },
  { id: "reports", label: "Reports", icon: BarChart2 },
  { id: "tracking", label: "Rider Tracking", icon: MapPin },
  { id: "settings", label: "Settings", icon: Settings },
];

function StatusBadge({ status }: { status: ErrandStatus }) {
  const cfg = statusConfig[status];
  return (
    <span className="px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.text, fontSize: "0.72rem", fontWeight: 600 }}>
      {cfg.label}
    </span>
  );
}

function MetricCard({ title, value, sub, icon: Icon, color }: { title: string; value: string; sub: string; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
      <div className="flex items-start justify-between">
        <div>
          <p style={{ color: "#6B7280", fontSize: "0.8rem" }}>{title}</p>
          <p className="mt-1" style={{ color: "#1F2937", fontSize: "1.8rem", fontWeight: 700, lineHeight: 1.2 }}>{value}</p>
          <p className="mt-1" style={{ color: "#6B7280", fontSize: "0.75rem" }}>{sub}</p>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: color + "20" }}>
          <Icon size={22} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

// ─── SECTIONS ───────────────────────────────────────────────────────────────

function DashboardSection({ onViewAll }: { onViewAll?: () => void }) {
  const activeRiders = riders.filter(r => r.status !== "Offline").length;
  const offlineRiders = riders.filter(r => r.status === "Offline").length;
  const pendingErrands = errands.filter(e => e.status === "Pending").length;
  const activeErrands = errands.filter(e => ["Assigned", "Traveling", "At Store", "Purchased", "En Route"].includes(e.status)).length;
  const deliveredToday = errands.filter(e => e.status === "Delivered").length;
  const todayRevenue = errands.filter(e => e.status === "Delivered").reduce((s, e) => s + e.serviceFee + (e.commission || 0) + (e.surcharge || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard title="Active Riders" value={String(activeRiders)} sub={`${offlineRiders} offline`} icon={Bike} color="#3B82F6" />
        <MetricCard title="Pending Errands" value={String(pendingErrands)} sub="Awaiting dispatch" icon={Clock} color="#F59E0B" />
        <MetricCard title="Active Errands" value={String(activeErrands)} sub="Currently in progress" icon={Package} color="#8B5CF6" />
        <MetricCard title="Completed Total" value={String(deliveredToday * 12)} sub="Successfully fulfilled" icon={CheckCircle} color="#10B981" />
        <MetricCard title="Sugo Share" value={`₱${(todayRevenue * 0.4).toLocaleString()}`} sub="Commission & Fees" icon={TrendingUp} color="#1E3A5F" />
        <MetricCard title="Rider Share" value={`₱${(todayRevenue * 0.6).toLocaleString()}`} sub="Base Fees & Tips" icon={DollarSign} color="#10B981" />
      </div>

      <div className="flex items-center gap-2 mb-2">
        {["Today", "Week", "Month", "Year"].map(t => (
          <button key={t} className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{ 
              background: "Today" === t ? NAVY : "#fff", 
              color: "Today" === t ? "#fff" : "#6B7280",
              border: `1px solid ${"Today" === t ? NAVY : "#E5E7EB"}`
            }}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ color: "#1F2937" }}>Today's Revenue</h3>
              <p style={{ color: "#6B7280", fontSize: "0.8rem" }}>Hourly breakdown — Monday, March 23</p>
            </div>
            <span className="px-3 py-1 rounded-full" style={{ background: "#DBEAFE", color: "#1E40AF", fontSize: "0.75rem" }}>Live</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={NAVY} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={NAVY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
              <Tooltip formatter={(v: any) => [`₱${v}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke={NAVY} fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
          <h3 className="mb-1" style={{ color: "#1F2937" }}>Service Breakdown</h3>
          <p className="mb-3" style={{ color: "#6B7280", fontSize: "0.8rem" }}>By errand type today</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={serviceTypeData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                {serviceTypeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [`${v}%`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {serviceTypeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                  <span style={{ color: "#374151", fontSize: "0.78rem" }}>{item.name}</span>
                </div>
                <span style={{ color: "#1F2937", fontSize: "0.78rem", fontWeight: 600 }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
        <h3 className="mb-1" style={{ color: "#1F2937" }}>Weekly Performance</h3>
        <p className="mb-4" style={{ color: "#6B7280", fontSize: "0.8rem" }}>Revenue trend — current week</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
            <Tooltip formatter={(v: any) => [`₱${v}`, "Revenue"]} />
            <Bar dataKey="revenue" fill={NAVY} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid #F3F4F6" }}>
          <h3 style={{ color: "#1F2937" }}>Recent Errand Activity</h3>
          <span
            style={{ color: NAVY, fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}
            onClick={onViewAll}
          >
            View all →
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["ID", "Type", "Customer", "Rider", "Status", "Amount", "Fee", "Time"].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ color: "#6B7280", fontSize: "0.75rem", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {errands.slice(0, 6).map((e, i) => (
                <tr key={e.id} style={{ borderTop: i > 0 ? "1px solid #F3F4F6" : "none" }}>
                  <td className="px-4 py-3" style={{ color: NAVY, fontSize: "0.8rem", fontWeight: 600 }}>{e.id}</td>
                  <td className="px-4 py-3" style={{ color: "#374151", fontSize: "0.8rem" }}>{e.type}</td>
                  <td className="px-4 py-3" style={{ color: "#374151", fontSize: "0.8rem" }}>{e.customer}</td>
                  <td className="px-4 py-3" style={{ color: "#374151", fontSize: "0.8rem" }}>{e.riderName || <span style={{ color: "#D97706" }}>Unassigned</span>}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status as ErrandStatus} /></td>
                  <td className="px-4 py-3" style={{ color: "#1F2937", fontSize: "0.8rem" }}>₱{e.amount.toLocaleString()}</td>
                  <td className="px-4 py-3" style={{ color: "#10B981", fontSize: "0.8rem", fontWeight: 600 }}>₱{e.serviceFee}</td>
                  <td className="px-4 py-3" style={{ color: "#6B7280", fontSize: "0.8rem" }}>{e.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ErrandsSection() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const filtered = errands.filter(e =>
    (statusFilter === "All" || e.status === statusFilter) &&
    (e.customer.toLowerCase().includes(search.toLowerCase()) || e.id.includes(search))
  );
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {["All", "Pending", "Assigned", "En Route", "Delivered", "Cancelled"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1.5 rounded-full transition-all"
              style={{
                background: statusFilter === s ? NAVY : "#F3F4F6",
                color: statusFilter === s ? "#fff" : "#374151",
                fontSize: "0.78rem",
                fontWeight: 500,
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search errands..."
            className="pl-9 pr-4 py-2 rounded-xl outline-none"
            style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "0.8rem", color: "#1F2937", width: 220 }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["Errand ID", "Type", "Customer", "Address", "Payment", "Rider", "Status", "Amount", "Service Fee", "Time"].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap" style={{ color: "#6B7280", fontSize: "0.72rem", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={e.id} style={{ borderTop: i > 0 ? "1px solid #F9FAFB" : "none" }} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3" style={{ color: NAVY, fontSize: "0.8rem", fontWeight: 700 }}>{e.id}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded" style={{ background: e.type === "Pabili" ? "#DBEAFE" : e.type === "Padala" ? "#D1FAE5" : "#FEF3C7", color: e.type === "Pabili" ? "#1E40AF" : e.type === "Padala" ? "#065F46" : "#92400E", fontSize: "0.72rem", fontWeight: 600 }}>{e.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: "#1F2937", fontSize: "0.8rem", fontWeight: 500 }}>{e.customer}</p>
                    <p style={{ color: "#9CA3AF", fontSize: "0.72rem" }}>{e.customerPhone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p style={{ color: "#374151", fontSize: "0.78rem", maxWidth: 160 }}>{e.address}</p>
                    <p style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>{e.landmark}</p>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#374151", fontSize: "0.78rem" }}>{e.paymentMode}</td>
                  <td className="px-4 py-3" style={{ color: e.riderName ? "#1F2937" : "#D97706", fontSize: "0.78rem" }}>{e.riderName || "Unassigned"}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status as ErrandStatus} /></td>
                  <td className="px-4 py-3" style={{ color: "#1F2937", fontSize: "0.8rem", fontWeight: 600 }}>₱{e.amount.toLocaleString()}</td>
                  <td className="px-4 py-3" style={{ color: "#10B981", fontSize: "0.8rem", fontWeight: 600 }}>₱{e.serviceFee}</td>
                  <td className="px-4 py-3" style={{ color: "#6B7280", fontSize: "0.78rem" }}>{e.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersSection() {
  const [userList, setUserList] = useState([
    { id: 1, name: "Aljayvee Versola", role: "Owner", username: "owner", email: "aj.versola@company.ph", phone: "09171234567", status: "Active" },
    { id: 2, name: "Mark Dennis Batcharo", role: "Dispatcher", username: "dispatcher", email: "md.batcharo@company.ph", phone: "09281234567", status: "Active" },
    { id: 3, name: "Al-Dhen Musali", role: "Rider", username: "rider01", email: "ad.musali@company.ph", phone: "09391234567", status: "Active" },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof userList[0] | null>(null);
  const [form, setForm] = useState({ name: "", role: "Rider", username: "", email: "", phone: "", password: "", status: "Active" });
  const [editForm, setEditForm] = useState({ name: "", role: "Rider", username: "", email: "", phone: "", status: "Active" });
  const [formError, setFormError] = useState("");
  const [editError, setEditError] = useState("");
  const [saved, setSaved] = useState(false);
  const [editSaved, setEditSaved] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"add" | "edit" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = userList.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleColors: Record<string, { bg: string; text: string }> = {
    Owner: { bg: "#FEF3C7", text: "#92400E" },
    Dispatcher: { bg: "#DBEAFE", text: "#1E40AF" },
    Rider: { bg: "#EDE9FE", text: "#5B21B6" },
  };

  const openModal = () => {
    setForm({ name: "", role: "Rider", username: "", email: "", phone: "", password: "", status: "Active" });
    setFormError(""); setSaved(false); setShowModal(true);
  };

  const openEditModal = (user: typeof userList[0]) => {
    setEditingUser(user);
    setEditForm({ name: user.name, role: user.role, username: user.username, email: user.email, phone: user.phone, status: user.status });
    setEditError(""); setEditSaved(false); setShowEditModal(true);
  };

  const handleAdd = () => {
    setFormError("");
    if (!form.name.trim() || !form.username.trim() || !form.phone.trim() || !form.password.trim()) {
      setFormError("Please fill in all required fields (Name, Username, Phone, Password).");
      return;
    }
    if (userList.some(u => u.username === form.username.trim())) {
      setFormError("Username already exists. Please choose a different one.");
      return;
    }
    setConfirmAction("add");
    setShowConfirmModal(true);
  };

  const commitAdd = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setUserList(prev => [...prev, { id: prev.length + 1, name: form.name.trim(), role: form.role, username: form.username.trim(), email: form.email.trim(), phone: form.phone.trim(), status: form.status }]);
    setSaved(true);
    toast.success("User added successfully!");
    setTimeout(() => { setSaved(false); setShowModal(false); }, 1400);
  };

  const handleSaveEdit = () => {
    setEditError("");
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      setEditError("Name and Phone are required.");
      return;
    }
    setConfirmAction("edit");
    setShowConfirmModal(true);
  };

  const commitEdit = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setUserList(prev => prev.map(u => u.id === editingUser?.id ? { ...u, ...editForm } : u));
    setEditSaved(true);
    toast.success("User updated successfully!");
    setTimeout(() => { setEditSaved(false); setShowEditModal(false); setEditingUser(null); }, 1200);
  };

  const handleDelete = (id: number, name: string) => {
    setUserList(prev => prev.filter(x => x.id !== id));
    toast.success(`${name} has been removed.`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none"
            style={{ background: "#FFFFFF", border: "1.5px solid #E5E7EB", fontSize: "0.85rem", color: "#1F2937" }}
          />
        </div>
        <button onClick={openModal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white" style={{ background: NAVY, fontSize: "0.85rem" }}>
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
              {["#", "Full Name", "Role", "Username", "Email", "Phone", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left" style={{ color: "#6B7280", fontSize: "0.72rem", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No users found.</td></tr>
            ) : (
              filteredUsers.map((u, i) => {
                const rc = roleColors[u.role] || { bg: "#F3F4F6", text: "#374151" };
                return (
                  <tr key={u.id} style={{ borderTop: i > 0 ? "1px solid #F9FAFB" : "none" }}>
                    <td className="px-4 py-4" style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>{u.id}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: NAVY, fontSize: "0.75rem", fontWeight: 700 }}>
                          {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ color: "#1F2937", fontSize: "0.85rem", fontWeight: 500 }}>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 rounded-full" style={{ background: rc.bg, color: rc.text, fontSize: "0.72rem", fontWeight: 600 }}>{u.role}</span>
                    </td>
                    <td className="px-4 py-4" style={{ color: "#374151", fontSize: "0.82rem" }}>{u.username}</td>
                    <td className="px-4 py-4" style={{ color: "#374151", fontSize: "0.82rem" }}>{u.email || "—"}</td>
                    <td className="px-4 py-4" style={{ color: "#374151", fontSize: "0.82rem" }}>{u.phone}</td>
                    <td className="px-4 py-4">
                      <button 
                        onClick={() => {
                          const newStatus = u.status === "Active" ? "Inactive" : "Active";
                          setUserList(prev => prev.map(x => x.id === u.id ? { ...x, status: newStatus } : x));
                          toast.success(`User set to ${newStatus}`);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
                        style={{ 
                          background: u.status === "Active" ? "#D1FAE5" : "#F3F4F6", 
                          color: u.status === "Active" ? "#065F46" : "#6B7280", 
                          fontSize: "0.72rem", 
                          fontWeight: 700,
                          border: `1.5px solid ${u.status === "Active" ? "#10B981" : "#E5E7EB"}`
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: u.status === "Active" ? "#10B981" : "#9CA3AF" }} />
                        {u.status}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(u)} className="p-1.5 rounded-lg" style={{ background: "#EFF6FF", color: "#2563EB" }}><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(u.id, u.name)} className="p-1.5 rounded-lg" style={{ background: "#FEF2F2", color: "#DC2626" }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add User Modal ── */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5" style={{ background: NAVY }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Users size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white" style={{ fontSize: "0.95rem", fontWeight: 700 }}>Add New User</p>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.72rem" }}>Fill in the user account details below</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ color: "rgba(255,255,255,0.7)" }}><X size={20} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <AlertTriangle size={15} style={{ color: "#EF4444", flexShrink: 0 }} />
                  <p style={{ color: "#DC2626", fontSize: "0.8rem" }}>{formError}</p>
                </div>
              )}
              <div>
                <label className="block mb-1.5" style={{ color: "#374151", fontSize: "0.82rem" }}>Role *</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Owner", "Dispatcher", "Rider"].map(r => {
                    const rc = roleColors[r];
                    return (
                      <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                        className="py-2.5 rounded-xl transition-all"
                        style={{ background: form.role === r ? rc.bg : "#F9FAFB", border: `1.5px solid ${form.role === r ? rc.text : "#E5E7EB"}`, color: form.role === r ? rc.text : "#9CA3AF", fontSize: "0.8rem", fontWeight: form.role === r ? 700 : 400 }}>
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{ label: "Full Name *", key: "name", placeholder: "Juan dela Cruz" }, { label: "Username *", key: "username", placeholder: "jdelacruz" }].map(f => (
                  <div key={f.key}>
                    <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>{f.label}</label>
                    <input value={form[f.key as keyof typeof form]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-xl outline-none"
                      style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[{ label: "Email", key: "email", placeholder: "juan@sugo.ph", type: "email" }, { label: "Phone *", key: "phone", placeholder: "09XXXXXXXXX", type: "text" }].map(f => (
                  <div key={f.key}>
                    <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>{f.label}</label>
                    <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
                      className="w-full px-3 py-2.5 rounded-xl outline-none"
                      style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Password *</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••"
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
                </div>
                <div>
                  <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }}>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Suspended</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl" style={{ border: "1.5px solid #E5E7EB", color: "#374151", fontSize: "0.85rem" }}>Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: saved ? "#10B981" : NAVY, fontSize: "0.85rem", fontWeight: 600 }}>
                {saved ? <><CheckCircle size={16} /> User Added!</> : <><Save size={16} /> Save User</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5" style={{ background: "#2563EB" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <Edit2 size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white" style={{ fontSize: "0.95rem", fontWeight: 700 }}>Edit User</p>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.72rem" }}>Updating — {editingUser.name}</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ color: "rgba(255,255,255,0.7)" }}><X size={20} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {editError && (
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <AlertTriangle size={15} style={{ color: "#EF4444", flexShrink: 0 }} />
                  <p style={{ color: "#DC2626", fontSize: "0.8rem" }}>{editError}</p>
                </div>
              )}
              <div>
                <label className="block mb-1.5" style={{ color: "#374151", fontSize: "0.82rem" }}>Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Owner", "Dispatcher", "Rider"].map(r => {
                    const rc = roleColors[r];
                    return (
                      <button key={r} type="button" onClick={() => setEditForm({ ...editForm, role: r })}
                        className="py-2.5 rounded-xl transition-all"
                        style={{ background: editForm.role === r ? rc.bg : "#F9FAFB", border: `1.5px solid ${editForm.role === r ? rc.text : "#E5E7EB"}`, color: editForm.role === r ? rc.text : "#9CA3AF", fontSize: "0.8rem", fontWeight: editForm.role === r ? 700 : 400 }}>
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Full Name *</label>
                  <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
                </div>
                <div>
                  <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Username</label>
                  <input value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Email</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
                </div>
                <div>
                  <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Phone *</label>
                  <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl outline-none"
                    style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }} />
                </div>
              </div>
              <div>
                <label className="block mb-1" style={{ color: "#374151", fontSize: "0.82rem" }}>Status</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl outline-none"
                  style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.82rem", color: "#1F2937" }}>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 rounded-xl" style={{ border: "1.5px solid #E5E7EB", color: "#374151", fontSize: "0.85rem" }}>Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: editSaved ? "#10B981" : "#2563EB", fontSize: "0.85rem", fontWeight: 600 }}>
                {editSaved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[60]" style={{ background: "rgba(0,0,0,0.55)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5" style={{ background: NAVY }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                <AlertCircle size={18} className="text-white" />
              </div>
              <p className="text-white" style={{ fontSize: "0.95rem", fontWeight: 700 }}>Confirm Action</p>
            </div>
            <div className="px-6 py-6">
              <p style={{ color: "#1F2937", fontSize: "0.92rem", fontWeight: 500, textAlign: "center", lineHeight: 1.6 }}>
                {confirmAction === "add"
                  ? "Are you sure you want to add this user?"
                  : "Are you sure you want to update this user?"}
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => { setShowConfirmModal(false); setConfirmAction(null); }}
                className="flex-1 py-3 rounded-xl"
                style={{ border: "1.5px solid #E5E7EB", color: "#374151", fontSize: "0.9rem", fontWeight: 600 }}
              >
                No
              </button>
              <button
                onClick={() => { confirmAction === "add" ? commitAdd() : commitEdit(); }}
                className="flex-1 py-3 rounded-xl text-white"
                style={{ background: NAVY, fontSize: "0.9rem", fontWeight: 600 }}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RidersSection() {
  const [viewRider, setViewRider] = useState<Rider | null>(null);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <MetricCard title="Available" value={String(riders.filter(r => r.status === "Available").length)} sub="Ready for dispatch" icon={CheckCircle} color="#10B981" />
        <MetricCard title="On Errand" value={String(riders.filter(r => r.status === "On Errand").length)} sub="Currently active" icon={Bike} color="#3B82F6" />
        <MetricCard title="Offline" value={String(riders.filter(r => r.status === "Offline").length)} sub="Unavailable" icon={XCircle} color="#9CA3AF" />
      </div>
      <div className="bg-white rounded-2xl shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
        <div className="p-5" style={{ borderBottom: "1px solid #F3F4F6" }}>
          <h3 style={{ color: "#1F2937" }}>Rider Status Board</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Rider", "Plate No.", "Status", "Current Errand", "Completed Today", "Avg. Time", "Rating", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap" style={{ color: "#6B7280", fontSize: "0.72rem", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {riders.map((r, i) => {
                const sc = riderStatusConfig[r.status];
                return (
                  <tr key={r.id} style={{ borderTop: i > 0 ? "1px solid #F9FAFB" : "none" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: NAVY, fontSize: "0.72rem", fontWeight: 700 }}>
                          {r.avatar}
                        </div>
                        <div>
                          <p style={{ color: "#1F2937", fontSize: "0.82rem", fontWeight: 500 }}>{r.name}</p>
                          <p style={{ color: "#9CA3AF", fontSize: "0.7rem" }}>{r.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#374151", fontSize: "0.8rem" }}>{r.plateNumber}</td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => {
                          const newStatus = r.status === "Offline" ? "Available" : "Offline";
                          // In a real app we'd trigger a state update for the riders array
                          toast.info(`Rider ${r.name} status manually updated to ${newStatus}`);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all hover:brightness-95" 
                        style={{ background: sc.bg, color: sc.text, fontSize: "0.72rem", fontWeight: 700, border: `1.5px solid ${sc.dot}` }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
                        {r.status}
                      </button>
                    </td>
                    <td className="px-4 py-3" style={{ color: r.currentErrand ? NAVY : "#D1D5DB", fontSize: "0.8rem", fontWeight: r.currentErrand ? 600 : 400 }}>{r.currentErrand || "—"}</td>
                    <td className="px-4 py-3" style={{ color: "#1F2937", fontSize: "0.82rem", fontWeight: 600 }}>{r.completedToday}</td>
                    <td className="px-4 py-3" style={{ color: "#374151", fontSize: "0.8rem" }}>{r.avgTime}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={12} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                        <span style={{ color: "#1F2937", fontSize: "0.8rem" }}>{r.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setViewRider(r)} className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors" style={{ background: "#EFF6FF", color: "#2563EB" }}><Eye size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rider Detail Modal */}
      {viewRider && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between" style={{ background: NAVY }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: "rgba(255,255,255,0.2)", fontSize: "0.95rem", fontWeight: 800 }}>{viewRider.avatar}</div>
                <div>
                  <p className="text-white" style={{ fontSize: "0.95rem", fontWeight: 700 }}>{viewRider.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: riderStatusConfig[viewRider.status].dot }} />
                    <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.72rem" }}>{viewRider.status}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setViewRider(null)} style={{ color: "rgba(255,255,255,0.7)" }}><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Plate Number", value: viewRider.plateNumber },
                  { label: "Phone", value: viewRider.phone },
                  { label: "Trips Today", value: String(viewRider.completedToday) },
                  { label: "Avg. Delivery Time", value: viewRider.avgTime || "—" },
                  { label: "Current Errand", value: viewRider.currentErrand || "None" },
                  { label: "Rating", value: `⭐ ${viewRider.rating}` },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-xl" style={{ background: "#F9FAFB" }}>
                    <p style={{ color: "#9CA3AF", fontSize: "0.7rem", marginBottom: 2 }}>{item.label}</p>
                    <p style={{ color: "#1F2937", fontSize: "0.85rem", fontWeight: 600 }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <a
                  href={`tel:${viewRider.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white"
                  style={{ background: "#10B981", fontSize: "0.82rem", fontWeight: 600 }}
                >
                  <Phone size={14} /> Call Rider
                </a>
                <button
                  onClick={() => setViewRider(null)}
                  className="flex-1 py-2.5 rounded-xl"
                  style={{ border: "1.5px solid #E5E7EB", color: "#374151", fontSize: "0.82rem" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RatesSection() {
  const [editMode, setEditMode] = useState(false);
  const [brackets, setBrackets] = useState((rateConfig as any).distanceBrackets?.map((b: any) => ({ ...b })) || []);
  const [surcharge, setSurcharge] = useState(rateConfig.multiStoreSurcharge);
  const [commFlat, setCommFlat] = useState(rateConfig.commissionFlat);
  const [commPct, setCommPct] = useState(rateConfig.commissionPercent * 100);
  const [threshold, setThreshold] = useState(rateConfig.commissionThreshold);
  const [hvThreshold, setHvThreshold] = useState(rateConfig.nonCodThreshold);
  const [nonCodBase, setNonCodBase] = useState(rateConfig.nonCodFeeBase || 15);
  const [nonCodPremium, setNonCodPremium] = useState(rateConfig.nonCodFeePremium || 50);
  const [rateSaved, setRateSaved] = useState(false);

  const handleSave = () => {
    setRateSaved(true);
    toast.success("Rate configuration saved successfully!");
    setTimeout(() => { setRateSaved(false); setEditMode(false); }, 1400);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end gap-2">
        {editMode ? (
          <>
            <button onClick={() => setEditMode(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ border: "1.5px solid #E5E7EB", color: "#374151", fontSize: "0.85rem" }}>
              <X size={15} /> Cancel
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white" style={{ background: "#10B981", fontSize: "0.85rem", fontWeight: 600 }}>
              <Save size={15} /> {rateSaved ? "Saved!" : "Save Rates"}
            </button>
          </>
        ) : (
          <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white" style={{ background: NAVY, fontSize: "0.85rem" }}>
            <Edit2 size={15} /> Edit Rates
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-sm p-6" style={{ border: "1px solid #E5E7EB" }}>
          <h3 className="mb-4" style={{ color: "#1F2937" }}>Distance-Based Delivery Fees</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl" style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB" }}>
              <p style={{ color: "#6B7280", fontSize: "0.75rem", fontWeight: 600, marginBottom: 12 }}>BASE SERVICE RATE</p>
              <div className="flex items-center justify-between">
                <span style={{ color: "#1F2937", fontSize: "0.9rem", fontWeight: 500 }}>Standard Base Fee (Inc. 1st km)</span>
                {editMode ? (
                  <div className="flex items-center gap-1">
                    <span style={{ color: "#6B7280" }}>₱</span>
                    <input type="number" defaultValue={rateConfig.baseFee} className="w-20 px-2 py-1.5 rounded-lg text-right outline-none" style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", fontSize: "0.9rem", color: NAVY, fontWeight: 700 }} />
                  </div>
                ) : (
                  <span style={{ color: NAVY, fontSize: "1rem", fontWeight: 800 }}>₱{rateConfig.baseFee}.00</span>
                )}
              </div>
            </div>
            <div className="p-4 rounded-xl" style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB" }}>
              <p style={{ color: "#6B7280", fontSize: "0.75rem", fontWeight: 600, marginBottom: 12 }}>DISTANCE SURCHARGE</p>
              <div className="flex items-center justify-between">
                <span style={{ color: "#1F2937", fontSize: "0.9rem", fontWeight: 500 }}>Per succeeding kilometer</span>
                {editMode ? (
                  <div className="flex items-center gap-1">
                    <span style={{ color: "#6B7280" }}>₱</span>
                    <input type="number" defaultValue={rateConfig.perKmFee} className="w-20 px-2 py-1.5 rounded-lg text-right outline-none" style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", fontSize: "0.9rem", color: NAVY, fontWeight: 700 }} />
                  </div>
                ) : (
                  <span style={{ color: NAVY, fontSize: "1rem", fontWeight: 800 }}>₱{rateConfig.perKmFee}.00 / km</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-6" style={{ border: "1px solid #E5E7EB" }}>
            <h3 className="mb-4" style={{ color: "#1F2937" }}>Commission Rules</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl" style={{ background: "#FEF3C7" }}>
                <p style={{ color: "#92400E", fontSize: "0.8rem", fontWeight: 600 }}>Grocery Commission — Flat Fee</p>
                {editMode ? (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span style={{ color: "#92400E", fontSize: "0.78rem" }}>₱</span>
                    <input type="number" value={commFlat} onChange={e => setCommFlat(Number(e.target.value))} className="w-16 px-2 py-1 rounded-lg outline-none" style={{ background: "#FEF9C3", border: "1px solid #FDE68A", fontSize: "0.78rem" }} />
                    <span style={{ color: "#92400E", fontSize: "0.78rem" }}>flat for ≤ ₱</span>
                    <input type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-20 px-2 py-1 rounded-lg outline-none" style={{ background: "#FEF9C3", border: "1px solid #FDE68A", fontSize: "0.78rem" }} />
                  </div>
                ) : (
                  <p style={{ color: "#92400E", fontSize: "0.8rem" }}>₱{commFlat} flat for purchases ≤ ₱{threshold.toLocaleString()}</p>
                )}
              </div>
              <div className="p-3 rounded-xl" style={{ background: "#DBEAFE" }}>
                <p style={{ color: "#1E40AF", fontSize: "0.8rem", fontWeight: 600 }}>Grocery Commission — Variable</p>
                {editMode ? (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <input type="number" value={commPct} onChange={e => setCommPct(Number(e.target.value))} className="w-14 px-2 py-1 rounded-lg outline-none" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", fontSize: "0.78rem" }} />
                    <span style={{ color: "#1E40AF", fontSize: "0.78rem" }}>% for purchases &gt; ₱{threshold.toLocaleString()}</span>
                  </div>
                ) : (
                  <p style={{ color: "#1E40AF", fontSize: "0.8rem" }}>{commPct}% of purchase for items &gt; ₱{threshold.toLocaleString()}</p>
                )}
              </div>
              <div className="p-3 rounded-xl" style={{ background: "#EDE9FE" }}>
                <p style={{ color: "#5B21B6", fontSize: "0.8rem", fontWeight: 600 }}>Multi-Store Surcharge</p>
                {editMode ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{ color: "#5B21B6", fontSize: "0.78rem" }}>+ ₱</span>
                    <input type="number" value={surcharge} onChange={e => setSurcharge(Number(e.target.value))} className="w-16 px-2 py-1 rounded-lg outline-none" style={{ background: "#F5F3FF", border: "1px solid #DDD6FE", fontSize: "0.78rem" }} />
                    <span style={{ color: "#5B21B6", fontSize: "0.78rem" }}>per additional store</span>
                  </div>
                ) : (
                  <p style={{ color: "#5B21B6", fontSize: "0.8rem" }}>+ ₱{surcharge} per additional store beyond first</p>
                )}
              </div>
              <div className="p-3 rounded-xl" style={{ background: "#FEE2E2" }}>
                <p style={{ color: "#991B1B", fontSize: "0.8rem", fontWeight: 600 }}>Non-COD Processing Fees</p>
                {editMode ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ color: "#991B1B", fontSize: "0.78rem" }}>Regular Route ₱</span>
                      <input type="number" value={nonCodBase} onChange={e => setNonCodBase(Number(e.target.value))} className="w-16 px-2 py-1 rounded-lg outline-none" style={{ background: "#FEF2F2", border: "1px solid #FECACA", fontSize: "0.78rem" }} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ color: "#991B1B", fontSize: "0.78rem" }}>Outside Range ₱</span>
                      <input type="number" value={nonCodPremium} onChange={e => setNonCodPremium(Number(e.target.value))} className="w-16 px-2 py-1 rounded-lg outline-none" style={{ background: "#FEF2F2", border: "1px solid #FECACA", fontSize: "0.78rem" }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 mt-1">
                    <p style={{ color: "#991B1B", fontSize: "0.8rem" }}>Regular GCash/Bank Transfer: ₱{nonCodBase}</p>
                    <p style={{ color: "#991B1B", fontSize: "0.8rem" }}>Outside Route/Remote GCash Transfer: ₱{nonCodPremium}</p>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl" style={{ background: "#FEE2E2" }}>
                <p style={{ color: "#991B1B", fontSize: "0.8rem", fontWeight: 600 }}>High-Value Transaction Flag</p>
                {editMode ? (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span style={{ color: "#991B1B", fontSize: "0.78rem" }}>Flag non-COD exceeding ₱</span>
                    <input type="number" value={hvThreshold} onChange={e => setHvThreshold(Number(e.target.value))} className="w-20 px-2 py-1 rounded-lg outline-none" style={{ background: "#FEF2F2", border: "1px solid #FECACA", fontSize: "0.78rem" }} />
                  </div>
                ) : (
                  <p style={{ color: "#991B1B", fontSize: "0.8rem" }}>Non-COD purchases exceeding ₱{hvThreshold.toLocaleString()} require dispatcher verification</p>
                )}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6" style={{ border: "1px solid #E5E7EB" }}>
            <h3 className="mb-3" style={{ color: "#1F2937" }}>Service Types</h3>
            {["Pabili", "Padala", "Bills Payment"].map(t => (
              <div key={t} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ color: "#374151", fontSize: "0.85rem" }}>{t}</span>
                <span className="px-2 py-0.5 rounded" style={{ background: "#D1FAE5", color: "#065F46", fontSize: "0.72rem" }}>Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsSection() {
  const [tab, setTab] = useState("sales");
  const [reportFreq, setReportFreq] = useState("Daily");
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date("2024-07-01"),
    to: new Date("2024-08-12")
  });
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isRelativeExpanded, setIsRelativeExpanded] = useState(true);
  const [declineRecords, setDeclineRecords] = useState<Record<number, { count: number, lastReason: string }>>({});

  React.useEffect(() => {
    const fetchDeclines = () => {
      try {
        const logData = localStorage.getItem("decline_log");
        if (logData) {
          const log = JSON.parse(logData);
          setDeclineRecords(prev => {
            const current = prev[log.riderId] || { count: 0, lastReason: "" };
            return {
              ...prev,
              [log.riderId]: { count: current.count + 1, lastReason: log.reason }
            };
          });
        }
      } catch (err) {}
    };
    
    // Initial fetch
    fetchDeclines();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "decline_log") fetchDeclines();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const formattedStart = date?.from ? format(date.from, "yyyy-MM-dd") : "—";
  const formattedEnd = date?.to ? format(date.to, "yyyy-MM-dd") : "—";

  // Advanced Relative Range State
  const [amountLast, setAmountLast] = useState("1");
  const [unitLast, setUnitLast] = useState("Weeks");
  const [amountBefore, setAmountBefore] = useState("1");
  const [unitBefore, setUnitBefore] = useState("Weeks");

  const formatDateLabel = (range: DateRange | undefined) => {
    if (!range?.from) return "Select date";
    if (!range.to) return format(range.from, "LLL dd, y");
    return `${format(range.from, "LLL dd, y")} — ${format(range.to, "LLL dd, y")}`;
  };

  const tabs = [
    { id: "sales", label: "Sales Report" },
    { id: "performance", label: "Rider Performance" },
    { id: "commission", label: "Commission Log" },
    { id: "settlement", label: "Settlement" },
    { id: "transactions", label: "Transaction Summary" },
  ];

  const factor = reportFreq === "Weekly" ? 7 : reportFreq === "Monthly" ? 30 : reportFreq === "Yearly" ? 365 : 1;

  const handlePreset = (preset: string) => {
    const now = new Date();
    let newRange: DateRange | undefined;

    switch (preset) {
      case "Today":
        newRange = { from: startOfToday(), to: endOfToday() };
        break;
      case "Yesterday":
        newRange = { from: startOfYesterday(), to: endOfYesterday() };
        break;
      case "Last week":
        newRange = { from: startOfWeek(subWeeks(now, 1)), to: endOfWeek(subWeeks(now, 1)) };
        break;
      case "Lifetime":
        newRange = { from: new Date("2024-01-01"), to: now };
        break;
      default:
        break;
    }
    if (newRange) setDate(newRange);
  };

  const handleAdvancedRelative = () => {
    const now = new Date();
    const unitMap: Record<string, string> = { Weeks: "weeks", Days: "days", Months: "months", Years: "years" };

    const beforeDate = sub(now, { [unitMap[unitBefore] || "weeks"]: parseInt(amountBefore) || 0 });
    const fromDate = sub(beforeDate, { [unitMap[unitLast] || "weeks"]: parseInt(amountLast) || 0 });

    setDate({ from: fromDate, to: beforeDate });
  };

  const handleFreqSelect = (f: string) => {
    setReportFreq(f);
    const now = new Date();
    let start = new Date();
    if (f === "Weekly") start = subWeeks(now, 1);
    else if (f === "Monthly") start = subMonths(now, 1);
    else if (f === "Yearly") start = subYears(now, 1);
    else if (f === "Daily") start = startOfDay(now);

    setDate({ from: start, to: now });
  };

  const handlePrint = () => setShowPrintModal(true);
  const handleExportPDF = () => {
    toast.success("Report exported!", { description: `${tabs.find(t => t.id === tab)?.label} (${reportFreq}) — ${formatDateLabel(date)} saved to Downloads.` });
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap items-center">
        <div className="flex gap-2 flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="px-4 py-2 rounded-xl transition-all"
              style={{ background: tab === t.id ? NAVY : "#F3F4F6", color: tab === t.id ? "#fff" : "#374151", fontSize: "0.82rem", fontWeight: tab === t.id ? 600 : 400 }}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          {tab !== "transactions" && (
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: "#F3F4F6", color: "#374151", fontSize: "0.82rem" }}>
              <Printer size={14} /> Print
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-6" style={{ border: "1px solid #E5E7EB" }}>
        <div className="flex flex-col gap-1.5">
          <label style={{ color: "#6B7280", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em" }}>REPORT FREQUENCY</label>
          <div className="flex bg-[#F3F4F6] p-1 rounded-xl">
            {["Daily", "Weekly", "Monthly", "Yearly"].map(f => (
              <button key={f} onClick={() => handleFreqSelect(f)} className="px-4 py-1.5 rounded-lg transition-all"
                style={{
                  background: reportFreq === f ? "#fff" : "transparent",
                  boxShadow: reportFreq === f ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                  color: reportFreq === f ? NAVY : "#6B7280",
                  fontSize: "0.8rem",
                  fontWeight: reportFreq === f ? 700 : 500
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label style={{ color: "#6B7280", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em" }}>DATE FILTRATION</label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="flex items-center gap-3 px-4 py-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-gray-50 transition-all text-sm font-semibold text-[#1F2937]"
              >
                <CalendarIcon size={16} className="text-[#1E3A5F]" />
                {formatDateLabel(date)}
                <ChevronDown size={14} className="text-[#9CA3AF] ml-auto" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-[#E5E7EB]" align="start">
              <div className="flex flex-col">
                {/* Calendars Row */}
                <div className="p-3 bg-white rounded-t-2xl">
                  <CalendarUI
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    className="p-1"
                    classNames={{
                      day: cn(
                        "size-7 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center rounded-md text-[0.7rem]"
                      ),
                      head_cell: "text-muted-foreground rounded-md w-7 font-normal text-[0.65rem]",
                      cell: "size-7 flex items-center justify-center p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                      month: "flex flex-col gap-2",
                      caption_label: "text-xs font-bold",
                    }}
                  />

                  <div className="flex items-center justify-end px-3 py-1 mt-1 gap-2 text-[0.65rem] font-medium text-[#4B5563]">
                    <span>Select time</span>
                    <Clock size={12} />
                  </div>
                </div>

                {/* Relative Date Range Section */}
                <div className="bg-[#F9FAFB] border-t border-[#E5E7EB] rounded-b-2xl">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-100 transition-colors rounded-b-2xl"
                    onClick={() => setIsRelativeExpanded(!isRelativeExpanded)}
                  >
                    <h4 className="text-xs font-bold text-[#1F2937]">Relative date range</h4>
                    {isRelativeExpanded ? <ChevronUp size={14} className="text-[#9CA3AF]" /> : <ChevronDown size={14} className="text-[#9CA3AF]" />}
                  </div>

                  {isRelativeExpanded && (
                    <div className="px-4 pb-4">
                      {/* Presets Row */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {["Custom", "Lifetime", "Today", "Yesterday", "Last week"].map((p) => {
                          return (
                            <button
                              key={p}
                              onClick={() => handlePreset(p)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-[0.65rem] font-bold transition-all",
                                p === "Last week" ? "bg-[#3B82F6] text-white" : "bg-white border border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50"
                              )}
                            >
                              {p}
                            </button>
                          );
                        })}
                        <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-[#4B5563] text-[0.65rem] font-bold cursor-pointer">
                          <span>More</span>
                          <ChevronDown size={12} />
                        </div>
                      </div>

                      {/* Advanced Inputs */}
                      <div className="flex items-center gap-2 text-[0.65rem] font-bold text-[#4B5563]">
                        <ChevronLeft size={14} className="text-[#9CA3AF]" />
                        <span>Last</span>
                        <input
                          type="number"
                          value={amountLast}
                          onChange={(e) => setAmountLast(e.target.value)}
                          className="w-14 px-2 py-1.5 rounded-lg bg-white border border-[#E5E7EB] outline-none transition-all"
                        />
                        <Select value={unitLast} onValueChange={setUnitLast}>
                          <SelectTrigger className="w-24 bg-white font-bold h-7 text-[0.65rem] px-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Days">Days</SelectItem>
                            <SelectItem value="Weeks">Weeks</SelectItem>
                            <SelectItem value="Months">Months</SelectItem>
                            <SelectItem value="Years">Years</SelectItem>
                          </SelectContent>
                        </Select>

                        <span>before</span>

                        <input
                          type="number"
                          value={amountBefore}
                          onChange={(e) => setAmountBefore(e.target.value)}
                          className="w-14 px-2 py-1.5 rounded-lg bg-white border border-[#E5E7EB] outline-none transition-all"
                        />
                        <Select value={unitBefore} onValueChange={setUnitBefore}>
                          <SelectTrigger className="w-24 bg-white font-bold h-7 text-[0.65rem] px-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Days">Days</SelectItem>
                            <SelectItem value="Weeks">Weeks</SelectItem>
                            <SelectItem value="Months">Months</SelectItem>
                            <SelectItem value="Years">Years</SelectItem>
                          </SelectContent>
                        </Select>

                        <button
                          onClick={handleAdvancedRelative}
                          className="ml-auto px-3 py-1.5 rounded-lg bg-[#1E3A5F] text-white hover:bg-[#162D4A] transition-all"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {tab === "sales" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <MetricCard title="Total Transactions" value={String(10 * factor)} sub={`${reportFreq} summary`} icon={ClipboardList} color="#3B82F6" />
            <MetricCard title="Total Revenue" value={`₱${(875 * factor).toLocaleString()}`} sub={`Total for ${reportFreq.toLowerCase()}`} icon={TrendingUp} color="#10B981" />
            <MetricCard title="Avg. Service Fee" value="₱47" sub={`Avg. during ${reportFreq.toLowerCase()}`} icon={DollarSign} color="#F59E0B" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: "1px solid #E5E7EB" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 style={{ color: "#1F2937" }}>{reportFreq} Sales Trend</h3>
                <p style={{ color: "#6B7280", fontSize: "0.78rem" }}>Revenue over time from {formattedStart} to {formattedEnd}</p>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: "#F3F4F6", color: "#6B7280" }}>Revenue: ₱875.00</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={reportFreq === "Daily" ? revenueData : weeklyData.map(d => ({ ...d, revenue: d.revenue * (factor / 7) }))}>
                <defs>
                  <linearGradient id="reportRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={NAVY} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={NAVY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey={reportFreq === "Daily" ? "hour" : "day"} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                  formatter={(v: any) => [`₱${v}`, "Revenue"]}
                />
                <Area type="monotone" dataKey={reportFreq === "Daily" ? "revenue" : "revenue"} stroke={NAVY} strokeWidth={3} fill="url(#reportRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: "1px solid #E5E7EB" }}>
            <h3 className="mb-4" style={{ color: "#1F2937" }}>{reportFreq} Sales Report — {formattedStart} to {formattedEnd}</h3>
            <table className="w-full">
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {["Errand ID", "Type", "Customer", "Amount", "Service Fee", "Commission", "Surcharge", "Payment", "Status"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left whitespace-nowrap" style={{ color: "#6B7280", fontSize: "0.72rem", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {errands.map((e, i) => (
                  <tr key={e.id} style={{ borderTop: i > 0 ? "1px solid #F9FAFB" : "none" }}>
                    <td className="px-3 py-2.5" style={{ color: NAVY, fontSize: "0.78rem", fontWeight: 600 }}>{e.id}</td>
                    <td className="px-3 py-2.5" style={{ color: "#374151", fontSize: "0.78rem" }}>{e.type}</td>
                    <td className="px-3 py-2.5" style={{ color: "#374151", fontSize: "0.78rem" }}>{e.customer}</td>
                    <td className="px-3 py-2.5" style={{ color: "#1F2937", fontSize: "0.78rem" }}>₱{e.amount.toLocaleString()}</td>
                    <td className="px-3 py-2.5" style={{ color: "#10B981", fontSize: "0.78rem", fontWeight: 600 }}>₱{e.serviceFee}</td>
                    <td className="px-3 py-2.5" style={{ color: "#3B82F6", fontSize: "0.78rem" }}>{e.commission ? `₱${e.commission}` : "—"}</td>
                    <td className="px-3 py-2.5" style={{ color: "#F59E0B", fontSize: "0.78rem" }}>{e.surcharge ? `₱${e.surcharge}` : "—"}</td>
                    <td className="px-3 py-2.5" style={{ color: "#374151", fontSize: "0.78rem" }}>{e.paymentMode}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={e.status as ErrandStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "performance" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: "1px solid #E5E7EB" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 style={{ color: "#1F2937" }}>Rider Completion Overview</h3>
                <p style={{ color: "#6B7280", fontSize: "0.78rem" }}>Completed errands per rider for the selected period</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={riders.filter(r => r.completedToday > 0).map(r => ({ name: r.name, completed: r.completedToday * factor }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9CA3AF" }} />
                <Tooltip
                  cursor={{ fill: "#F9FAFB" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="completed" fill={NAVY} radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
            <div className="p-5" style={{ borderBottom: "1px solid #F3F4F6" }}>
              <h3 style={{ color: "#1F2937" }}>Rider Performance — {reportFreq} ({formattedStart} to {formattedEnd})</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {["Rank", "Rider", "Completed", "Declines", "Recent Reason", "Completion Rate", "Avg. Time", "Commission Earned", "Rating"].map(h => (
                    <th key={h} className="px-4 py-3 text-left" style={{ color: "#6B7280", fontSize: "0.72rem", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riders.filter(r => r.completedToday > 0).sort((a, b) => b.completedToday - a.completedToday).map((r, i) => (
                  <tr key={r.id} style={{ borderTop: i > 0 ? "1px solid #F9FAFB" : "none" }}>
                    <td className="px-4 py-3" style={{ color: i < 3 ? "#F59E0B" : "#9CA3AF", fontSize: "0.85rem", fontWeight: 700 }}>#{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: NAVY, fontSize: "0.72rem" }}>{r.avatar}</div>
                        <span style={{ color: "#1F2937", fontSize: "0.82rem" }}>{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#1F2937", fontSize: "0.82rem", fontWeight: 700 }}>{r.completedToday * factor}</td>
                    <td className="px-4 py-3" style={{ color: "#EF4444", fontSize: "0.82rem", fontWeight: 700 }}>{declineRecords[r.id]?.count || 0}</td>
                    <td className="px-4 py-3" style={{ color: "#6B7280", fontSize: "0.78rem" }}>
                      {declineRecords[r.id]?.lastReason ? (
                        <span className="truncate block max-w-[150px] title={declineRecords[r.id].lastReason}">
                          "{declineRecords[r.id].lastReason}"
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "#10B981", fontSize: "0.82rem" }}>
                      {Math.max(0, Math.floor(85 + (r.rating! - 4) * 15) - (declineRecords[r.id]?.count || 0) * 5)}%
                    </td>
                    <td className="px-4 py-3" style={{ color: "#374151", fontSize: "0.82rem" }}>{r.avgTime}</td>
                    <td className="px-4 py-3" style={{ color: "#3B82F6", fontSize: "0.82rem", fontWeight: 600 }}>₱{((r.completedToday * 35 + 50) * factor).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={12} fill="#F59E0B" style={{ color: "#F59E0B" }} />
                        <span style={{ color: "#1F2937", fontSize: "0.82rem" }}>{r.rating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "transactions" && (
        <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: "1px solid #E5E7EB" }}>
          <h3 className="mb-4" style={{ color: "#1F2937" }}>Transaction Summary Report</h3>
          <p className="mb-4 text-xs text-gray-500">Eliminates physical receipt cross-referencing by breaking down daily purchases directly with statuses.</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {["Errand ID", "Date/Time", "Customer", "Type", "Payment Mode", "Status", "Total Amount Disbursed"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left whitespace-nowrap" style={{ color: "#6B7280", fontSize: "0.72rem", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {errands.map((e, i) => (
                  <tr key={e.id} style={{ borderTop: i > 0 ? "1px solid #F9FAFB" : "none" }}>
                    <td className="px-3 py-2.5" style={{ color: NAVY, fontSize: "0.78rem", fontWeight: 600 }}>{e.id}</td>
                    <td className="px-3 py-2.5" style={{ color: "#374151", fontSize: "0.78rem" }}>{e.createdAt}</td>
                    <td className="px-3 py-2.5" style={{ color: "#374151", fontSize: "0.78rem" }}>{e.customer}</td>
                    <td className="px-3 py-2.5" style={{ color: "#374151", fontSize: "0.78rem" }}>{e.type}</td>
                    <td className="px-3 py-2.5" style={{ color: "#374151", fontSize: "0.78rem" }}>{e.paymentMode}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={e.status as ErrandStatus} /></td>
                    <td className="px-3 py-2.5" style={{ color: "#1F2937", fontSize: "0.78rem", fontWeight: 700 }}>₱{e.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "commission" && (
        <div className="bg-white rounded-2xl shadow-sm p-5" style={{ border: "1px solid #E5E7EB" }}>
          <h3 className="mb-4" style={{ color: "#1F2937" }}>Commission Log — {reportFreq} Summary</h3>
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Errand ID", "Type", "Rider", "Purchase Amt", "Commission Type", "Commission Amt", "Surcharge", "Total Sugo Share"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left whitespace-nowrap" style={{ color: "#6B7280", fontSize: "0.72rem", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {errands.filter(e => e.type === "Pabili" && e.commission).map((e, i) => (
                <tr key={e.id} style={{ borderTop: i > 0 ? "1px solid #F9FAFB" : "none" }}>
                  <td className="px-3 py-2.5" style={{ color: NAVY, fontSize: "0.78rem", fontWeight: 600 }}>{e.id}</td>
                  <td className="px-3 py-2.5" style={{ color: "#374151", fontSize: "0.78rem" }}>{e.type}</td>
                  <td className="px-3 py-2.5" style={{ color: "#374151", fontSize: "0.78rem" }}>{e.riderName || "—"}</td>
                  <td className="px-3 py-2.5" style={{ color: "#1F2937", fontSize: "0.78rem" }}>₱{e.amount.toLocaleString()}</td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded" style={{ background: e.amount > 1000 ? "#DBEAFE" : "#FEF3C7", color: e.amount > 1000 ? "#1E40AF" : "#92400E", fontSize: "0.72rem" }}>
                      {e.amount > 1000 ? "10% Variable" : "₱50 Flat"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5" style={{ color: "#10B981", fontSize: "0.78rem", fontWeight: 700 }}>₱{(e.commission || 0) * factor}</td>
                  <td className="px-3 py-2.5" style={{ color: "#F59E0B", fontSize: "0.78rem" }}>{e.surcharge ? `₱${e.surcharge * factor}` : "—"}</td>
                  <td className="px-3 py-2.5" style={{ color: NAVY, fontSize: "0.78rem", fontWeight: 700 }}>₱{((e.commission || 0) + (e.surcharge || 0)) * factor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "settlement" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl shadow-sm p-6" style={{ border: "1px solid #E5E7EB" }}>
            <h3 className="mb-4" style={{ color: "#1F2937" }}>{reportFreq} Settlement — {formattedStart} to {formattedEnd}</h3>
            {[
              { label: "Total Transactions", value: `${10 * factor} errands` },
              { label: "Total Capital Deployed", value: `₱${(10370 * factor).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
              { label: "Total Service Fees Collected", value: `₱${(475 * factor).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
              { label: "Total Grocery Commissions", value: `₱${(505 * factor).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
              { label: "Multi-Store Surcharges", value: `₱${(25 * factor).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
              { label: "Total Sugo Share", value: `₱${(530 * factor).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, highlight: true },
              { label: "Total Rider Share (Base Fees)", value: `₱${(475 * factor).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, highlight: true },
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-3" style={{ borderBottom: "1px solid #F3F4F6" }}>
                <span style={{ color: "#6B7280", fontSize: "0.85rem" }}>{item.label}</span>
                <span style={{ color: item.highlight ? NAVY : "#1F2937", fontSize: "0.85rem", fontWeight: item.highlight ? 700 : 500 }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6" style={{ border: "1px solid #E5E7EB" }}>
            <h3 className="mb-4" style={{ color: "#1F2937" }}>Rider Earnings Breakdown</h3>
            {riders.filter(r => r.completedToday > 0).map((r, i) => (
              <div key={r.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: "1px solid #F9FAFB" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: NAVY, fontSize: "0.7rem" }}>{r.avatar}</div>
                  <span style={{ color: "#374151", fontSize: "0.82rem" }}>{r.name}</span>
                </div>
                <div className="text-right">
                  <p style={{ color: NAVY, fontSize: "0.82rem", fontWeight: 700 }}>₱{((r.completedToday * 40) * factor).toLocaleString()}</p>
                  <p style={{ color: "#9CA3AF", fontSize: "0.72rem" }}>{r.completedToday * factor} trips</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" style={{ backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-xl shadow-2xl flex flex-col w-full max-w-2xl" style={{ border: "1px solid #E5E7EB", maxHeight: "90vh" }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid #F3F4F6", background: "#F9FAFB", borderTopLeftRadius: "0.75rem", borderTopRightRadius: "0.75rem" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#E53935" }}></div>
                <div>
                  <h3 style={{ color: "#1F2937", fontSize: "1rem", fontWeight: 800 }}>Company Name</h3>
                  <p style={{ color: "#6B7280", fontSize: "0.75rem" }}>Official Digital Report</p>
                </div>
              </div>
              <button onClick={() => setShowPrintModal(false)} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                <X size={18} style={{ color: "#6B7280" }} />
              </button>
            </div>

            {/* Paper Document Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-100 flex justify-center">
              <div className="bg-white p-8 sm:p-10 w-full shadow-md" style={{ aspectRatio: "1 / 1.414", maxWidth: "800px", minHeight: "600px", border: "1px solid #D1D5DB" }}>
                <h1 className="text-center mb-6" style={{ color: NAVY, fontSize: "1.5rem", fontWeight: 800 }}>
                  {tabs.find(t => t.id === tab)?.label?.toUpperCase()}
                </h1>

                <div className="flex justify-between mb-8 pb-4" style={{ borderBottom: "2px solid #E5E7EB" }}>
                  <div>
                    <p style={{ color: "#6B7280", fontSize: "0.85rem", fontWeight: 600 }}>FREQUENCY</p>
                    <p style={{ color: "#1F2937", fontSize: "1rem", fontWeight: 700 }}>{reportFreq}</p>
                  </div>
                  <div className="text-right">
                    <p style={{ color: "#6B7280", fontSize: "0.85rem", fontWeight: 600 }}>PERIOD</p>
                    <p style={{ color: "#1F2937", fontSize: "1rem", fontWeight: 700 }}>{formattedStart} to {formattedEnd}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="mb-4" style={{ color: "#374151", fontSize: "0.95rem", lineHeight: "1.6" }}>
                    This digital report certifies the data for the selected period.
                    The metrics below summarize the performance for the indicated reporting frame.
                  </p>

                  <div className="bg-white p-4 rounded-lg" style={{ border: "1px solid #D1D5DB" }}>
                    <p className="mb-4" style={{ color: NAVY, fontSize: "1.1rem", fontWeight: 700, textAlign: "center" }}>
                      System Verified Summary Data
                    </p>

                    {tab === "summary" && (
                      <table className="w-full text-left" style={{ fontSize: "0.85rem" }}>
                        <thead>
                          <tr style={{ background: "#F3F4F6", color: "#374151" }}>
                            <th className="p-2">Date/Time</th>
                            <th className="p-2">Activity</th>
                            <th className="p-2">User</th>
                            <th className="p-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {errands.slice(0, 15).map((e) => (
                            <tr key={e.id} style={{ borderBottom: "1px solid #E5E7EB" }}>
                              <td className="p-2 text-gray-500">{e.createdAt}</td>
                              <td className="p-2" style={{ color: "#1F2937", fontWeight: 500 }}>{e.type} Errand {e.id}</td>
                              <td className="p-2 text-gray-600">{e.customer}</td>
                              <td className="p-2 text-right">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "#D1FAE5", color: "#065F46" }}>LOGGED</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {tab === "sales" && (
                      <table className="w-full text-left" style={{ fontSize: "0.85rem" }}>
                        <thead>
                          <tr style={{ background: "#F3F4F6", color: "#374151" }}>
                            <th className="p-2">Errand ID</th>
                            <th className="p-2">Type</th>
                            <th className="p-2">Customer</th>
                            <th className="p-2 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {errands.map((e) => (
                            <tr key={e.id} style={{ borderBottom: "1px solid #E5E7EB" }}>
                              <td className="p-2" style={{ color: "#1F2937", fontWeight: 500 }}>{e.id}</td>
                              <td className="p-2 text-gray-600">{e.type}</td>
                              <td className="p-2 text-gray-600">{e.customer}</td>
                              <td className="p-2 text-right" style={{ color: "#10B981", fontWeight: 600 }}>₱{e.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {tab === "performance" && (
                      <table className="w-full text-left" style={{ fontSize: "0.85rem" }}>
                        <thead>
                          <tr style={{ background: "#F3F4F6", color: "#374151" }}>
                            <th className="p-2">Rider</th>
                            <th className="p-2 text-center">Completed</th>
                            <th className="p-2 text-right">Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {riders.filter(r => r.completedToday > 0).sort((a, b) => b.completedToday - a.completedToday).map(r => (
                            <tr key={r.id} style={{ borderBottom: "1px solid #E5E7EB" }}>
                              <td className="p-2" style={{ color: "#1F2937", fontWeight: 500 }}>{r.name}</td>
                              <td className="p-2 text-center text-gray-600">{r.completedToday * factor} trips</td>
                              <td className="p-2 text-right text-yellow-600">{r.rating} ★</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {tab === "commission" && (
                      <table className="w-full text-left" style={{ fontSize: "0.85rem" }}>
                        <thead>
                          <tr style={{ background: "#F3F4F6", color: "#374151" }}>
                            <th className="p-2">Errand ID</th>
                            <th className="p-2">Rider</th>
                            <th className="p-2 text-right">Commission</th>
                          </tr>
                        </thead>
                        <tbody>
                          {errands.filter(e => e.type === "Pabili" && e.commission).map((e) => (
                            <tr key={e.id} style={{ borderBottom: "1px solid #E5E7EB" }}>
                              <td className="p-2" style={{ color: "#1F2937", fontWeight: 500 }}>{e.id}</td>
                              <td className="p-2 text-gray-600">{e.riderName || "—"}</td>
                              <td className="p-2 text-right" style={{ color: "#10B981", fontWeight: 600 }}>₱{(e.commission || 0) * factor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    {tab === "settlement" && (
                      <div className="text-left w-full mx-auto" style={{ fontSize: "0.85rem", maxWidth: "400px" }}>
                        {[
                          { label: "Total Transactions", value: `${10 * factor} errands` },
                          { label: "Total Capital Deployed", value: `₱${(10370 * factor).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                          { label: "Total Service Fees Collected", value: `₱${(475 * factor).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                          { label: "Total Grocery Commissions", value: `₱${(505 * factor).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                          { label: "Multi-Store Surcharges", value: `₱${(25 * factor).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
                          { label: "Total Sugo Share", value: `₱${(530 * factor).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, highlight: true },
                          { label: "Total Rider Share (Base Fees)", value: `₱${(475 * factor).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, highlight: true },
                        ].map((item, i) => (
                          <div key={i} className="flex justify-between py-2" style={{ borderBottom: i === 6 ? "none" : "1px solid #E5E7EB" }}>
                            <span style={{ color: "#4B5563" }}>{item.label}</span>
                            <span style={{ fontWeight: item.highlight ? 700 : 500, color: item.highlight ? NAVY : "#1F2937" }}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-8" style={{ borderTop: "1px solid #E5E7EB", marginTop: "40px" }}>
                  <p style={{ color: "#9CA3AF", fontSize: "0.75rem", textAlign: "center" }}>
                    CONFIDENTIAL - COMPANY NAME INTERNAL USE ONLY
                  </p>
                  <p style={{ color: "#9CA3AF", fontSize: "0.75rem", textAlign: "center", marginTop: "4px" }}>
                    Generated on: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 flex justify-end gap-3" style={{ borderTop: "1px solid #E5E7EB", background: "#fff", borderBottomLeftRadius: "0.75rem", borderBottomRightRadius: "0.75rem" }}>
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-lg"
                style={{ color: "#374151", background: "#F3F4F6", fontSize: "0.85rem", fontWeight: 600 }}
              >
                Close
              </button>
              {tab !== "summary" && (
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg text-white flex items-center gap-2"
                  style={{ background: NAVY, fontSize: "0.85rem", fontWeight: 600 }}
                >
                  <Printer size={16} /> Print Document
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsSection() {
  const [businessName, setBusinessName] = useState("Sugo Errand Services");
  const [businessPhone, setBusinessPhone] = useState("09171234567");
  const [businessEmail, setBusinessEmail] = useState("support@sugo.ph");
  const [businessAddress, setBusinessAddress] = useState("Tacurong City, Sultan Kudarat");
  const [notifNewErrand, setNotifNewErrand] = useState(true);
  const [notifHighValue, setNotifHighValue] = useState(true);
  const [notifRiderOffline, setNotifRiderOffline] = useState(false);
  const [notifSettlement, setNotifSettlement] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoAssign, setAutoAssign] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className="flex-shrink-0 transition-transform active:scale-95">
      {value
        ? <ToggleRight size={30} style={{ color: NAVY }} />
        : <ToggleLeft size={30} style={{ color: "#D1D5DB" }} />
      }
    </button>
  );

  const handleSave = () => {
    setSettingsSaved(true);
    toast.success("All settings saved successfully!");
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Business Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-2 mb-5">
          <Building2 size={18} style={{ color: NAVY }} />
          <h3 style={{ color: "#1F2937" }}>Business Information</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Business Name", value: businessName, set: setBusinessName },
            { label: "Contact Phone", value: businessPhone, set: setBusinessPhone },
            { label: "Support Email", value: businessEmail, set: setBusinessEmail },
            { label: "Business Address", value: businessAddress, set: setBusinessAddress },
          ].map(f => (
            <div key={f.label}>
              <label className="block mb-1" style={{ color: "#6B7280", fontSize: "0.78rem" }}>{f.label}</label>
              <input
                value={f.value}
                onChange={e => f.set(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.85rem", color: "#1F2937" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-2 mb-5">
          <Bell size={18} style={{ color: NAVY }} />
          <h3 style={{ color: "#1F2937" }}>Notification Preferences</h3>
        </div>
        <div className="space-y-1">
          {[
            { label: "New Errand Alerts", desc: "Notify when a new errand is placed", value: notifNewErrand, set: setNotifNewErrand },
            { label: "High-Value Transaction Alerts", desc: "Alert for transactions exceeding ₱3,000", value: notifHighValue, set: setNotifHighValue },
            { label: "Rider Offline Alerts", desc: "Notify when a rider goes offline unexpectedly", value: notifRiderOffline, set: setNotifRiderOffline },
            { label: "Daily Settlement Summary", desc: "End-of-day settlement report notification", value: notifSettlement, set: setNotifSettlement },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid #F9FAFB" }}>
              <div>
                <p style={{ color: "#1F2937", fontSize: "0.85rem", fontWeight: 500 }}>{item.label}</p>
                <p style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>{item.desc}</p>
              </div>
              <Toggle value={item.value} onChange={item.set} />
            </div>
          ))}
        </div>
      </div>

      {/* System & Operations */}
      <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} style={{ color: NAVY }} />
          <h3 style={{ color: "#1F2937" }}>System & Operations</h3>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid #F9FAFB" }}>
            <div>
              <p style={{ color: "#1F2937", fontSize: "0.85rem", fontWeight: 500 }}>Auto-Assign Riders</p>
              <p style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>Automatically assign the nearest available rider to new errands</p>
            </div>
            <Toggle value={autoAssign} onChange={setAutoAssign} />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p style={{ color: maintenanceMode ? "#EF4444" : "#1F2937", fontSize: "0.85rem", fontWeight: 500 }}>
                Maintenance Mode {maintenanceMode && <span className="ml-2 px-2 py-0.5 rounded-full text-white" style={{ background: "#EF4444", fontSize: "0.65rem" }}>ACTIVE</span>}
              </p>
              <p style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>Pause all incoming orders while enabled</p>
            </div>
            <Toggle
              value={maintenanceMode}
              onChange={v => {
                setMaintenanceMode(v);
                if (v) toast.warning("Maintenance mode enabled — new orders are paused.");
                else toast.success("System is back online and accepting orders.");
              }}
            />
          </div>
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} style={{ color: NAVY }} />
          <h3 style={{ color: "#1F2937" }}>Account Security</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {["Current Password", "New Password", "Confirm New Password"].map(label => (
            <div key={label}>
              <label className="block mb-1" style={{ color: "#6B7280", fontSize: "0.78rem" }}>{label}</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl outline-none"
                style={{ background: "#F9FAFB", border: "1.5px solid #E5E7EB", fontSize: "0.85rem", color: "#1F2937" }}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => toast.success("Password updated successfully!")}
          className="mt-4 px-5 py-2.5 rounded-xl text-white"
          style={{ background: NAVY, fontSize: "0.82rem" }}
        >
          Update Password
        </button>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white transition-all"
          style={{ background: settingsSaved ? "#10B981" : NAVY, fontSize: "0.85rem", fontWeight: 600 }}
        >
          {settingsSaved ? <><CheckCircle size={16} /> Settings Saved!</> : <><Save size={16} /> Save All Settings</>}
        </button>
      </div>
    </div>
  );
}

// ─── MERCHANTS SECTION ────────────────────────────────────────────────────────
type MerchantCategoryEntry = {
  id: number;
  name: string;
  description: string;
  status: "Available" | "Unavailable";
  createdAt: string;
};

const INITIAL_CATEGORIES: MerchantCategoryEntry[] = [
  { id: 1, name: "Retail Store", description: "General merchandise and sari-sari stores carrying everyday consumer goods.", status: "Available", createdAt: "2026-01-10" },
  { id: 2, name: "Restaurant", description: "Dine-in and take-out food establishments serving cooked meals and beverages.", status: "Available", createdAt: "2026-01-10" },
  { id: 3, name: "Pharmacy", description: "Drugstores dispensing prescription and over-the-counter medicines, vitamins, and health products.", status: "Available", createdAt: "2026-01-10" },
  { id: 4, name: "Department Store", description: "Large-format stores selling clothing, electronics, household items, and general merchandise.", status: "Available", createdAt: "2026-01-10" },
  { id: 5, name: "Convenience Store", description: "Small-format stores open extended hours offering snacks, beverages, and daily essentials.", status: "Available", createdAt: "2026-01-10" },
  { id: 6, name: "Cafés", description: "Coffee shops and casual dining spots serving beverages, pastries, and light meals.", status: "Available", createdAt: "2026-01-10" },
  { id: 7, name: "Bakery", description: "Establishments producing and selling fresh breads, cakes, pastries, and baked goods.", status: "Available", createdAt: "2026-01-10" },
  { id: 8, name: "Remittance", description: "Money transfer and remittance centers handling domestic and international cash transactions.", status: "Available", createdAt: "2026-01-10" },
  { id: 9, name: "Banks", description: "Financial institutions offering bills payment, deposits, withdrawals, and other banking services.", status: "Available", createdAt: "2026-01-10" },
  { id: 10, name: "Food Stalls", description: "Market-based and street-side stalls selling fresh produce, meat, fish, and cooked street food.", status: "Available", createdAt: "2026-01-10" },
  { id: 11, name: "Frozen Goods", description: "Specialty retailers offering frozen meats, seafood, and processed food items.", status: "Available", createdAt: "2026-01-10" },
  { id: 12, name: "Other", description: "Miscellaneous establishments not classified under any specific category above.", status: "Unavailable", createdAt: "2026-01-10" },
];

const CAT_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  "Retail Store": { bg: "#EFF6FF", text: "#1E40AF", icon: "🛒" },
  "Restaurant": { bg: "#FEF3C7", text: "#92400E", icon: "🍽️" },
  "Pharmacy": { bg: "#D1FAE5", text: "#065F46", icon: "💊" },
  "Department Store": { bg: "#E0E7FF", text: "#3730A3", icon: "🏬" },
  "Convenience Store": { bg: "#FCE7F3", text: "#9D174D", icon: "🏪" },
  "Cafés": { bg: "#FFEDD5", text: "#C2410C", icon: "☕" },
  "Bakery": { bg: "#FEF9C3", text: "#854D0E", icon: "🥐" },
  "Remittance": { bg: "#E0F2FE", text: "#0369A1", icon: "💸" },
  "Banks": { bg: "#DCFCE7", text: "#166534", icon: "🏦" },
  "Food Stalls": { bg: "#FEE2E2", text: "#991B1B", icon: "🥘" },
  "Frozen Goods": { bg: "#CFFAFE", text: "#155E75", icon: "🧊" },
  "Other": { bg: "#F3F4F6", text: "#4B5563", icon: "📦" },
};

function MerchantsSection() {
  const [catList, setCatList] = React.useState<MerchantCategoryEntry[]>(INITIAL_CATEGORIES);
  const [search, setSearch] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<"All" | "Available" | "Unavailable">("All");
  const [showModal, setShowModal] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<MerchantCategoryEntry | null>(null);

  const filtered = catList.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalAvailable = catList.filter(c => c.status === "Available").length;
  const totalUnavailable = catList.filter(c => c.status === "Unavailable").length;

  const handleToggle = (entry: MerchantCategoryEntry) => {
    setCatList(prev => prev.map(c =>
      c.id === entry.id
        ? { ...c, status: c.status === "Available" ? "Unavailable" : "Available" }
        : c
    ));
    toast.success(`"${entry.name}" marked as ${entry.status === "Available" ? "Unavailable" : "Available"}.`);
  };

  const handleSave = (name: string, description: string) => {
    if (editTarget) {
      setCatList(prev => prev.map(c => c.id === editTarget.id ? { ...c, name, description } : c));
      toast.success(`"${name}" updated.`);
    } else {
      const newEntry: MerchantCategoryEntry = {
        id: Date.now(),
        name,
        description,
        status: "Available",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCatList(prev => [...prev, newEntry]);
      toast.success(`"${name}" category added.`);
    }
    setShowModal(false);
    setEditTarget(null);
  };

  const openAdd = () => { setEditTarget(null); setShowModal(true); };
  const openEdit = (c: MerchantCategoryEntry) => { setEditTarget(c); setShowModal(true); };

  return (
    <div className="space-y-5">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard title="Total Categories" value={String(catList.length)} sub="Registered categories" icon={Store} color="#3B82F6" />
        <MetricCard title="Available" value={String(totalAvailable)} sub="Visible to dispatchers" icon={CheckCircle} color="#10B981" />
        <MetricCard title="Unavailable" value={String(totalUnavailable)} sub="Hidden from operations" icon={XCircle} color="#EF4444" />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3" style={{ border: "1px solid #E5E7EB" }}>
        <div className="relative flex-1 min-w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          <input
            type="text" placeholder="Search categories..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl outline-none"
            style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", fontSize: "0.85rem", color: "#1F2937" }}
          />
        </div>
        <div className="flex gap-2">
          {(["All", "Available", "Unavailable"] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={{ background: filterStatus === s ? NAVY : "#F3F4F6", color: filterStatus === s ? "#fff" : "#374151" }}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={openAdd}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-white"
          style={{ background: NAVY, fontSize: "0.85rem", fontWeight: 600 }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Category Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["#", "Category", "Description", "Status", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left" style={{ color: "#6B7280", fontSize: "0.75rem", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-10 text-center" style={{ color: "#9CA3AF", fontSize: "0.85rem" }}>No categories found.</td></tr>
            )}
            {filtered.map((c, i) => {
              const clr = CAT_COLORS[c.name] ?? { bg: "#F3F4F6", text: "#4B5563", icon: "📦" };
              return (
                <tr key={c.id} style={{ borderTop: i > 0 ? "1px solid #F3F4F6" : "none" }}>
                  <td className="px-5 py-4" style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>{i + 1}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: clr.bg }}>
                        {clr.icon}
                      </div>
                      <span style={{ color: clr.text, fontWeight: 700, fontSize: "0.9rem" }}>{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4" style={{ color: "#6B7280", fontSize: "0.82rem", maxWidth: 340 }}>{c.description}</td>
                  <td className="px-5 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: c.status === "Available" ? "#D1FAE5" : "#F3F4F6",
                        color: c.status === "Available" ? "#065F46" : "#6B7280",
                      }}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg" style={{ background: "#EFF6FF", color: "#1D4ED8" }} title="Edit">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleToggle(c)}
                        className="p-1.5 rounded-lg"
                        style={{
                          background: c.status === "Available" ? "#FEE2E2" : "#D1FAE5",
                          color: c.status === "Available" ? "#991B1B" : "#065F46",
                        }}
                        title={c.status === "Available" ? "Mark Unavailable" : "Mark Available"}>
                        {c.status === "Available" ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <MerchantCategoryModal
          existing={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          onSave={handleSave}
          allNames={catList.map(c => c.name)}
        />
      )}
    </div>
  );
}

// ─── Merchant Category Add/Edit Modal ────────────────────────────────────────
function MerchantCategoryModal({
  existing, onClose, onSave, allNames,
}: {
  existing: MerchantCategoryEntry | null;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  allNames: string[];
}) {
  const [name, setName] = React.useState(existing?.name ?? "");
  const [desc, setDesc] = React.useState(existing?.description ?? "");
  const [error, setError] = React.useState("");

  const handleSave = () => {
    setError("");
    if (!name.trim()) { setError("Category name is required."); return; }
    const duplicate = allNames.find(n => n.toLowerCase() === name.trim().toLowerCase() && n !== existing?.name);
    if (duplicate) { setError(`"${name}" already exists.`); return; }
    onSave(name.trim(), desc.trim());
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 10, outline: "none",
    background: "#F9FAFB", border: "1.5px solid #E5E7EB",
    fontSize: "0.85rem", color: "#1F2937",
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full mx-4" style={{ maxWidth: 480 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: NAVY, borderRadius: "1rem 1rem 0 0" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Store size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white" style={{ fontWeight: 700. }}>
                {existing ? "Edit Category" : "Add New Category"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.72rem" }}>Merchant Category Module</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.7)" }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 rounded-xl flex items-center gap-2" style={{ background: "#FEE2E2", color: "#991B1B", fontSize: "0.82rem" }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
          <div>
            <label style={{ color: "#374151", fontSize: "0.82rem", display: "block", marginBottom: 4 }}>Category Name *</label>
            <input style={inputStyle} value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Pharmacy, Bakery, Food Stalls..." />
          </div>
          <div>
            <label style={{ color: "#374151", fontSize: "0.82rem", display: "block", marginBottom: 4 }}>Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: 88, resize: "vertical" }}
              value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Brief description of what establishments fall under this category..." />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl"
            style={{ background: "#F3F4F6", color: "#374151", fontWeight: 600, fontSize: "0.85rem" }}>
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-white"
            style={{ background: NAVY, fontWeight: 600, fontSize: "0.85rem" }}>
            {existing ? "Save Changes" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TRACKING SECTION ─────────────────────────────────────────────────────────
function TrackingSection() {
  const activeRiders = riders.filter(r => r.status === "On Errand" || r.status === "Available");

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10" style={{ background: "rgba(255,255,255,0.95)", borderBottom: "1px solid #E5E7EB", backdropFilter: "blur(8px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: NAVY }}>
            <MapPin size={20} />
          </div>
          <div>
            <h3 style={{ color: "#1F2937", fontSize: "1rem", fontWeight: 700 }}>Live Rider Tracking</h3>
            <p style={{ color: "#6B7280", fontSize: "0.78rem" }}>Real-time GPS mapping of active personnel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl flex items-center gap-2" style={{ background: "#D1FAE5", color: "#065F46", fontSize: "0.8rem", fontWeight: 600 }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {activeRiders.length} Active Signal{activeRiders.length !== 1 && "s"}
          </span>
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 relative bg-gray-100 flex">
        {/* The map image itself */}
        <div className="flex-1 relative">
          <img src="/dispatch_map_placeholder.png" alt="Global Tracking Map" className="w-full h-full object-cover" />
          {/* Overlay gradient for aesthetics */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-900/10 to-transparent pointer-events-none" />
        </div>

        {/* Right Sidebar: Rider Activity */}
        <div className="w-72 bg-white flex flex-col z-10 shadow-xl" style={{ borderLeft: "1px solid #E5E7EB" }}>
          <div className="p-4" style={{ borderBottom: "1px solid #E5E7EB", background: "#F9FAFB" }}>
            <p style={{ color: "#1F2937", fontSize: "0.85rem", fontWeight: 700 }}>Active Personnel</p>
            <p style={{ color: "#6B7280", fontSize: "0.72rem" }}>Locating GPS modules...</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {activeRiders.map(r => {
              const e = errands.find(err => err.riderName === r.name && ["Assigned", "Traveling", "At Store", "Purchased", "En Route"].includes(err.status));
              return (
                <div key={r.id} className="p-3 rounded-xl transition-all hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: NAVY, fontSize: "0.6rem", fontWeight: 700 }}>
                        {r.avatar}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white" style={{ background: r.status === "On Errand" ? "#3B82F6" : "#10B981" }} />
                    </div>
                    <div>
                      <p style={{ color: "#1F2937", fontSize: "0.8rem", fontWeight: 600 }}>{r.name}</p>
                      <p style={{ color: r.status === "On Errand" ? "#2563EB" : "#059669", fontSize: "0.7rem", fontWeight: 500 }}>{r.status}</p>
                    </div>
                  </div>
                  {e && (
                    <div className="pl-11">
                      <p style={{ color: "#4B5563", fontSize: "0.72rem", lineHeight: 1.3 }}>
                        <span style={{ fontWeight: 600, color: NAVY }}>{e.id}</span> &bull; {e.status}
                      </p>
                      <p style={{ color: "#6B7280", fontSize: "0.65rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        Dest: {e.address}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN OWNER PORTAL ───────────────────────────────────────────────────────
export default function OwnerPortal() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead, dismiss } = useNotifications(ownerNotifications);

  const sectionTitles: Record<string, string> = {
    dashboard: "Dashboard",
    errands: "Errand Management",
    users: "User Management",
    riders: "Rider Management",
    merchants: "Merchant Category",
    rates: "Rate Management",
    reports: "Reports",
    settings: "Settings",
    tracking: "Live Rider Tracking",
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F3F4F6" }}>
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <div
        className="flex flex-col flex-shrink-0 transition-all duration-300"
        style={{ width: sidebarOpen ? 260 : 72, background: NAVY_DARK }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-9 h-9 rounded-xl flex-shrink-0" style={{ background: "#E53935" }} />
          {sidebarOpen && (
            <div>
              <p className="text-white" style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "0.05em" }}>Company Name</p>
              <p style={{ color: "#93C5FD", fontSize: "0.6rem", letterSpacing: "0.1em" }}>OWNER PORTAL</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="w-full flex items-center gap-3 px-5 py-3 transition-all"
                style={{
                  background: active ? "rgba(255,255,255,0.12)" : "transparent",
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                  borderLeft: active ? "3px solid #60A5FA" : "3px solid transparent",
                }}
              >
                <Icon size={18} className="flex-shrink-0" />
                {sidebarOpen && <span style={{ fontSize: "0.85rem" }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User info */}
        {sidebarOpen && (
          <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ background: "#E53935", fontSize: "0.75rem", fontWeight: 700 }}>AV</div>
              <div>
                <p className="text-white" style={{ fontSize: "0.82rem", fontWeight: 600 }}>Aljayvee Versola</p>
                <p style={{ color: "#93C5FD", fontSize: "0.72rem" }}>Business Owner</p>
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
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="relative flex items-center justify-between px-6 py-4 bg-white flex-shrink-0" style={{ borderBottom: "1px solid #E5E7EB" }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: "#6B7280" }}>
              <Menu size={20} />
            </button>
            <div>
              <h2 style={{ color: "#1F2937" }}>{sectionTitles[activeSection]}</h2>
              <p style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>Monday, March 23, 2026 — 11:32 AM</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
            <button
              onClick={() => toast.success("Data refreshed!", { description: "All sections are now up to date." })}
              className="p-2 rounded-xl"
              style={{ background: "#F3F4F6", color: "#374151" }}
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            markAllRead={markAllRead}
            markRead={markRead}
            dismiss={dismiss}
            accentColor={NAVY}
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSection === "dashboard" && <DashboardSection onViewAll={() => setActiveSection("errands")} />}
          {activeSection === "errands" && <ErrandsSection />}
          {activeSection === "users" && <UsersSection />}
          {activeSection === "riders" && <RidersSection />}
          {activeSection === "merchants" && <MerchantsSection />}
          {activeSection === "rates" && <RatesSection />}
          {activeSection === "reports" && <ReportsSection />}
          {activeSection === "tracking" && (
            <div className="h-[750px]">
              <TrackingSection />
            </div>
          )}
          {activeSection === "settings" && <SettingsSection />}
        </div>
      </div>
    </div>
  );
}
