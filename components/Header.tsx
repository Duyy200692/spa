import React, { useState } from 'react';
import { User, Role } from '../types';
import EditUserModal from './EditUserModal';
import Modal from './shared/Modal';
import { ROLE_CONFIGS, getRoleConfig } from '../permissions';
import { ShieldCheck, Info, Check, X } from 'lucide-react';

export type AppView = 'dashboard' | 'services' | 'users' | 'inventory' | 'hr' | 'smart_booking' | 'emr' | 'crm_automation' | 'smart_clinic_hardware' | 'kiotviet_sync';

interface HeaderProps {
  currentUser: User;
  onSwitchRole: (role: Role) => void;
  onUpdateUserName: (newName: string) => void;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onLogout: () => void;
  isCloudConnected?: boolean;
}

const WellnessLogo: React.FC = () => (
  <div className="flex flex-col items-center text-[#E5989B]">
    <span className="font-serif font-bold text-2xl tracking-wider text-[#D97A7D]">Wellness</span>
  </div>
);

const NAV_ITEMS: { id: AppView; label: string; icon: string; category: 'clinical' | 'growth' | 'admin' }[] = [
  // Clinical / Medical Group
  { id: 'smart_booking', label: 'Smart Booking', icon: '📅', category: 'clinical' },
  { id: 'emr', label: 'Bệnh Án EMR', icon: '📋', category: 'clinical' },
  { id: 'smart_clinic_hardware', label: 'VISIA & Thiết Bị', icon: '🔬', category: 'clinical' },
  
  // Growth & CRM Group
  { id: 'crm_automation', label: 'CRM & ZNS', icon: '🤖', category: 'growth' },
  { id: 'kiotviet_sync', label: 'KiotViet POS', icon: '🛒', category: 'growth' },
  { id: 'dashboard', label: 'Promotions', icon: '🎁', category: 'growth' },
  { id: 'services', label: 'Services', icon: '💆‍♀️', category: 'growth' },

  // Operations & Admin Group
  { id: 'inventory', label: 'Kho & Vật Tư', icon: '📦', category: 'admin' },
  { id: 'hr', label: 'Nhân sự & Lương', icon: '👥', category: 'admin' },
  { id: 'users', label: 'Phân Quyền & Users', icon: '⚙️', category: 'admin' },
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
  
  const currentRoleConfig = getRoleConfig(currentUser.role);
  const allowedViews = currentRoleConfig.allowedViews;

  const navButtonStyle = "px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5";
  const activeStyle = "bg-[#D97A7D] text-white shadow-sm ring-1 ring-[#D97A7D]/30";
  const inactiveStyle = "text-gray-700 hover:bg-pink-50 hover:text-[#D97A7D]";

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md shadow-xs border-b border-gray-100 p-3 md:p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-3 md:gap-0">
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <WellnessLogo />
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-medium text-[#5C3A3A] hidden lg:block">Clinic & Promotion Manager</h1>
              
              {/* Role Badge Indicator */}
              <div 
                onClick={() => setIsPermissionMatrixOpen(true)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${currentRoleConfig.badgeBg} ${currentRoleConfig.badgeText} border ${currentRoleConfig.badgeBorder} cursor-pointer hover:shadow-xs transition-all`}
                title="Nhấn để xem bảng phân quyền vai trò chi tiết"
              >
                <span>{currentRoleConfig.icon}</span>
                <span>{currentRoleConfig.badgeTitle}</span>
                <Info className="w-3 h-3 opacity-60 ml-0.5" />
              </div>

              {isCloudConnected ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Cloud Sync
                </span>
              ) : (
                <button
                  onClick={() => setIsSyncInfoOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 cursor-pointer transition-colors"
                  title="Nhấn để xem trạng thái kết nối"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  Local
                </button>
              )}
            </div>

            {/* Dynamic RBAC Navigation Tabs */}
            <nav className="mt-2 flex flex-wrap items-center gap-1 border border-gray-200/80 p-1 rounded-xl bg-gray-50/90 shadow-2xs">
              {NAV_ITEMS.filter(item => allowedViews.includes(item.id)).map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                    className={`${navButtonStyle} ${isActive ? activeStyle : inactiveStyle}`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Section: Role Switcher & User Profile */}
        <div className="flex items-center space-x-3 bg-gray-50/90 p-1.5 md:p-2 rounded-xl border border-gray-200/80 shadow-2xs">
          {/* Quick Role Switcher */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Phân Quyền</span>
              <button 
                onClick={() => setIsPermissionMatrixOpen(true)}
                className="text-[10px] text-[#D97A7D] hover:underline font-medium"
              >
                (Xem ma trận)
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 group-hover:text-[#D97A7D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>

            <div 
              className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-br from-[#E5989B] to-[#FCD5CE] flex items-center justify-center text-white font-bold text-sm shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
              onClick={onLogout}
              title="Đăng xuất khỏi hệ thống"
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

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
        title="Ma Trận Phân Quyền Vai Trò Hệ Thống (RBAC Matrix)"
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
                  <th className="p-2.5 text-center">🔬 VISIA & Thiết Bị</th>
                  <th className="p-2.5 text-center">🛒 KiotViet POS</th>
                  <th className="p-2.5 text-center">📅 Booking</th>
                  <th className="p-2.5 text-center">📦 Kho / 👥 HR</th>
                  <th className="p-2.5 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {Object.values(Role).map((r) => {
                  const cfg = ROLE_CONFIGS[r];
                  const isCurrent = r === currentUser.role;
                  return (
                    <tr 
                      key={r} 
                      onClick={() => {
                        onSwitchRole(r);
                        setIsPermissionMatrixOpen(false);
                      }}
                      className={`cursor-pointer transition-colors ${isCurrent ? 'bg-pink-50/70 font-medium' : 'hover:bg-gray-50'}`}
                      title={`Nhấn để chuyển sang vai trò ${cfg.nameVi}`}
                    >
                      <td className="p-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{cfg.icon}</span>
                          <span className="font-bold text-gray-900">{r}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-[#D97A7D] text-white rounded font-bold">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">{cfg.nameVi}</div>
                      </td>

                      {/* EMR */}
                      <td className="p-2.5 text-center">
                        {cfg.capabilities.emr === 'full' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <Check className="w-3 h-3" /> Full
                          </span>
                        ) : cfg.capabilities.emr === 'view_edit' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px]">
                            Xem/Sửa
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-gray-300">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>

                      {/* CRM & ZNS */}
                      <td className="p-2.5 text-center">
                        {cfg.capabilities.crmZns === 'full' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <Check className="w-3 h-3" /> Full
                          </span>
                        ) : cfg.capabilities.crmZns === 'view_edit' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px]">
                            Xem/Gửi
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-gray-300">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>

                      {/* VISIA & IoT */}
                      <td className="p-2.5 text-center">
                        {cfg.capabilities.hardwareVisia === 'full' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <Check className="w-3 h-3" /> Full
                          </span>
                        ) : cfg.capabilities.hardwareVisia === 'view_edit' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px]">
                            Xem/Bắn
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-gray-300">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>

                      {/* KiotViet POS */}
                      <td className="p-2.5 text-center">
                        {cfg.capabilities.kiotvietPos === 'full' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <Check className="w-3 h-3" /> Full Sync
                          </span>
                        ) : cfg.capabilities.kiotvietPos === 'view' ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-[11px]">
                            Xem POS
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
              💡 Bạn có thể chuyển đổi nhanh vai trò để kiểm tra giao diện hoặc vào quản lý tài khoản để cấp quyền cho nhân sự mới.
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

      {/* Sync Info Modal */}
      <Modal
        isOpen={isSyncInfoOpen}
        onClose={() => setIsSyncInfoOpen(false)}
        title="Trạng thái Kết nối & Lưu trữ Dữ liệu"
      >
        <div className="space-y-4 text-sm text-gray-600">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
            <p className="font-semibold mb-1">Đang hoạt động ở Chế độ Lưu trữ Cục bộ (Local Persistence)</p>
            <p className="text-xs leading-relaxed">
              Dữ liệu của toàn bộ phân quyền (Bệnh án EMR, CRM & ZNS, VISIA Thiết bị, KiotViet POS, Lịch hẹn, Kho và Bảng lương) đang được lưu trữ an toàn trên trình duyệt (LocalStorage).
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsSyncInfoOpen(false)}
              className="px-4 py-2 bg-[#E5989B] text-white rounded-md text-sm hover:bg-[#D97A7D] transition-colors"
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
