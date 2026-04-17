export const DUMMY_ACCOUNTS = [
  {
    id: 1,
    username: "owner",
    password: "owner123",
    role: "owner" as const,
    name: "Aljayvee Versola",
    email: "aj.versola@company.ph",
    phone: "09171234567",
    avatar: "AV",
    position: "Business Owner",
  },
  {
    id: 2,
    username: "dispatcher",
    password: "dispatch123",
    role: "dispatcher" as const,
    name: "Mark Dennis Batcharo",
    email: "md.batcharo@company.ph",
    phone: "09281234567",
    avatar: "MB",
    position: "Head Dispatcher",
  },
  {
    id: 3,
    username: "rider01",
    password: "rider123",
    role: "rider" as const,
    name: "Al-Dhen Musali",
    email: "ad.musali@company.ph",
    phone: "09391234567",
    avatar: "AM",
    position: "Delivery Rider",
    vehicleType: "Motorcycle",
    plateNumber: "ABC-1234",
    riderId: "RDR-001",
  },
  {
    id: 4,
    username: "customer",
    password: "customer123",
    role: "customer" as const,
    name: "Jiane Gamboa",
    email: "jiane.gamboa@gmail.com",
    phone: "09501234567",
    avatar: "JG",
    address: "Blk 12 Lot 5, Maharlika Highway, Barangay Calean, Tacurong City",
    landmark: "Near SM City Sultan Kudarat",
  },
];

export type RiderStatus = "Available" | "On Errand" | "Offline";
export type ErrandStatus =
  | "Pending"
  | "Assigned"
  | "Traveling"
  | "At Store"
  | "Purchased"
  | "En Route"
  | "Delivered"
  | "Cancelled";
export type ErrandType = "Pabili" | "Padala" | "Bills Payment";
export type PaymentMode = "Cash on Delivery" | "GCash" | "Bank Transfer";
export type MerchantStatus = "Active" | "Inactive" | "Temporarily Closed";
export type MerchantCategory = 
  | "All"
  | "Retail Store"
  | "Restaurant"
  | "Pharmacy"
  | "Department Store"
  | "Convenience Store"
  | "Cafés"
  | "Bakery"
  | "Remittance"
  | "Banks"
  | "Food Stalls"
  | "Frozen Goods"
  | "Other";



export interface Merchant {
  id: number;
  businessName: string;
  categories: MerchantCategory[];
  city: string;
  municipality: string;
  barangay: string;
  purok: string;
  street: string;
  landmark: string;
  description: string;
  operatingHours: { open: string; close: string };
  status: MerchantStatus;
  createdAt: string;
  updatedAt: string;
  auditLog: AuditLogEntry[];
}

export interface Rider {
  id: number;
  name: string;
  phone: string;
  status: RiderStatus;
  completedToday: number;
  plateNumber: string;
  avatar: string;
  currentErrand?: string;
  avgTime?: string;
  rating?: number;
  active?: boolean;
  auditLog?: AuditLogEntry[];
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  by: string;
  detail?: string;
}

export interface DeclineLog {
  id: string;
  errandId: string;
  riderId: number;
  riderName: string;
  reason: string;
  timestamp: string;
}

export const declineLogs: DeclineLog[] = [];

export interface Errand {
  id: string;
  type: ErrandType;
  customer: string;
  customerPhone: string;
  address: string;
  landmark: string;
  paymentMode: PaymentMode;
  status: ErrandStatus;
  riderId?: number;
  riderName?: string;
  merchantId?: number;
  merchantName?: string;
  amount: number;
  serviceFee: number;
  commission?: number;
  surcharge?: number;
  createdAt: string;
  updatedAt: string;
  distance?: string;
  storeCount?: number;
  auditLog?: AuditLogEntry[];
}

// ─── MESSAGING ────────────────────────────────────────────────────────────────
export type ChatRole = "customer" | "dispatcher" | "rider";

export interface ChatMessage {
  id: number;
  from: ChatRole;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  errandId: string;
  type: "customer-dispatcher" | "dispatcher-rider" | "customer-rider";
  messages: ChatMessage[];
}

