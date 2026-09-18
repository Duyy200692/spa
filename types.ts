
export enum Role {
  Product = 'Product',
  Marketing = 'Marketing',
  Management = 'Management',
  Reception = 'Reception',
  Accountant = 'Accountant', 
}

export interface User {
  id: string;
  name: string;
  role: Role;
  username: string;
  password?: string;
}

export type ServiceType = 'single' | 'combo' | 'spa';

export interface Service {
  id: string;
  name: string;
  description: string;
  type: ServiceType;
  category?: string;
  consultationNote?: string;
  
  priceOriginal: number;
  discountPercent?: number;
  pricePromo: number;
  pricePackage5: number;
  pricePackage15: number;
  
  pricePackage3: number;
  pricePackage5Sessions: number;
  pricePackage10: number;
  pricePackage20: number;

  // SPA Specific Pricing (in VND)
  price30?: number;
  price60?: number;
  price90?: number;
  price120?: number;
}

export enum PromotionStatus {
  PendingDesign = 'Pending Design',
  PendingApproval = 'Pending Approval',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface PromotionService extends Service {
  discountPrice: number;
  fullPrice: number;
  isCombo?: boolean;
  selectedDuration?: '30' | '60' | '90' | '120' | 'other'; // New field for Spa duration
}

export interface Promotion {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  services: PromotionService[];
  salesNotes?: string;
  marketingNotes?: string;
  managementNotes?: string;
  designUrl?: string;
  proposerId: string;
  consultationNote?: string;
}

// --- INVENTORY TYPES ---

export interface InventoryBatch {
    expiryDate: string; // YYYY-MM-DD
    quantity: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string; 
  quantity: number; // Tổng tồn kho
  location: string; 
  expiryDate?: string; // Date gần nhất (để sort)
  minThreshold?: number;
  notes?: string;
  batches?: InventoryBatch[]; // Danh sách các lô hàng
}

// UPDATE: Added 'audit_adjustment' type
export type TransactionType = 'in' | 'out' | 'audit_adjustment'; 

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: TransactionType;
  quantity: number;
  date: string; 
  performedBy: string; 
  performedById: string; 
  reason?: string; 
  remainingStock: number;
}

// --- NEW: AUDIT TYPES ---
export interface AuditItem {
    itemId: string;
    itemName: string;
    systemQty: number; // Tồn trên phần mềm tại thời điểm tạo phiếu
    actualQty: number; // Tồn thực tế đếm được
    diff: number; // Chênh lệch (Actual - System)
    reason?: string; // Lý do chênh lệch
}

export interface AuditSession {
    id: string;
    name: string; // VD: Kiểm kê Tháng 12/2025
    month: number;
    year: number;
    status: 'open' | 'closed'; // open: đang kiểm, closed: đã chốt
    createdBy: string;
    createdDate: string;
    closedDate?: string;
    items: AuditItem[];
}

// --- HR & PERSONNEL MANAGEMENT TYPES ---

export type StaffStatus = 'active' | 'resigned';

export interface StaffMember {
  id: string;
  code: string; // Mã nhân viên: NV01, KTV01,...
  name: string;
  phone: string;
  email?: string;
  position: string; // Chức vụ: Kỹ thuật viên Spa, Lễ tân, Kế toán, Quản lý,...
  department: string; // Kỹ thuật / Lễ tân / Kế toán / Quản lý / Hậu cần
  isTechnician: boolean; // Có tính tour dịch vụ hay không
  status: StaffStatus; // 'active' (đang làm việc) | 'resigned' (đã nghỉ việc)
  joinDate: string; // YYYY-MM-DD
  resignedDate?: string; // YYYY-MM-DD (nếu đã nghỉ)
  resignedReason?: string; // Lý do nghỉ việc
  baseSalary: number; // Lương cơ bản hàng tháng
  allowance: number; // Phụ cấp cố định (ăn trưa, trách nhiệm...)
  tourRateDefault: number; // Hoa hồng/tour mặc định (ví dụ 80,000 VND)
  bankAccount?: string;
  bankName?: string;
  citizenId?: string; // CCCD
  note?: string;
}

