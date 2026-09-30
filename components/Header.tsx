import React, { useState } from 'react';
import { User, Role } from '../types';
import EditUserModal from './EditUserModal';
import Modal from './shared/Modal';
import { ROLE_CONFIGS, getRoleConfig } from '../permissions';
import { 
  ShieldCheck, 
  Info, 
  Check, 
  X, 
  Menu, 
  LogOut, 
  Grid, 
  CalendarCheck, 
  ClipboardList, 
  MessageSquare, 
  Microscope, 
  Package, 
  Tag 
} from 'lucide-react';

export type AppView = 'dashboard' | 'services' | 'users' | 'inventory' | 'hr' | 'smart_booking' | 'emr' | 'crm_automation' | 'smart_clinic_hardware';

interface HeaderProps {
  currentUser: User;
  onSwitchRole: (role: Role) => void;
  onUpdateUserName: (newName: string) => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onLogout: () => void;
  isCloudConnected?: boolean;
}

const WellnessLogo: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div className="flex items-center text-[#E5989B]">
    <span className={`font-serif font-bold ${compact ? 'text-xl' : 'text-2xl'} tracking-wider text-[#D97A7D]`}>
      Wellness
    </span>
  </div>
);

const NAV_ITEMS: { id: AppView; label: string; shortLabel: string; icon: string; category: 'clinical' | 'growth' | 'admin' }[] = [
  // Clinical / Medical Group
  { id: 'smart_booking', label: 'Smart Booking', shortLabel: 'Lịch Hẹn', icon: '📅', category: 'clinical' },
  { id: 'emr', label: 'Bệnh Án EMR', shortLabel: 'Bệnh Án', icon: '📋', category: 'clinical' },
  { id: 'smart_clinic_hardware', label: 'VISIA & Máy', shortLabel: 'Thiết Bị', icon: '🔬', category: 'clinical' },
  
  // Growth & CRM Group
  { id: 'crm_automation', label: 'CRM & ZNS', shortLabel: 'CRM', icon: '🤖', category: 'growth' },
  { id: 'dashboard', label: 'Promotions', shortLabel: 'Khuyến Mãi', icon: '🎁', category: 'growth' },
  { id: 'services', label: 'Dịch Vụ & Liệu Trình', shortLabel: 'Dịch Vụ', icon: '💆‍♀️', category: 'growth' },

  // Operations & Admin Group
  { id: 'inventory', label: 'Kho & Vật Tư', shortLabel: 'Kho', icon: '📦', category: 'admin' },
  { id: 'hr', label: 'Nhân Sự & Lương', shortLabel: 'Nhân Sự', icon: '👥', category: 'admin' },
  { id: 'users', label: 'Phân Quyền & Users', shortLabel: 'Tài Khoản', icon: '⚙️', category: 'admin' },
];

