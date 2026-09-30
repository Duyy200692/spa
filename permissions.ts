import { Role } from './types';
import { AppView } from './components/Header';

export interface RoleConfig {
  role: Role;
  nameVi: string;
  badgeTitle: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: string;
  description: string;
  allowedViews: AppView[];
  defaultView: AppView;
  capabilities: {
    emr: 'full' | 'view_edit' | 'view' | 'none';
    crmZns: 'full' | 'view_edit' | 'view' | 'none';
    hardwareVisia: 'full' | 'view_edit' | 'view' | 'none';
    booking: 'full' | 'view_edit' | 'view' | 'none';
    inventory: 'full' | 'view_edit' | 'view' | 'none';
    hrPayroll: 'full' | 'view_edit' | 'view' | 'none';
    servicesPromotions: 'full' | 'view_edit' | 'view' | 'none';
    userManagement: boolean;
  };
}

export const ROLE_CONFIGS: Record<Role, RoleConfig> = {
  [Role.Management]: {
    role: Role.Management,
    nameVi: 'Quản Lý / Ban Giám Đốc',
    badgeTitle: 'Quản Lý (Full Quyền)',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    icon: '👑',
    description: 'Toàn quyền điều hành: Xem, tạo, sửa, xóa tất cả hồ sơ Bệnh án EMR, CRM & ZNS, VISIA Thiết bị, Bảng lương, Kho và Tài khoản.',
    allowedViews: [
      'smart_booking',
      'emr',
      'crm_automation',
      'smart_clinic_hardware',
      'dashboard',
      'services',
      'inventory',
      'hr',
      'users'
    ],
    defaultView: 'smart_booking',
    capabilities: {
      emr: 'full',
      crmZns: 'full',
      hardwareVisia: 'full',
      booking: 'full',
      inventory: 'full',
      hrPayroll: 'full',
      servicesPromotions: 'full',
      userManagement: true,
    }
  },

  [Role.Doctor]: {
    role: Role.Doctor,
    nameVi: 'Bác Sĩ / Chuyên Gia Khám & Điều Trị',
    badgeTitle: 'Bác Sĩ (EMR, VISIA, Booking)',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800',
    badgeBorder: 'border-teal-200',
    icon: '🩺',
    description: 'Truy cập chuyên sâu: Hồ sơ Bệnh án EMR, Sơ đồ Smart Booking & điều phối phòng khám, Máy phân tích VISIA & Quản lý thiết bị y tế IoT.',
    allowedViews: [
      'smart_booking',
      'emr',
      'smart_clinic_hardware',
      'services'
    ],
    defaultView: 'emr',
    capabilities: {
      emr: 'full',
      crmZns: 'none',
      hardwareVisia: 'full',
      booking: 'full',
      inventory: 'view',
      hrPayroll: 'none',
      servicesPromotions: 'view',
      userManagement: false,
    }
  },

  [Role.Marketing]: {
    role: Role.Marketing,
    nameVi: 'Marketing & Tăng Trưởng',
    badgeTitle: 'Marketing (CRM & ZNS)',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    icon: '📢',
    description: 'Truy cập CRM Automation, Tự động hóa tin nhắn ZNS/SMS, Phễu Leads marketing, Drip Campaign, CSAT, Khách hàng trung thành và Chương trình khuyến mãi.',
    allowedViews: [
      'crm_automation',
      'dashboard',
      'services',
      'smart_booking'
    ],
    defaultView: 'crm_automation',
    capabilities: {
      emr: 'none',
      crmZns: 'full',
      hardwareVisia: 'none',
      booking: 'view_edit',
      inventory: 'none',
      hrPayroll: 'none',
      servicesPromotions: 'full',
      userManagement: false,
    }
  },

  [Role.Reception]: {
    role: Role.Reception,
    nameVi: 'Lễ Tân & Chăm Sóc Khách Hàng',
    badgeTitle: 'Lễ Tân (Smart Booking)',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    icon: '🛎️',
    description: 'Tiếp đón khách hàng: Quản lý lịch hẹn Smart Booking, check-in, xếp phòng clinic, gửi tin nhắn ZNS nhắc lịch và tra cứu bảng giá dịch vụ.',
    allowedViews: [
      'smart_booking',
      'dashboard',
      'services',
      'inventory'
    ],
    defaultView: 'smart_booking',
    capabilities: {
      emr: 'none',
      crmZns: 'none',
      hardwareVisia: 'none',
      booking: 'full',
      inventory: 'view',
      hrPayroll: 'none',
      servicesPromotions: 'view',
      userManagement: false,
    }
  },

  [Role.Accountant]: {
    role: Role.Accountant,
    nameVi: 'Kế Toán & Quản Lý Kho',
    badgeTitle: 'Kế Toán (Kho & Lương)',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    icon: '💰',
    description: 'Tài chính & Vật tư: Quản lý xuất nhập tồn kho dược mỹ phẩm, kiểm kê kho, Bảng lương nhân viên và hoa hồng tour KTV.',
    allowedViews: [
      'inventory',
      'hr',
      'dashboard',
      'services'
    ],
    defaultView: 'inventory',
    capabilities: {
      emr: 'none',
      crmZns: 'none',
      hardwareVisia: 'none',
      booking: 'none',
      inventory: 'full',
      hrPayroll: 'full',
      servicesPromotions: 'view',
      userManagement: false,
    }
  },

  [Role.Product]: {
    role: Role.Product,
    nameVi: 'Quản Lý Sản Phẩm & Dịch Vụ',
    badgeTitle: 'Sản Phẩm (Services & Promo)',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    icon: '📦',
    description: 'Phát triển dịch vụ: Quản lý bảng giá, phác đồ điều trị kỹ thuật số, chương trình khuyến mãi ưu đãi và vật tư tiêu hao.',
    allowedViews: [
      'services',
      'dashboard',
      'inventory',
      'smart_clinic_hardware'
    ],
    defaultView: 'services',
    capabilities: {
      emr: 'none',
      crmZns: 'none',
      hardwareVisia: 'view_edit',
      booking: 'none',
      inventory: 'view_edit',
      hrPayroll: 'none',
      servicesPromotions: 'full',
      userManagement: false,
    }
  }
};

/**
 * Kiểm tra xem một vai trò có quyền truy cập vào một View hay không
 */
export function canAccessView(role: Role, view: AppView): boolean {
  const config = ROLE_CONFIGS[role];
  if (!config) return false;
  return config.allowedViews.includes(view);
}

/**
 * Lấy danh sách các View được phép truy cập theo Vai trò
 */
export function getAllowedViews(role: Role): AppView[] {
  const config = ROLE_CONFIGS[role];
  return config ? config.allowedViews : ['dashboard'];
}

/**
 * Lấy View mặc định khi đăng nhập hoặc chuyển vai trò
 */
export function getDefaultView(role: Role): AppView {
  const config = ROLE_CONFIGS[role];
  return config ? config.defaultView : 'dashboard';
}

/**
 * Lấy cấu hình hiển thị vai trò (Tên, màu sắc, icon, mô tả)
 */
export function getRoleConfig(role: Role): RoleConfig {
  return ROLE_CONFIGS[role] || ROLE_CONFIGS[Role.Management];
}