export type DayAttendanceStatus = 'P' | 'N' | 'CP' | 'KP' | 'OFF' | 'OT';
// P: Đủ công (1 công), N: Nửa công (0.5), CP: Có phép, KP: Không phép, OFF: Nghỉ tuần/lễ, OT: Tăng ca

export interface AttendanceRecord {
  id: string;
  staffId: string;
  month: number; // 1-12
  year: number;
  days: Record<number, DayAttendanceStatus>; // ngày 1..31 -> status
  totalWorkDays: number; // Tổng ngày công tính lương
  leaveDays: number; // Số ngày nghỉ phép
  unauthorizedLeaveDays: number; // Số ngày nghỉ không phép
  otHours: number; // Số giờ tăng ca
  note?: string;
}

export interface TechnicianTour {
  id: string;
  technicianId: string;
  technicianName: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  serviceName: string;
  customerName?: string;
  room?: string;
  durationMinutes: number; // 30, 60, 90, 120
  commissionAmount: number; // Tiền hoa hồng tour KTV nhận được (VND)
  tipAmount?: number; // Tiền tip của khách (nếu có)
  rating?: number; // 1-5 sao
  note?: string;
  createdById?: string;
  createdByName?: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  staffCode: string;
  position: string;
  month: number;
  year: number;
  standardWorkDays: number; // Công chuẩn trong tháng (thường 26)
  actualWorkDays: number; // Công thực tế từ bảng chấm công
  baseSalary: number; // Lương cơ bản
  salaryByWorkDays: number; // Lương theo ngày công = (Base / standardWorkDays) * actualWorkDays
  seniorityAllowance: number; // Phụ cấp thâm niên (tính theo năm cống hiến)
  otherAllowance: number; // Phụ cấp ăn trưa / trách nhiệm
  tourCount: number; // Tổng số tour làm trong tháng
  tourCommission: number; // Tổng hoa hồng tour từ module Tour
  bonus: number; // Thưởng hiệu suất / lễ tết / doanh số
  bonusReason?: string;
  deduction: number; // Phạt đi trễ / vi phạm / tạm ứng
  deductionReason?: string;
  netSalary: number; // Thực lĩnh cuối cùng
  status: 'draft' | 'confirmed' | 'paid';
  paidDate?: string;
  notes?: string;
}

// ============================================================
// 1. SMART BOOKING & CLINIC FACILITY TYPES
// ============================================================

export type BookingChannel = 'web' | 'zalo' | 'facebook' | 'app' | 'hotline' | 'walkin';
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type RoomType = 'laser' | 'facial' | 'hifu' | 'vip' | 'injection';

export interface ClinicRoom {
  id: string;
  name: string;
  type: RoomType;
  bedCount: number;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  currentBookingId?: string;
  supportedServices: string[];
}

export interface Booking {
  id: string;
  customerCode: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  channel: BookingChannel;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  technicianId?: string;
  technicianName?: string;
  roomId?: string;
  roomName?: string;
  status: BookingStatus;
  notes?: string;
  depositAmount?: number;
  znsReminderSent?: boolean;
  csatSent?: boolean;
  csatRating?: number; // 1-5
  csatFeedback?: string;
  createdDate: string;
}

// ============================================================
// 2. ELECTRONIC MEDICAL RECORD (EMR) & TREATMENT PROTOCOLS
// ============================================================

export type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';

export interface MachineTreatmentParams {
  machineName: string;
  wavelength?: string; // vd: "1064nm / 532nm"
  energyFluence?: string; // vd: "320 mJ - 2.8 J/cm2"
  frequency?: string; // vd: "10 Hz"
  spotSize?: string; // vd: "7 mm Zoom"
  tipCartridge?: string; // vd: "HIFU 3.0mm & 4.5mm"
  shotsFired?: number; // vd: 550 shots
}

export interface TreatmentSession {
  id: string;
  sessionNumber: number;
  date: string; // YYYY-MM-DD
  serviceName: string;
  doctorOrTechId: string;
  doctorOrTechName: string;
  machineParams?: MachineTreatmentParams;
  skinReaction: string; // vd: "Hồng nhẹ, châm chích nhẹ 15 phút, đáp ứng nang lông tốt"
  homeCareInstruction: string; // vd: "Chườm mát, bôi serum B5 phục hồi, tránh nắng kỹ"
  beforeImageUrl?: string;
  afterImageUrl?: string;
  doctorNote?: string;
  clientFeedback?: string;
  signatureVerified: boolean;
}