export const conversations: Conversation[] = [
  {
    id: "conv-cd-001",
    errandId: "SGO-001",
    type: "customer-dispatcher",
    messages: [
      { id: 1, from: "dispatcher", text: "Hi! I am your dispatcher. What can I help you with today?", timestamp: "10:31 AM" },
      { id: 2, from: "customer", text: "I'd like to request a Pabili. Can you buy Pizza from Parties Tesoro Place and 1 can of Prito Sardines from the grocery?", timestamp: "10:32 AM" },
      { id: 3, from: "dispatcher", text: "Noted. Your total will be 890 pesos. Will you be paying via Cash on Delivery?", timestamp: "10:33 AM" },
      { id: 4, from: "customer", text: "Yes, COD is fine.", timestamp: "10:34 AM" },
      { id: 5, from: "dispatcher", text: "Great! Please click the payment mode button below to confirm your order.", timestamp: "10:35 AM" },
      { id: 6, from: "dispatcher", text: "I have assigned rider Al-Dhen Musali to your request.", timestamp: "10:36 AM" },
    ],
  },
  {
    id: "conv-dr-001",
    errandId: "SGO-001",
    type: "dispatcher-rider",
    messages: [
      { id: 1, from: "dispatcher", text: "Hey Al-Dhen, please pick up the Pabili order from Sago on the Go. Customer is Jiane Gamboa.", timestamp: "10:37 AM" },
      { id: 2, from: "rider", text: "Noted po. On my way to Parties Tesoro Place now.", timestamp: "10:38 AM" },
      { id: 3, from: "dispatcher", text: "Customer prefers COD. Total is ₱890. Please have change ready.", timestamp: "10:39 AM" },
      { id: 4, from: "rider", text: "Understood. Will update once items are purchased.", timestamp: "10:40 AM" },
    ],
  },
  {
    id: "conv-cr-001",
    errandId: "SGO-001",
    type: "customer-rider",
    messages: [
      { id: 1, from: "rider", text: "Hi! I'm Al-Dhen, your assigned rider. I'm now heading to the store.", timestamp: "10:38 AM" },
      { id: 2, from: "customer", text: "Great! Please make sure to get the right size conditioner — 300ml.", timestamp: "10:39 AM" },
      { id: 3, from: "rider", text: "Got it! 300ml conditioner noted. I'll send a photo before departing the store.", timestamp: "10:40 AM" },
      { id: 4, from: "customer", text: "Thank you so much!", timestamp: "10:41 AM" },
    ],
  },
];

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address: string;
  landmark: string;
  totalErrands: number;
  lastErrand: string;
  status: "Regular" | "New" | "VIP";
  active?: boolean;
  auditLog?: AuditLogEntry[];
}

