
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