const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onSwitchRole, 
  onUpdateUserName, 
  currentView, 
  onViewChange, 
  onLogout, 
  isCloudConnected = false 
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSyncInfoOpen, setIsSyncInfoOpen] = useState(false);
  const [isPermissionMatrixOpen, setIsPermissionMatrixOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const currentRoleConfig = getRoleConfig(currentUser.role);
  const allowedViews = currentRoleConfig.allowedViews;
  const filteredNavItems = NAV_ITEMS.filter(item => allowedViews.includes(item.id));

  // Determine priority 4 items for bottom dock with clear recognizable icons
  const getDockItems = (): { id: AppView; label: string; icon: React.ReactNode }[] => {
    const items: { id: AppView; label: string; icon: React.ReactNode }[] = [];
    
    // 1. Smart Booking (Lịch hẹn)
    if (allowedViews.includes('smart_booking')) {
      items.push({ id: 'smart_booking', label: 'Lịch Hẹn', icon: <CalendarCheck className="w-5 h-5" /> });
    }
    
    // 2. EMR (Bệnh án) or VISIA (Thiết bị)
    if (allowedViews.includes('emr')) {
      items.push({ id: 'emr', label: 'Bệnh Án', icon: <ClipboardList className="w-5 h-5" /> });
    } else if (allowedViews.includes('smart_clinic_hardware')) {
      items.push({ id: 'smart_clinic_hardware', label: 'VISIA', icon: <Microscope className="w-5 h-5" /> });
    }
    
    // 3. CRM & ZNS (Chăm sóc KH)
    if (allowedViews.includes('crm_automation')) {
      items.push({ id: 'crm_automation', label: 'CRM KH', icon: <MessageSquare className="w-5 h-5" /> });
    }

    // 4. Kho (Dược mỹ phẩm) / Ưu đãi (Promotions) / Dịch Vụ
    if (allowedViews.includes('inventory')) {
      items.push({ id: 'inventory', label: 'Kho Dược', icon: <Package className="w-5 h-5" /> });
    } else if (allowedViews.includes('dashboard')) {
      items.push({ id: 'dashboard', label: 'Khuyến Mãi', icon: <Tag className="w-5 h-5" /> });
    } else if (allowedViews.includes('services')) {
      items.push({ id: 'services', label: 'Dịch Vụ', icon: <Grid className="w-5 h-5" /> });
    }

    return items.slice(0, 4);
  };

  const activeStyle = "bg-[#D97A7D] text-white shadow-sm ring-1 ring-[#D97A7D]/30";
  const inactiveStyle = "text-gray-700 hover:bg-pink-50 hover:text-[#D97A7D]";

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP HEADER (MD & UP) */}
      {/* ========================================================================= */}
      <header className="hidden md:flex bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-100 p-3 md:p-4 justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <WellnessLogo />
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-medium text-[#5C3A3A] hidden lg:block">Clinic & Spa Manager</h1>
              
              {/* Role Badge Indicator */}
              <button 
                onClick={() => setIsPermissionMatrixOpen(true)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${currentRoleConfig.badgeBg} ${currentRoleConfig.badgeText} border ${currentRoleConfig.badgeBorder} cursor-pointer hover:shadow-xs transition-all`}
                title="Nhấn để xem bảng phân quyền vai trò chi tiết"
              >
                <span>{currentRoleConfig.icon}</span>
                <span>{currentRoleConfig.badgeTitle}</span>
                <Info className="w-3 h-3 opacity-60 ml-0.5" />
              </button>

              {isCloudConnected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Cloud Sync
                </span>
              ) : (
                <button
                  onClick={() => setIsSyncInfoOpen(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 cursor-pointer transition-colors"
                  title="Nhấn để xem trạng thái kết nối"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  Local
                </button>
              )}
            </div>

            {/* Navigation Tabs (Responsive: short label on tablet, full label on desktop, horizontally scrollable) */}
            <nav className="mt-1.5 flex items-center gap-1 border border-gray-200/80 p-1 rounded-xl bg-gray-50/90 shadow-2xs overflow-x-auto whitespace-nowrap scrollbar-none max-w-[52vw] xl:max-w-none">
              {filteredNavItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shrink-0 ${
                      isActive ? activeStyle : inactiveStyle
                    }`}
                    title={item.label}
                  >
                    <span>{item.icon}</span>
                    <span className="hidden xl:inline">{item.label}</span>
                    <span className="inline xl:hidden">{item.shortLabel || item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Section: Role Switcher & User Profile */}
        <div className="flex items-center space-x-3 bg-gray-50/90 p-1.5 md:p-2 rounded-xl border border-gray-200/80 shadow-2xs">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Phân Quyền</span>
              <button 
                onClick={() => setIsPermissionMatrixOpen(true)}
                className="text-[10px] text-[#D97A7D] hover:underline font-medium"
              >
                (Ma trận)
              </button>
            </div>
            <select 
              value={currentUser.role} 
              onChange={(e) => onSwitchRole(e.target.value as Role)}
              className="bg-white border border-gray-300 text-gray-800 text-xs font-semibold rounded-lg focus:ring-[#E5989B] focus:border-[#E5989B] block py-1 px-2 outline-none cursor-pointer hover:border-[#D97A7D] transition-colors shadow-2xs"
            >
              {Object.values(Role).map((r) => {
                const cfg = ROLE_CONFIGS[r];
                return (
                  <option key={r} value={r}>
                    {cfg.icon} {cfg.nameVi}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="h-7 w-px bg-gray-300 mx-1"></div>

          {/* User Name & Profile */}
          <div className="flex items-center space-x-2">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-gray-400">Xin chào</span>
              <div 
                className="flex items-center justify-end group cursor-pointer" 
                onClick={() => setIsEditModalOpen(true)}
                title="Chỉnh sửa tên hiển thị"
              >
                <span className="font-bold text-xs md:text-sm text-[#D97A7D] group-hover:underline mr-1">
                  {currentUser.name}
                </span>
              </div>
            </div>

            <button 
              className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-br from-[#E5989B] to-[#FCD5CE] flex items-center justify-center text-white font-bold text-sm shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
              onClick={onLogout}
              title="Đăng xuất"
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MOBILE TOP APP BAR (SM & MOBILE) */}
      {/* ========================================================================= */}
      <div className="flex md:hidden flex-col bg-white border-b border-gray-100 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center justify-between px-3.5 py-2.5">
          {/* Brand & Active Role */}
          <div className="flex items-center gap-2">
            <WellnessLogo compact />
            <button
              onClick={() => setIsPermissionMatrixOpen(true)}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${currentRoleConfig.badgeBg} ${currentRoleConfig.badgeText} border ${currentRoleConfig.badgeBorder}`}
            >
              <span>{currentRoleConfig.icon}</span>
              <span className="truncate max-w-[100px]">{currentRoleConfig.nameVi.split('/')[0]}</span>
            </button>
          </div>

          {/* Right Mobile Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="h-7 w-7 rounded-full bg-gray-100 text-gray-700 text-xs font-bold flex items-center justify-center border border-gray-200"
              title="Hồ sơ"
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              title="Mở menu chức năng"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Horizontal Quick-Scroll Chips */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto scrollbar-none bg-gray-50/70 border-t border-gray-100 text-xs whitespace-nowrap">
          {filteredNavItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                  isActive 
                    ? 'bg-[#D97A7D] text-white shadow-2xs font-bold' 
                    : 'bg-white text-gray-700 border border-gray-200/80 hover:bg-pink-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FLOATING DARK CAPSULE BOTTOM NAVIGATION DOCK (FIXED & SNUG)           */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-3.5 left-0 right-0 z-40 px-3 flex justify-center pointer-events-none">
        <div className="pointer-events-auto bg-[#18181B]/95 text-white backdrop-blur-2xl rounded-full px-3 py-1.5 shadow-2xl border border-white/10 ring-1 ring-black/40 w-full max-w-[375px] mx-auto flex items-center justify-between">
          {getDockItems().map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-150 ${
                  isActive
                    ? 'bg-[#323236] text-white shadow-inner font-bold ring-1 ring-white/15'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title={item.label}
              >
                <div className={`transition-transform duration-150 ${isActive ? 'scale-105 text-[#E5989B]' : 'text-zinc-400'}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] mt-0.5 whitespace-nowrap leading-tight tracking-tight ${isActive ? 'text-white font-bold' : 'text-zinc-400 font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Menu & User Profile */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-1 px-1 text-zinc-400 hover:text-white transition-all active:scale-95"
            title="Tất Cả Chức Năng & Tài Khoản"
          >
            <div className="w-[20px] h-[20px] rounded-full bg-gradient-to-br from-[#E5989B] to-[#FCD5CE] ring-1.5 ring-white text-zinc-900 font-bold text-[10px] flex items-center justify-center shadow-2xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] text-zinc-400 mt-0.5 whitespace-nowrap leading-tight tracking-tight font-medium">Menu</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MOBILE DRAWER MENU / BOTTOM SHEET */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end transition-opacity">
          <div 
            className="fixed inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto shadow-2xl border-t border-pink-100 z-10 animate-in slide-in-from-bottom duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E5989B] to-[#FCD5CE] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-900">{currentUser.name}</div>
                  <div className="text-[11px] text-gray-500 flex items-center gap-1">
                    <span>{currentRoleConfig.icon}</span>
                    <span>{currentRoleConfig.nameVi}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Role Switcher in Mobile Drawer */}
            <div className="mb-4 bg-gray-50 p-3 rounded-2xl border border-gray-200/80">
              <div className="text-xs font-bold text-gray-700 mb-2 flex items-center justify-between">
                <span>Chuyển Đổi Nhanh Phân Quyền:</span>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsPermissionMatrixOpen(true);
                  }}
                  className="text-[11px] text-[#D97A7D] font-semibold underline"
                >
                  Ma trận RBAC
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(Role).map((r) => {
                  const cfg = ROLE_CONFIGS[r];
                  const isCurrent = r === currentUser.role;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        onSwitchRole(r);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-2 rounded-xl text-left border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isCurrent 
                          ? 'bg-[#D97A7D] text-white border-[#D97A7D] shadow-2xs font-bold' 
                          : `${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`
                      }`}
                    >
                      <span>{cfg.icon}</span>
                      <span className="truncate">{cfg.nameVi.split('/')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categorized Modules List */}
            <div className="mb-5 space-y-3">
              <div className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                Tất cả chức năng ({filteredNavItems.length})
              </div>

              <div className="grid grid-cols-2 gap-2">
                {filteredNavItems.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onViewChange(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        isActive 
                          ? 'bg-rose-50 border-[#D97A7D] text-[#8B4F58] font-bold shadow-2xs' 
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <div className="truncate">
                        <div className="text-xs truncate">{item.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logout and Profile Actions */}
            <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors text-center"
              >
                Đổi Tên Hiển Thị
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="flex-1 py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng Xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <EditUserModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        currentUser={currentUser}
        onUpdateName={onUpdateUserName}
      />

      {/* Role Permission Matrix Modal */}
      <Modal
        isOpen={isPermissionMatrixOpen}
        onClose={() => setIsPermissionMatrixOpen(false)}
        title="Ma Trận Phân Quyền Vai Trò (RBAC)"
      >
        <div className="space-y-4 text-sm text-gray-700 max-h-[75vh] overflow-y-auto pr-1">
          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/70 rounded-xl">
            <h4 className="font-bold text-purple-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              Chính Sách Phân Quyền Theo Bộ Phận Phòng Khám
            </h4>
            <p className="text-xs text-purple-700 mt-1 leading-relaxed">
              Mỗi vai trò được cấp quyền chính xác theo nghiệp vụ thực tế nhằm đảm bảo tính bảo mật y khoa, an toàn dữ liệu khách hàng và quy trình vận hành liền mạch.
            </p>
          </div>

          {/* Current Role Highlight */}
          <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Vai trò hiện tại của bạn:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${currentRoleConfig.badgeBg} ${currentRoleConfig.badgeText} border ${currentRoleConfig.badgeBorder}`}>
                {currentRoleConfig.icon} {currentRoleConfig.nameVi}
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">
              {currentRoleConfig.description}
            </p>
          </div>

          {/* Quick Role Switch Buttons in Matrix Modal */}
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
            <span className="text-xs font-bold text-gray-700 block mb-2">⚡ Bấm vào vai trò để chuyển đổi và xem dữ liệu ngay:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.values(Role).map((r) => {
                const cfg = ROLE_CONFIGS[r];
                const isCurrent = r === currentUser.role;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      onSwitchRole(r);
                      setIsPermissionMatrixOpen(false);
                    }}
                    className={`p-2 rounded-xl text-left border text-xs font-bold transition-all flex items-center justify-between ${
                      isCurrent 
                        ? 'bg-[#D97A7D] text-white border-[#D97A7D] shadow-xs' 
                        : `${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder} hover:shadow-xs hover:scale-[1.01]`
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span>{cfg.icon}</span>
                      <span className="truncate">{cfg.nameVi.split('/')[0]}</span>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">Đang xem</span>
                    ) : (
                      <span className="text-[10px] opacity-70 underline">Xem 👉</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gray-100/90 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-2.5">Vai trò</th>
                  <th className="p-2.5 text-center">📋 Bệnh Án EMR</th>
                  <th className="p-2.5 text-center">🤖 CRM & ZNS</th>
                  <th className="p-2.5 text-center">📅 Lịch Booking</th>
                  <th className="p-2.5 text-center">📦 Kho & Lương</th>
                  <th className="p-2.5 text-center">Chuyển vai trò</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {Object.values(Role).map((r) => {
                  const cfg = ROLE_CONFIGS[r];
                  const isCurrent = r === currentUser.role;
                  return (
                    <tr key={r} className={`hover:bg-pink-50/40 transition-colors ${isCurrent ? 'bg-pink-50/60 font-semibold' : ''}`}>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <span>{cfg.icon}</span>
                          <div>
                            <div className="font-bold text-gray-900">{cfg.nameVi.split('/')[0]}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{r}</div>
                          </div>
                        </div>
                      </td>

                      {/* EMR */}
                      <td className="p-2.5 text-center">
                        {cfg.capabilities.emr === 'full' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <Check className="w-3 h-3" /> Full
                          </span>
                        ) : cfg.capabilities.emr === 'view' || cfg.capabilities.emr === 'view_edit' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px]">
                            Xem
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-gray-300">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>

                      {/* CRM */}
                      <td className="p-2.5 text-center">
                        {cfg.capabilities.crmZns === 'full' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <Check className="w-3 h-3" /> Full
                          </span>
                        ) : cfg.capabilities.crmZns === 'view' || cfg.capabilities.crmZns === 'view_edit' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px]">
                            Xem
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-gray-300">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>

                      {/* Smart Booking */}
                      <td className="p-2.5 text-center">
                        {cfg.capabilities.booking === 'full' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <Check className="w-3 h-3" /> Full
                          </span>
                        ) : cfg.capabilities.booking === 'view_edit' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px]">
                            Xem
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-gray-300">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>

                      {/* Kho & HR */}
                      <td className="p-2.5 text-center">
                        {cfg.capabilities.hrPayroll === 'full' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[11px] font-bold">
                            Kho & Lương
                          </span>
                        ) : cfg.capabilities.inventory === 'full' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px]">
                            Kho
                          </span>
                        ) : cfg.capabilities.inventory === 'view' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px]">
                            Xem Kho
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-gray-300">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-2.5 text-center whitespace-nowrap">
                        {isCurrent ? (
                          <span className="text-[11px] text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded">
                            Đang xem
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSwitchRole(r);
                              setIsPermissionMatrixOpen(false);
                            }}
                            className="px-2.5 py-1 bg-[#D97A7D] hover:bg-[#c8696c] text-white rounded-lg text-xs font-bold transition-all shadow-2xs hover:scale-105"
                          >
                            👉 Xem dữ liệu
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              💡 Bạn có thể chuyển đổi vai trò để kiểm tra giao diện từng phân quyền.
            </span>
            <div className="flex items-center gap-2">
              {currentUser.role === Role.Management && (
                <button
                  onClick={() => {
                    setIsPermissionMatrixOpen(false);
                    onViewChange('users');
                  }}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1"
                >
                  <span>⚙️ Quản Lý Cấp Tài Khoản</span>
                </button>
              )}
              <button
                onClick={() => setIsPermissionMatrixOpen(false)}
                className="px-4 py-1.5 bg-[#D97A7D] text-white rounded-lg text-xs font-semibold hover:bg-[#c8696c] transition-colors shadow-2xs"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Cloud Sync Info Modal */}
      <Modal
        isOpen={isSyncInfoOpen}
        onClose={() => setIsSyncInfoOpen(false)}
        title="Trạng Thái Kết Nối Firebase"
      >
        <div className="space-y-4 text-sm text-gray-700">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2 font-bold text-amber-900 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              Đang Chạy Chế Độ Bộ Nhớ Cục Bộ (Local Storage)
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Mọi dữ liệu (Bệnh án, Lịch hẹn, Khách hàng, Doanh thu) đang được lưu trữ an toàn trên trình duyệt của bạn.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsSyncInfoOpen(false)}
              className="px-4 py-2 bg-[#D97A7D] text-white rounded-lg text-xs font-semibold hover:bg-[#c8696c] transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Header;