export const riders: Rider[] = [
  { id: 1, name: "Al-Dhen Musali", phone: "09391234567", status: "Available", completedToday: 5, plateNumber: "ABC-1234", avatar: "AM", avgTime: "28 min", rating: 4.8 },
  { id: 2, name: "Mario Santos", phone: "09392345678", status: "On Errand", completedToday: 8, plateNumber: "DEF-5678", avatar: "MS", currentErrand: "SGO-003", avgTime: "24 min", rating: 4.9 },
  { id: 3, name: "Jose Dela Cruz", phone: "09393456789", status: "Available", completedToday: 3, plateNumber: "GHI-9012", avatar: "JD", avgTime: "32 min", rating: 4.5 },
  { id: 4, name: "Pedro Reyes", phone: "09394567890", status: "Offline", completedToday: 0, plateNumber: "JKL-3456", avatar: "PR", avgTime: "30 min", rating: 4.3 },
  { id: 5, name: "Antonio Garcia", phone: "09395678901", status: "On Errand", completedToday: 6, plateNumber: "MNO-7890", avatar: "AG", currentErrand: "SGO-005", avgTime: "26 min", rating: 4.7 },
  { id: 6, name: "Ramon Torres", phone: "09396789012", status: "Available", completedToday: 4, plateNumber: "PQR-1234", avatar: "RT", avgTime: "29 min", rating: 4.6 },
  { id: 7, name: "Fernando Lopez", phone: "09397890123", status: "Available", completedToday: 7, plateNumber: "STU-5678", avatar: "FL", avgTime: "22 min", rating: 4.9 },
  { id: 8, name: "Miguel Flores", phone: "09398901234", status: "On Errand", completedToday: 9, plateNumber: "VWX-9012", avatar: "MF", currentErrand: "SGO-007", avgTime: "25 min", rating: 4.8 },
  { id: 9, name: "Roberto Mendoza", phone: "09399012345", status: "Offline", completedToday: 0, plateNumber: "YZA-3456", avatar: "RM", avgTime: "35 min", rating: 4.2 },
  { id: 10, name: "Eduardo Cruz", phone: "09300123456", status: "Available", completedToday: 2, plateNumber: "BCD-7890", avatar: "EC", avgTime: "31 min", rating: 4.4 },
  { id: 11, name: "Danilo Ramos", phone: "09301234567", status: "Available", completedToday: 5, plateNumber: "EFG-1234", avatar: "DR", avgTime: "27 min", rating: 4.7 },
  { id: 12, name: "Ricardo Villanueva", phone: "09302345678", status: "On Errand", completedToday: 6, plateNumber: "HIJ-5678", avatar: "RV", currentErrand: "SGO-009", avgTime: "23 min", rating: 4.8 },
];

export const errands: Errand[] = [
  { id: "SGO-001", type: "Pabili", customer: "Jiane Gamboa", customerPhone: "09501234567", address: "Maharlika Highway, Brgy Calean", landmark: "Near SM Sultan Kudarat", paymentMode: "Cash on Delivery", status: "Pending", amount: 850, serviceFee: 50, commission: 50, createdAt: "10:45 AM", updatedAt: "10:45 AM", distance: "2.5 km", storeCount: 1 },
  { id: "SGO-002", type: "Padala", customer: "Mark Torres", customerPhone: "09502345678", address: "Brgy Buenaflor, Tacurong", landmark: "Blue gate near sari-sari store", paymentMode: "GCash", status: "Assigned", riderId: 1, riderName: "Al-Dhen Musali", amount: 120, serviceFee: 35, createdAt: "10:30 AM", updatedAt: "10:45 AM", distance: "1.8 km" },
  { id: "SGO-003", type: "Pabili", customer: "Sarah Dela Cruz", customerPhone: "09503456789", address: "Brgy Upper Katungal", landmark: "White house corner Mango St", paymentMode: "Cash on Delivery", status: "En Route", riderId: 2, riderName: "Mario Santos", amount: 1350, serviceFee: 60, commission: 135, createdAt: "09:45 AM", updatedAt: "11:00 AM", distance: "4.2 km", storeCount: 1 },
  { id: "SGO-004", type: "Bills Payment", customer: "Ben Navarro", customerPhone: "09504567890", address: "Brgy Edsa, Tacurong", landmark: "Near BDO ATM", paymentMode: "Cash on Delivery", status: "Pending", amount: 2500, serviceFee: 45, createdAt: "11:05 AM", updatedAt: "11:05 AM", distance: "3.1 km" },
  { id: "SGO-005", type: "Pabili", customer: "Rose Fernandez", customerPhone: "09505678901", address: "Brgy Tina, Isulan", landmark: "Corner shop near church", paymentMode: "GCash", status: "At Store", riderId: 5, riderName: "Antonio Garcia", amount: 750, serviceFee: 70, commission: 50, createdAt: "10:00 AM", updatedAt: "10:50 AM", distance: "5.5 km", storeCount: 1 },
  { id: "SGO-006", type: "Padala", customer: "Jun Apostol", customerPhone: "09506789012", address: "Brgy New Isabela", landmark: "Red roof near school", paymentMode: "Cash on Delivery", status: "Delivered", riderId: 3, riderName: "Jose Dela Cruz", amount: 200, serviceFee: 40, createdAt: "09:00 AM", updatedAt: "09:45 AM", distance: "2.0 km" },
  { id: "SGO-007", type: "Pabili", customer: "Maria Cruz", customerPhone: "09507890123", address: "Brgy Poblacion, Lambayong", landmark: "Near municipal hall", paymentMode: "GCash", status: "Traveling", riderId: 8, riderName: "Miguel Flores", amount: 450, serviceFee: 80, commission: 50, createdAt: "11:10 AM", updatedAt: "11:20 AM", distance: "7.0 km", storeCount: 2, surcharge: 25 },
  { id: "SGO-008", type: "Bills Payment", customer: "Leo Villarin", customerPhone: "09508901234", address: "Brgy Calean, Tacurong", landmark: "Green fence near water refill", paymentMode: "Cash on Delivery", status: "Delivered", riderId: 6, riderName: "Ramon Torres", amount: 1800, serviceFee: 45, createdAt: "08:30 AM", updatedAt: "09:15 AM", distance: "1.5 km" },
  { id: "SGO-009", type: "Pabili", customer: "Cora Manalo", customerPhone: "09509012345", address: "Brgy Kakar, Tacurong", landmark: "White bungalow near basketball court", paymentMode: "Cash on Delivery", status: "Purchased", riderId: 12, riderName: "Ricardo Villanueva", amount: 2200, serviceFee: 60, commission: 220, createdAt: "10:45 AM", updatedAt: "11:30 AM", distance: "3.8 km", storeCount: 1 },
  { id: "SGO-010", type: "Padala", customer: "Allan Bautista", customerPhone: "09500123456", address: "Brgy Upper Katungal", landmark: "2-storey house blue gate", paymentMode: "GCash", status: "Cancelled", amount: 150, serviceFee: 35, createdAt: "10:00 AM", updatedAt: "10:15 AM", distance: "2.1 km" },
];