export interface MedicalRecord {
  id: string;
  customerCode: string;
  customerName: string;
  customerPhone: string;
  gender: 'female' | 'male' | 'other';
  birthYear?: number;
  skinType: SkinType;
  allergies?: string;
  medicalHistory?: string; // Tiền sử bệnh lý
  diagnosis: string; // Chẩn đoán da liễu
  treatmentPlan: string; // Phác đồ điều trị
  totalSessions: number;
  completedSessions: number;
  sessions: TreatmentSession[];
  skinAnalysisHistory?: SkinAnalysisReport[];
  status: 'active' | 'completed' | 'paused';
  createdDate: string;
  updatedDate: string;
  doctorInCharge: string;
}

// ============================================================
// 3. HIGH-TECH CONSUMABLES & TIPS MANAGEMENT
// ============================================================

export interface HighTechTip {
  id: string;
  name: string; // Tên đầu tip (vd: "Đầu Tip HIFU 3.0mm MPT")
  code: string;
  machineModel: string; // "Ultraformer MPT", "Thermage FLX", "Diode 808nm"
  totalMaxShots: number; // Tổng số xung/shot thiết kế
  remainingShots: number; // Số shot còn lại
  alertThreshold: number; // Ngưỡng cảnh báo sắp hết (vd: 1,000 shots)
  unitPrice: number;
  installedDate: string;
  status: 'optimal' | 'warning' | 'critical' | 'depleted';
  batchNumber: string;
}

// ============================================================
// 4. IOT EQUIPMENT REAL-TIME MONITORING
// ============================================================

export interface IoTDevice {
  id: string;
  code: string;
  name: string;
  model: string;
  room: string;
  status: 'online_ready' | 'in_treatment' | 'standby' | 'warning' | 'offline';
  temperature: number; // Độ C (Nhiệt độ đầu máy / hệ thống làm mát)
  voltage: number; // V (Điện áp nguồn 220V)
  operatingHours: number; // Giờ hoạt động tích lũy
  totalShotsFired: number; // Tổng số shot đã bắn tích lũy
  coolingStatus: 'normal' | 'low_coolant' | 'chiller_active';
  lastMaintenance: string;
  nextMaintenance: string;
  serialNumber: string;
  alerts: string[];
}

// ============================================================
// 5. AI SKIN ANALYZER (MAGIC MIRROR 3D)
// ============================================================

export interface SkinMetrics {
  hydration: number; // % Độ ẩm
  sebum: number; // % Bã nhờn
  pigmentation: number; // % Sắc tố Melanin & Tàn nhang
  wrinkles: number; // % Nếp nhăn & Độ lão hóa
  pores: number; // % Độ nở lỗ chân lông
  acneBacteria: number; // % Vi khuẩn P.Acnes & Mụn
  elasticity: number; // % Độ đàn hồi & Săn chắc
}

export interface SkinAnalysisReport {
  id: string;
  customerCode: string;
  customerName: string;
  date: string;
  skinAge: number;
  overallScore: number; // Thang 100
  metrics: SkinMetrics;
  diagnosisSummary: string;
  aiRecommendedServices: string[];
  imageUrl?: string;
  analystName: string;
}

// ============================================================
// 6. CRM & AUTOMATION (ZNS, TREATMENT CYCLES, AI CHATBOT, MARKETING, LOYALTY)
// ============================================================

export interface AutomatedMessage {
  id: string;
  type: 'reminder_24h' | 'reminder_2h' | 'csat_survey' | 'treatment_cycle' | 'birthday' | 'homecare_guide' | 'recovery_check' | 'winback_offer' | 'referral_bonus';
  customerName: string;
  customerPhone: string;
  channel: 'Zalo ZNS' | 'SMS Brandname';
  content: string;
  scheduledTime: string;
  status: 'sent' | 'pending' | 'delivered';
  sentAt?: string;
  preInstruction?: string; // Hướng dẫn chuẩn bị trước khi đến
}

