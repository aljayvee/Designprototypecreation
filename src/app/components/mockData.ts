export const DUMMY_ACCOUNTS = [
  {
    id: 1,
    username: "owner",
    password: "owner123",
    role: "owner" as const,
    name: "John Dominic Arellano",
    email: "jd.arellano@sugo.ph",
    phone: "09171234567",
    avatar: "JA",
    position: "Business Owner",
  },
  {
    id: 2,
    username: "dispatcher",
    password: "dispatch123",
    role: "dispatcher" as const,
    name: "Ana Marie Villanueva",
    email: "am.villanueva@sugo.ph",
    phone: "09281234567",
    avatar: "AV",
    position: "Head Dispatcher",
  },
  {
    id: 3,
    username: "rider01",
    password: "rider123",
    role: "rider" as const,
    name: "Carlos Reyes Bautista",
    email: "cr.bautista@sugo.ph",
    phone: "09391234567",
    avatar: "CB",
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
    name: "Liza Marie Reyes",
    email: "liza.reyes@gmail.com",
    phone: "09501234567",
    avatar: "LR",
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
}

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
  amount: number;
  serviceFee: number;
  commission?: number;
  surcharge?: number;
  createdAt: string;
  updatedAt: string;
  distance?: string;
  storeCount?: number;
}

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
}

export const riders: Rider[] = [
  { id: 1, name: "Carlos Bautista", phone: "09391234567", status: "Available", completedToday: 5, plateNumber: "ABC-1234", avatar: "CB", avgTime: "28 min", rating: 4.8 },
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
  { id: "SGO-001", type: "Pabili", customer: "Liza Reyes", customerPhone: "09501234567", address: "Maharlika Highway, Brgy Calean", landmark: "Near SM Sultan Kudarat", paymentMode: "Cash on Delivery", status: "Pending", amount: 850, serviceFee: 50, commission: 50, createdAt: "10:45 AM", updatedAt: "10:45 AM", distance: "2.5 km", storeCount: 1 },
  { id: "SGO-002", type: "Padala", customer: "Mark Torres", customerPhone: "09502345678", address: "Brgy Buenaflor, Tacurong", landmark: "Blue gate near sari-sari store", paymentMode: "GCash", status: "Assigned", riderId: 1, riderName: "Carlos Bautista", amount: 120, serviceFee: 35, createdAt: "10:30 AM", updatedAt: "10:45 AM", distance: "1.8 km" },
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
  { id: 1, name: "Liza Reyes", phone: "09501234567", email: "liza.reyes@gmail.com", address: "Maharlika Highway, Brgy Calean, Tacurong City", landmark: "Near SM Sultan Kudarat", totalErrands: 24, lastErrand: "Today, 10:45 AM", status: "VIP" },
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
  distanceBrackets: [
    { range: "0 - 2 km", fee: 30 },
    { range: "2.1 - 4 km", fee: 45 },
    { range: "4.1 - 6 km", fee: 60 },
    { range: "6.1 - 8 km", fee: 75 },
    { range: "8.1 - 10 km", fee: 90 },
    { range: "Lambayong / Isulan", fee: 120 },
  ],
  multiStoreSurcharge: 25,
  groceryCommissionFlat: 50,
  groceryCommissionPercent: 10,
  groceryThreshold: 1000,
  highValueThreshold: 3000,
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
  riderName: "Carlos Bautista",
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