export const customers: Customer[] = [
  { id: 1, name: "Jiane Gamboa", phone: "09501234567", email: "jiane.gamboa@gmail.com", address: "Maharlika Highway, Brgy Calean, Tacurong City", landmark: "Near SM Sultan Kudarat", totalErrands: 24, lastErrand: "Today, 10:45 AM", status: "VIP" },
  { id: 2, name: "Mark Torres", phone: "09502345678", address: "Brgy Buenaflor, Tacurong City", landmark: "Blue gate near sari-sari store", totalErrands: 12, lastErrand: "Today, 10:30 AM", status: "Regular" },
  { id: 3, name: "Sarah Dela Cruz", phone: "09503456789", address: "Brgy Upper Katungal, Tacurong City", landmark: "White house corner Mango St", totalErrands: 8, lastErrand: "Today, 09:45 AM", status: "Regular" },
  { id: 4, name: "Ben Navarro", phone: "09504567890", address: "Brgy Edsa, Tacurong City", landmark: "Near BDO ATM", totalErrands: 3, lastErrand: "Today, 11:05 AM", status: "New" },
  { id: 5, name: "Rose Fernandez", phone: "09505678901", email: "rose.fernandez@gmail.com", address: "Brgy Tina, Isulan, Sultan Kudarat", landmark: "Corner shop near church", totalErrands: 15, lastErrand: "Today, 10:00 AM", status: "VIP" },
  { id: 6, name: "Jun Apostol", phone: "09506789012", address: "Brgy New Isabela, Tacurong City", landmark: "Red roof near school", totalErrands: 6, lastErrand: "Today, 09:00 AM", status: "Regular" },
  { id: 7, name: "Maria Cruz", phone: "09507890123", address: "Brgy Poblacion, Lambayong", landmark: "Near municipal hall", totalErrands: 19, lastErrand: "Today, 11:10 AM", status: "VIP" },
  { id: 8, name: "Leo Villarin", phone: "09508901234", address: "Brgy Calean, Tacurong City", landmark: "Green fence near water refill", totalErrands: 9, lastErrand: "Today, 08:30 AM", status: "Regular" },
];