export interface TreatmentCycleAlert {
  id: string;
  customerCode: string;
  customerName: string;
  customerPhone: string;
  treatmentName: string;
  lastSessionDate: string;
  cycleIntervalDays: number; // Chu kỳ (vd: 28 ngày)
  nextDueDate: string;
  daysRemaining: number;
  status: 'due_soon' | 'overdue' | 'notified' | 'booked';
  suggestedSlot?: string; // Khung giờ quen thuộc gợi ý giữ chỗ
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  leadScore?: 'Hot' | 'Warm' | 'Cold';
  suggestedService?: string;
  confidence?: number;
}

// 1. Phễu chuyển đổi & Marketing Automation
export interface LeadBehaviorLog {
  action: string; // Vd: 'Bấm quảng cáo Laser Nám', 'Xem video PicoWay 80%', 'Tương tác Zalo OA', 'Hỏi bảng giá'
  points: number; // Điểm cộng
  timestamp: string;
}

export interface MarketingLead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: 'Facebook Ads' | 'Google Ads' | 'Zalo OA' | 'TikTok' | 'Website Landing' | 'Walk-in';
  interestService: string;
  score: number; // 0 - 100
  tier: 'Hot' | 'Warm' | 'Cold';
  status: 'new' | 'hot_called' | 'nurturing' | 'booked' | 'lost';
  assignedSales?: string;
  lastInteraction: string;
  behaviorLogs: LeadBehaviorLog[];
  nurturingStage?: number; // Bước trong kịch bản Drip (1, 2, 3...)
}

export interface DripCampaignStep {
  day: number;
  title: string;
  channel: 'Zalo ZNS' | 'Email' | 'SMS Brandname';
  subject: string;
  content: string;
  ctaText: string;
  beforeAfterCase?: string;
  voucherOffer?: string;
}

export interface DripCampaign {
  id: string;
  name: string;
  serviceTarget: string;
  audienceDescription: string;
  status: 'active' | 'paused';
  enrolledCount: number;
  openRate: number; // %
  bookingConversionRate: number; // %
  steps: DripCampaignStep[];
}

// 2. Kịch bản chăm sóc theo chu kỳ liệu trình & Chống rời bỏ (Treatment & Churn Prevention)
export interface PostTreatmentCareTicket {
  id: string;
  customerCode: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  sessionDate: string;
  stage: '0h_homecare' | '24h_skin_check' | '48h_recovery' | 'cycle_followup';
  homeCareSent: boolean;
  skinStatus?: 'normal_calm' | 'slight_redness' | 'itching_peeling' | 'urgent_doctor';
  patientFeedback?: string;
  doctorEscalated: boolean;
  doctorNote?: string;
  lastUpdated: string;
}

export interface ChurnRiskCustomer {
  id: string;
  customerCode: string;
  customerName: string;
  customerPhone: string;
  favoriteService: string;
  lastVisitDate: string;
  daysInactive: number; // Số ngày chưa quay lại (>45 ngày)
  totalSpent: number;
  riskLevel: 'medium' | 'high' | 'critical';
  winbackVoucherCode: string;
  winbackVoucherValue: string;
  status: 'pending' | 'voucher_sent' | 'called_reconnected' | 'unreachable' | 're_booked';
  cskhAssigned: string;
  cskhNotes?: string;
}

// 3. Khách hàng thân thiết & Giới thiệu (Loyalty & Referral)
export type LoyaltyTier = 'Standard' | 'Silver' | 'Gold' | 'VIP' | 'VVIP Diamond';

export interface LoyaltyMember {
  id: string;
  customerCode: string;
  customerName: string;
  customerPhone: string;
  tier: LoyaltyTier;
  points: number; // 100k = 10 điểm
  totalSpent: number;
  birthday: string;
  birthdayGiftSent: boolean;
  referralCode: string;
  referralCount: number;
  referralRewardsEarned: number; // VND
  joinedDate: string;
}

export interface ReferralRecord {
  id: string;
  referrerName: string;
  referrerCode: string;
  refereeName: string;
  refereePhone: string;
  serviceUsed: string;
  date: string;
  rewardValue: number; // Thưởng người giới thiệu (500,000đ)
  refereeDiscount: number; // Giảm giá bạn mới (300,000đ)
  status: 'completed' | 'pending';
}


