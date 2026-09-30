import React, { useState } from 'react';
import { User, Role } from '../types';
import Button from './shared/Button';
import { ROLE_CONFIGS, getRoleConfig } from '../permissions';
import { ShieldCheck, UserPlus, Trash2, Shield, CloudUpload, CheckCircle2 } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onSwitchRole?: (role: Role) => void;
  onSyncDefaultUsers?: () => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  onAddUser, 
  onDeleteUser, 
  onSwitchRole,
  onSyncDefaultUsers 
}) => {
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    role: Role.Doctor,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.name && newUser.username && newUser.password) {
      onAddUser(newUser);
      setNewUser({ name: '', username: '', password: '', role: Role.Doctor });
    } else {
      alert("Vui lòng điền đầy đủ thông tin!");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-md mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Role-Based Access Control (RBAC)
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-pink-100">
              Quản Trị Tài Khoản & Phân Quyền Hệ Thống
            </h2>
            <p className="text-xs md:text-sm text-purple-200 mt-1 max-w-2xl">
              Cấp phát tài khoản nhân sự và kiểm soát chặt chẽ quyền truy cập vào các module: Bệnh án EMR, CRM & ZNS, VISIA Thiết bị y tế, KiotViet POS, Lịch hẹn và Tài chính.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-center min-w-[160px]">
            <div className="text-2xl font-bold text-pink-300">{users.length}</div>
            <div className="text-xs text-purple-200">Tài khoản hoạt động</div>
          </div>
        </div>
      </div>

      {/* List of Users */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-xl font-serif font-bold text-[#5C3A3A] flex items-center gap-2">
            <span>👥 Danh Sách Thành Viên & Phân Quyền Hiện Tại</span>
          </h3>

          {onSyncDefaultUsers && (
            <button
              type="button"
              disabled={isSyncing}
              onClick={async () => {
                setIsSyncing(true);
                try {
                  await onSyncDefaultUsers();
                  setSyncSuccess(true);
                  setTimeout(() => setSyncSuccess(false), 4000);
                } finally {
                  setIsSyncing(false);
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
              title="Đảm bảo tài khoản Bác sĩ và tất cả vai trò đều được tạo trên Firebase"
            >
              {syncSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Đã Nạp & Đồng Bộ Bác Sĩ Lên Firebase!</span>
                </>
              ) : (
                <>
                  <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>{isSyncing ? 'Đang nạp dữ liệu...' : '☁️ Nạp Đầy Đủ Bác Sĩ & Các Vai Trò Lên Firebase'}</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thành viên</th>
                  <th className="py-3 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
                  <th className="py-3 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò & Quyền Hạn</th>
                  <th className="py-3 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Module Được Phép Xem</th>
                  <th className="py-3 px-6 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user) => {
                  const cfg = getRoleConfig(user.role);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E5989B] to-[#FCD5CE] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div>{user.name}</div>
                          <div className="text-[10px] text-gray-400 font-normal">ID: {user.id}</div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-xs text-gray-700 font-semibold bg-gray-50/50">
                        @{user.username}
                      </td>
                      <td className="py-3.5 px-6">
                        <button
                          type="button"
                          onClick={() => onSwitchRole && onSwitchRole(user.role)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText} border ${cfg.badgeBorder} hover:shadow-xs hover:scale-105 transition-all cursor-pointer`}
                          title={`Nhấn để chuyển nhanh và xem giao diện ${cfg.nameVi}`}
                        >
                          <span>{cfg.icon}</span>
                          <span>{cfg.nameVi}</span>
                          <span className="text-[10px] opacity-70 underline ml-1">Xem 👉</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-gray-600 max-w-xs truncate">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]">
                          {cfg.allowedViews.length} modules: {cfg.allowedViews.map(v => v.replace('_', ' ')).join(', ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-2">
                        {onSwitchRole && (
                          <button
                            type="button"
                            onClick={() => onSwitchRole(user.role)}
                            className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-[#D97A7D] border border-pink-200 rounded-lg text-xs font-bold transition-all"
                            title="Đăng nhập và xem giao diện của tài khoản này"
                          >
                            🚀 Đổi vai trò
                          </button>
                        )}
                        {user.role !== Role.Management ? (
                          <button 
                            type="button"
                            onClick={() => {
                              if(window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.name}"?`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Xóa
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">Quản trị tối cao</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add New User Form */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-pink-100">
        <h3 className="text-lg font-serif font-bold text-[#5C3A3A] mb-1 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[#D97A7D]" />
          Thêm Tài Khoản Nhân Sự & Phân Vai Trò
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Tạo tài khoản mới cho Bác sĩ, Nhân viên Marketing, Lễ tân, Kế toán hoặc Ban Quản lý.
        </p>

        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tên hiển thị / Bác sĩ</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg shadow-2xs p-2 text-xs focus:ring-[#D97A7D] focus:border-[#D97A7D]"
              placeholder="VD: BS. Lê Thanh Vân"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tên đăng nhập</label>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="w-full border border-gray-300 rounded-lg shadow-2xs p-2 text-xs focus:ring-[#D97A7D] focus:border-[#D97A7D]"
              placeholder="bs.van"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg shadow-2xs p-2 text-xs focus:ring-[#D97A7D] focus:border-[#D97A7D]"
              placeholder="••••••"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Vai trò phân quyền</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
              className="w-full border border-gray-300 rounded-lg shadow-2xs p-2 text-xs bg-white focus:ring-[#D97A7D] focus:border-[#D97A7D]"
            >
              {Object.values(Role).map((role) => {
                const cfg = ROLE_CONFIGS[role];
                return (
                  <option key={role} value={role}>
                    {cfg.icon} {cfg.nameVi}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <Button type="submit" className="w-full py-2 text-xs font-bold">
              + Tạo Tài Khoản
            </Button>
          </div>
        </form>
      </div>

      {/* Role Matrix Reference Table */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-200">
        <h3 className="text-lg font-serif font-bold text-[#5C3A3A] mb-1 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          Bảng Chi Tiết Phân Quyền Theo Module Phòng Khám
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Quy định rõ phạm vi quyền hạn của từng bộ phận đối với dữ liệu nhạy cảm y khoa và tài chính.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(Role).map((r) => {
            const cfg = ROLE_CONFIGS[r];
            return (
              <div key={r} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText} border ${cfg.badgeBorder}`}>
                      {cfg.icon} {cfg.nameVi}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono uppercase">{r}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    {cfg.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-200/80 space-y-2">
                  <div>
                    <div className="text-[11px] font-bold text-gray-700 mb-1">Modules được cấp quyền:</div>
                    <div className="flex flex-wrap gap-1">
                      {cfg.allowedViews.map((v) => (
                        <span key={v} className="px-1.5 py-0.5 bg-white border border-gray-200 text-gray-700 rounded text-[10px] font-medium">
                          {v === 'emr' ? '📋 EMR' :
                           v === 'crm_automation' ? '🤖 CRM & ZNS' :
                           v === 'smart_clinic_hardware' ? '🔬 VISIA' :
                           v === 'kiotviet_sync' ? '🛒 POS' :
                           v === 'smart_booking' ? '📅 Booking' :
                           v === 'inventory' ? '📦 Kho' :
                           v === 'hr' ? '👥 HR' :
                           v === 'services' ? '💆 Services' :
                           v === 'dashboard' ? '🎁 Promo' : '⚙️ Users'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {onSwitchRole && (
                    <button
                      type="button"
                      onClick={() => onSwitchRole(r)}
                      className="w-full py-1.5 px-3 bg-white hover:bg-[#D97A7D] hover:text-white text-gray-700 border border-gray-300 hover:border-[#D97A7D] rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <span>👉 Trải nghiệm vai trò {cfg.nameVi.split('/')[0]}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
