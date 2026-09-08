import React, { useState } from 'react';
import { User, Role } from '../types';
import EditUserModal from './EditUserModal';
import Modal from './shared/Modal';

interface HeaderProps {
  currentUser: User;
  onSwitchRole: (role: Role) => void;
  onUpdateUserName: (newName: string) => void;
  currentView: 'dashboard' | 'services' | 'users' | 'inventory' | 'hr';
  onViewChange: (view: 'dashboard' | 'services' | 'users' | 'inventory' | 'hr') => void;
  onLogout: () => void;
  isCloudConnected?: boolean;
}

const WellnessLogo: React.FC = () => (
    <div className="flex flex-col items-center text-[#E5989B]">
        <span className="font-serif font-bold text-2xl tracking-wider text-[#D97A7D]">Wellness</span>
    </div>
);

const Header: React.FC<HeaderProps> = ({ currentUser, onSwitchRole, onUpdateUserName, currentView, onViewChange, onLogout, isCloudConnected = false }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSyncInfoOpen, setIsSyncInfoOpen] = useState(false);
  
  const navButtonStyle = "px-3 py-1 rounded-md text-sm font-medium transition-colors";
  const activeStyle = "bg-[#E5989B] text-white shadow-sm";
  const inactiveStyle = "text-gray-600 hover:bg-pink-100";

  const isAccountant = currentUser.role === Role.Accountant;

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-4 md:gap-0">
        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-start">
          <WellnessLogo />
          <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-light text-[#5C3A3A] hidden md:block">Promotion Manager</h1>
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
                    Local Mode (Offline)
                  </button>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 border border-gray-200 p-1 rounded-lg bg-gray-50">
                  {!isAccountant && (
                    <button 
                        onClick={() => onViewChange('dashboard')} 
                        className={`${navButtonStyle} ${currentView === 'dashboard' ? activeStyle : inactiveStyle}`}
                    >
                        Promotions
                    </button>
                  )}
                  {!isAccountant && (
                    <button 
                        onClick={() => onViewChange('services')}
                        className={`${navButtonStyle} ${currentView === 'services' ? activeStyle : inactiveStyle}`}
                    >
                        Services
                    </button>
                  )}
                  <button 
                      onClick={() => onViewChange('inventory')}
                      className={`${navButtonStyle} ${currentView === 'inventory' ? activeStyle : inactiveStyle}`}
                  >
                      Inventory (Kho)
                  </button>
                  <button 
                      onClick={() => onViewChange('hr')}
                      className={`${navButtonStyle} ${currentView === 'hr' ? activeStyle : inactiveStyle} flex items-center gap-1`}
                  >
                      <span>Nhân sự & Lương</span>
                  </button>
                  {currentUser.role === Role.Management && (
                    <button 
                        onClick={() => onViewChange('users')}
                        className={`${navButtonStyle} ${currentView === 'users' ? activeStyle : inactiveStyle}`}
                    >
                        Users
                    </button>
                  )}
              </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
          
          {/* Role Switcher */}
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wide mb-1">Đang truy cập với tư cách</span>
            <select 
              value={currentUser.role} 
              onChange={(e) => onSwitchRole(e.target.value as Role)}
              className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-[#E5989B] focus:border-[#E5989B] block p-1.5 outline-none cursor-pointer hover:border-[#D97A7D] transition-colors"
            >
              {Object.values(Role).map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className="h-8 w-px bg-gray-300 mx-2"></div>

          {/* User Name & Edit */}
          <div className="flex items-center space-x-2">
             <div className="flex flex-col text-right">
                <span className="text-xs text-gray-500">Xin chào,</span>
                <div className="flex items-center justify-end group cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
                   <span className="font-bold text-[#D97A7D] group-hover:underline mr-1">{currentUser.name}</span>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 group-hover:text-[#D97A7D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                   </svg>
                </div>
             </div>
             <div 
               className="h-10 w-10 rounded-full bg-gradient-to-br from-[#E5989B] to-[#FCD5CE] flex items-center justify-center text-white font-bold text-lg shadow-sm cursor-pointer hover:opacity-90"
               onClick={onLogout}
               title="Đăng xuất"
             >
                {currentUser.name.charAt(0).toUpperCase()}
             </div>
          </div>
        </div>
      </header>

      <EditUserModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        currentUser={currentUser}
        onUpdateName={onUpdateUserName}
      />

      <Modal
        isOpen={isSyncInfoOpen}
        onClose={() => setIsSyncInfoOpen(false)}
        title="Trạng thái Kết nối & Lưu trữ Dữ liệu"
      >
        <div className="space-y-4 text-sm text-gray-600">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
            <p className="font-semibold mb-1">Đang hoạt động ở Chế độ Lưu trữ Cục bộ (Local Persistence)</p>
            <p className="text-xs leading-relaxed">
              Dự án Firebase Firestore hiện tại đang từ chối quyền truy cập (Permission Denied). 
              Hệ thống đã tự động lưu dữ liệu trên trình duyệt (LocalStorage). Tất cả hoạt động tạo/sửa khuyến mãi, dịch vụ, kho hàng và kiểm kê đều được lưu trữ an toàn.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Cách kích hoạt đồng bộ Firebase Cloud trực tiếp:</h4>
            <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
              <li>Truy cập <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-pink-600 underline">Firebase Console</a></li>
              <li>Chọn dự án của bạn (ví dụ: <code>wellness-manager</code>)</li>
              <li>Vào <strong>Build &gt; Firestore Database &gt; Rules</strong></li>
              <li>Sao chép nội dung từ file <code>firestore.rules</code> trong mã nguồn và dán vào đó rồi bấm <strong>Publish</strong>.</li>
            </ol>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs font-mono overflow-x-auto">
            <p className="text-gray-400 mb-1 font-sans font-semibold">// Quy tắc mẫu trong file firestore.rules</p>
            rules_version = '2';<br/>
            service cloud.firestore &#123;<br/>
            &nbsp;&nbsp;match /databases/&#123;database&#125;/documents &#123;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;match /&#123;document=**&#125; &#123;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;allow read, write: if true;<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br/>
            &nbsp;&nbsp;&#125;<br/>
            &#125;
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