export const revenueData = [
  { hour: "7 AM", revenue: 285, errands: 3 },
  { hour: "8 AM", revenue: 520, errands: 5 },
  { hour: "9 AM", revenue: 1240, errands: 8 },
  { hour: "10 AM", revenue: 980, errands: 6 },
  { hour: "11 AM", revenue: 760, errands: 5 },
  { hour: "12 PM", revenue: 1450, errands: 9 },
  { hour: "1 PM", revenue: 890, errands: 6 },
  { hour: "2 PM", revenue: 1120, errands: 7 },
];

export const weeklyData = [
  { day: "Mon", revenue: 4250, errands: 28 },
  { day: "Tue", revenue: 3890, errands: 24 },
  { day: "Wed", revenue: 5120, errands: 33 },
  { day: "Thu", revenue: 4680, errands: 30 },
  { day: "Fri", revenue: 6230, errands: 41 },
  { day: "Sat", revenue: 7450, errands: 48 },
  { day: "Sun", revenue: 3200, errands: 20 },
];

export const serviceTypeData = [
  { name: "Pabili", value: 65, color: "#3B82F6" },
  { name: "Padala", value: 22, color: "#10B981" },
  { name: "Bills Payment", value: 13, color: "#F59E0B" },
];

export const rateConfig = {
  baseFee: 70,
  perKmFee: 5,
  // ₱30 per additional store beyond the first, capped at 2 additional stores (3 total)
  multiStoreSurcharge: 30,
  multiStoreLimit: 2,          // maximum additional stores allowed
  commissionThreshold: 3000,
  commissionFlat: 50,
  commissionPercent: 0.1,
  nonCodThreshold: 3000,
  nonCodFeeBase: 15,
  nonCodFeePremium: 50,
  distanceBrackets: [],
};

/**
 * Centrally calculates the service fee, commission, and surcharge based on business rules.
 * @param type - Errand Type
 * @param distance - Distance in km
 * @param amount - Total purchase/bill amount
 * @param storeCount - Number of stores visited (for Multi-store surcharge)
 * @param isNonCod - If the payment mode is not Cash on Delivery
 */
export const calculateErrandFees = (
  type: ErrandType,
  distance: number,
  amount: number,
  storeCount: number = 1,
  isNonCod: boolean = false
) => {
  let serviceFee = rateConfig.baseFee;
  if (distance > 1) {
    serviceFee += (distance - 1) * rateConfig.perKmFee;
  }

  let surcharge = 0;
  if (storeCount > 1) {
    // ₱30 per additional store, capped at rateConfig.multiStoreLimit additional stops
    // e.g. 2 stores → ₱30, 3 stores → ₱60 (max), 4+ stores → still ₱60
    surcharge = Math.min(storeCount - 1, rateConfig.multiStoreLimit) * rateConfig.multiStoreSurcharge;
  }

  if (isNonCod) {
    surcharge += amount >= rateConfig.nonCodThreshold ? rateConfig.nonCodFeePremium : rateConfig.nonCodFeeBase;
  }

  let commission = 0;
  if (type === "Pabili") {
    commission = amount >= rateConfig.commissionThreshold 
      ? amount * rateConfig.commissionPercent 
      : rateConfig.commissionFlat;
  }

  return { serviceFee, commission, surcharge, total: serviceFee + commission + surcharge };
};

export const riderCurrentErrand: Errand = {
  id: "SGO-002",
  type: "Padala",
  customer: "Mark Torres",
  customerPhone: "09502345678",
  address: "Brgy Buenaflor, Tacurong",
  landmark: "Blue gate near sari-sari store",
  paymentMode: "GCash",
  status: "Assigned",
  riderId: 1,
  riderName: "Al-Dhen Musali",
  amount: 120,
  serviceFee: 35,
  createdAt: "10:30 AM",
  updatedAt: "10:45 AM",
  distance: "1.8 km",
};

export const riderEarnings = {
  today: { trips: 5, baseFee: 235, commission: 50, total: 285 },
  week: { trips: 32, baseFee: 1480, commission: 320, total: 1800 },
  month: { trips: 128, baseFee: 5920, commission: 1280, total: 7200 },
};

