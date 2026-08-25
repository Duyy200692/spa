import React, { useState } from 'react';
import { User, Role } from '../types';
import EditUserModal from './EditUserModal';

interface HeaderProps {
  currentUser: User;
  onSwitchRole: (role: Role) => void;
  onUpdateUserName: (newName: string) => void;
  currentView: 'dashboard' | 'services' | 'users' | 'inventory';
  onViewChange: (view: 'dashboard' | 'services' | 'users' | 'inventory') => void;
  onLogout: () => void;
}

const JuSpaLogo: React.FC = () => (
    <div className="flex flex-col items-center text-[#E5989B]">
        {/* Removed Star SVG */}
        <span className="font-serif font-bold text-2xl tracking-wider text-[#D97A7D]">JUSpa</span>
    </div>
);

const Header: React.FC<HeaderProps> = ({ currentUser, onSwitchRole, onUpdateUserName, currentView, onViewChange, onLogout }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const navButtonStyle = "px-3 py-1 rounded-md text-sm font-medium transition-colors";
  const activeStyle = "bg-[#E5989B] text-white shadow-sm";
  const inactiveStyle = "text-gray-600 hover:bg-pink-100";

  const isAccountant = currentUser.role === Role.Accountant;

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 gap-4 md:gap-0">
        <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-start">
          <JuSpaLogo />
          <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-light text-[#5C3A3A] hidden md:block">Promotion Manager</h1>
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
    </>
  );
};

export default Header;