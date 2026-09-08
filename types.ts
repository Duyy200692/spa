
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