export const merchants: Merchant[] = [
  {
    id: 1,
    businessName: "Aling Rosa's Sari-Sari Store",
    categories: ["Retail Store"],
    city: "Tacurong City",
    municipality: "Tacurong",
    barangay: "Brgy. Calean",
    purok: "Purok 3",
    street: "Maharlika Highway",
    landmark: "Near SM Sultan Kudarat",
    description: "General merchandise store offering a wide variety of grocery items and daily essentials.",
    operatingHours: { open: "06:00", close: "21:00" },
    status: "Active",
    createdAt: "2026-01-10",
    updatedAt: "2026-04-07",
    auditLog: [
      { timestamp: "2026-01-10 09:00 AM", action: "Merchant created", by: "Aljayvee Versola" },
      { timestamp: "2026-04-07 10:30 AM", action: "Operating hours updated (06:00–21:00)", by: "Aljayvee Versola" },
    ],
  },
  {
    id: 2,
    businessName: "BDO / Bayad Center Tacurong",
    categories: ["Remittance", "Banks"],
    city: "Tacurong City",
    municipality: "Tacurong",
    barangay: "Brgy. Edsa",
    purok: "Purok 1",
    street: "National Highway",
    landmark: "Near BDO ATM, Ground Floor Tacurong Commercial Center",
    description: "Authorized bills payment center for utilities, telco, insurance, and government fees.",
    operatingHours: { open: "08:00", close: "17:00" },
    status: "Active",
    createdAt: "2026-01-15",
    updatedAt: "2026-03-20",
    auditLog: [
      { timestamp: "2026-01-15 08:30 AM", action: "Merchant created", by: "Aljayvee Versola" },
    ],
  },
  {
    id: 3,
    businessName: "Rose Pharmacy Isulan Branch",
    categories: ["Pharmacy"],
    city: "Isulan",
    municipality: "Isulan",
    barangay: "Brgy. Tina",
    purok: "Purok 2",
    street: "Quezon Ave.",
    landmark: "Corner shop near Holy Child Parish Church",
    description: "Full-service pharmacy offering prescription and OTC medicines, vitamins, and health supplies.",
    operatingHours: { open: "07:00", close: "22:00" },
    status: "Active",
    createdAt: "2026-01-20",
    updatedAt: "2026-02-14",
    auditLog: [
      { timestamp: "2026-01-20 11:00 AM", action: "Merchant created", by: "Aljayvee Versola" },
    ],
  },
  {
    id: 4,
    businessName: "GM Supermarket Tacurong",
    categories: ["Department Store", "Retail Store"],
    city: "Tacurong City",
    municipality: "Tacurong",
    barangay: "Brgy. Poblacion",
    purok: "Purok 5",
    street: "Mabini Street",
    landmark: "Next to Municipal Hall",
    description: "Mid-size supermarket with wide selection of fresh produce, deli, and household goods.",
    operatingHours: { open: "08:00", close: "20:00" },
    status: "Active",
    createdAt: "2026-02-01",
    updatedAt: "2026-04-01",
    auditLog: [
      { timestamp: "2026-02-01 09:00 AM", action: "Merchant created", by: "Aljayvee Versola" },
      { timestamp: "2026-04-01 03:00 PM", action: "Status changed: Inactive → Active", by: "Aljayvee Versola" },
    ],
  },
  {
    id: 5,
    businessName: "Palawan Pawnshop & Padala Center",
    categories: ["Remittance"],
    city: "Tacurong City",
    municipality: "Tacurong",
    barangay: "Brgy. New Isabela",
    purok: "Purok 1",
    street: "Rizal Street",
    landmark: "Red roof stall near Tacurong Elementary School",
    description: "Remittance, bills payment, and pawnshop services. Accepts SSS, PhilHealth, Meralco, DITO, Globe, Smart payments.",
    operatingHours: { open: "08:00", close: "18:00" },
    status: "Active",
    createdAt: "2026-02-05",
    updatedAt: "2026-02-05",
    auditLog: [
      { timestamp: "2026-02-05 09:30 AM", action: "Merchant created", by: "Aljayvee Versola" },
    ],
  },
  {
    id: 6,
    businessName: "Mang Tino's Mini Grocery",
    categories: ["Convenience Store"],
    city: "Tacurong City",
    municipality: "Tacurong",
    barangay: "Brgy. Buenaflor",
    purok: "Purok 4",
    street: "Barangay Road",
    landmark: "Blue gate near sari-sari store cluster",
    description: "Neighborhood grocery known for competitive pricing on goods, snacks and beverages.",
    operatingHours: { open: "07:00", close: "20:00" },
    status: "Active",
    createdAt: "2026-02-10",
    updatedAt: "2026-03-15",
    auditLog: [
      { timestamp: "2026-02-10 08:00 AM", action: "Merchant created", by: "Aljayvee Versola" },
      { timestamp: "2026-03-15 06:00 PM", action: "Marked Temporarily Closed (early closing due to inventory)", by: "Aljayvee Versola" },
      { timestamp: "2026-03-16 07:15 AM", action: "Status restored to Active", by: "Aljayvee Versola" },
    ],
  },
  {
    id: 7,
    businessName: "DITO & Globe Payment Hub",
    categories: ["Remittance", "Retail Store"],
    city: "Tacurong City",
    municipality: "Tacurong",
    barangay: "Brgy. Kakar",
    purok: "Purok 2",
    street: "Guerrero Street",
    landmark: "White bungalow near Kakar basketball court",
    description: "Multi-service hub accepting telecom load, bills, and basic grocery top-ups.",
    operatingHours: { open: "08:00", close: "20:00" },
    status: "Active",
    createdAt: "2026-02-18",
    updatedAt: "2026-02-18",
    auditLog: [
      { timestamp: "2026-02-18 10:00 AM", action: "Merchant created with dual categories", by: "Aljayvee Versola" },
    ],
  },
  {
    id: 8,
    businessName: "Lambayong Public Market Stall 12",
    categories: ["Food Stalls"],
    city: "Lambayong",
    municipality: "Lambayong",
    barangay: "Brgy. Poblacion",
    purok: "Purok 1",
    street: "Municipal Market Road",
    landmark: "Near Lambayong Municipal Hall Market Wings",
    description: "Public market stall offering fresh vegetables, meat, and fish for daily Pabili orders.",
    operatingHours: { open: "05:00", close: "12:00" },
    status: "Active",
    createdAt: "2026-03-01",
    updatedAt: "2026-03-01",
    auditLog: [
      { timestamp: "2026-03-01 06:00 AM", action: "Merchant created", by: "Aljayvee Versola" },
    ],
  },
  {
    id: 9,
    businessName: "Santiago Hardware Supply",
    categories: ["Retail Store"],
    city: "Tacurong City",
    municipality: "Tacurong",
    barangay: "Brgy. Upper Katungal",
    purok: "Purok 3",
    street: "Mango Street",
    landmark: "White house on corner Mango St",
    description: "Hardware, construction materials, and home improvement supplies.",
    operatingHours: { open: "07:30", close: "17:30" },
    status: "Inactive",
    createdAt: "2026-03-05",
    updatedAt: "2026-04-02",
    auditLog: [
      { timestamp: "2026-03-05 09:00 AM", action: "Merchant created", by: "Aljayvee Versola" },
      { timestamp: "2026-04-02 11:00 AM", action: "Status changed: Active → Inactive (Renovation)", by: "Aljayvee Versola" },
    ],
  },
  {
    id: 10,
    businessName: "Meralco / SEWS Authorized Payment Center",
    categories: ["Bills Payment"],
    city: "Tacurong City",
    municipality: "Tacurong",
    barangay: "Brgy. Calean",
    purok: "Purok 2",
    street: "Maharlika Highway",
    landmark: "Green fence near water refilling station",
    description: "Official Meralco and Sultan Kudarat Electric cooperative payment center.",
    operatingHours: { open: "08:00", close: "17:00" },
    status: "Active",
    createdAt: "2026-03-10",
    updatedAt: "2026-03-10",
    auditLog: [
      { timestamp: "2026-03-10 08:00 AM", action: "Merchant created", by: "Aljayvee Versola" },
    ],
  },
];
