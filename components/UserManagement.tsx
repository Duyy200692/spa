import React, { useState } from 'react';
import { User, Role } from '../types';
import Button from './shared/Button';
import { ROLE_CONFIGS, getRoleConfig } from '../permissions';
import { ShieldCheck, UserPlus, Trash2 } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onSwitchRole?: (role: Role) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  users, 
  onAddUser, 
  onDeleteUser, 
  onSwitchRole 
}) => {
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    role: Role.Doctor,
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.name.trim() && newUser.username.trim() && newUser.password.trim()) {
      onAddUser({
        name: newUser.name.trim(),
        username: newUser.username.trim(),
        password: newUser.password.trim(),
        role: newUser.role,
      });
      setNewUser({ name: '', username: '', password: '', role: Role.Doctor });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-[#8B4F58] border border-rose-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Phân Quyền Truy Cập (RBAC)</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#5C3A3A]">
            Quản Lý Tài Khoản Nhân Sự
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Cấp quyền tài khoản cho Bác sĩ, Lễ tân, Marketing, Kế toán và Ban Quản lý.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-right">
            <div className="text-xs text-gray-500">Tổng tài khoản</div>
            <div className="text-xl font-bold text-[#5C3A3A]">{users.length}</div>
          </div>
        </div>
      </div>

      {/* Add User Form */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#D97A7D]" />
          <span>Cấp Tài Khoản Mới</span>
        </h3>

        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D97A7D]"
              placeholder="BS. Lê Thanh Vân"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tên đăng nhập</label>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D97A7D]"
              placeholder="bs.van"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D97A7D]"
              placeholder="••••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Vai trò / Phân quyền</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#D97A7D]"
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
            <Button type="submit" className="w-full py-2 text-xs font-semibold">
              + Tạo Tài Khoản
            </Button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">
            Danh Sách Tài Khoản & Vai Trò
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Thành viên</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Tài khoản</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Vai trò</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-600">Quyền truy cập</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.map((user) => {
                const cfg = getRoleConfig(user.role);
                return (
                  <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-xs border border-gray-200">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{user.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{user.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-gray-600">
                      @{user.username}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.badgeBg} ${cfg.badgeText} border ${cfg.badgeBorder}`}>
                        <span>{cfg.icon}</span>
                        <span>{cfg.nameVi}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-gray-500">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {cfg.allowedViews.map(v => (
                          <span key={v} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                            {v === 'emr' ? 'EMR' :
                             v === 'crm_automation' ? 'CRM' :
                             v === 'smart_clinic_hardware' ? 'VISIA' :
                             v === 'smart_booking' ? 'Booking' :
                             v === 'inventory' ? 'Kho' :
                             v === 'hr' ? 'HR' :
                             v === 'services' ? 'Services' :
                             v === 'dashboard' ? 'Promotions' : 'Users'}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {onSwitchRole && (
                          <button
                            type="button"
                            onClick={() => onSwitchRole(user.role)}
                            className="px-2.5 py-1 text-gray-600 hover:text-[#5C3A3A] bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md text-[11px] font-medium transition-colors"
                          >
                            Đổi vai trò
                          </button>
                        )}
                        {user.role !== Role.Management ? (
                          <button 
                            type="button"
                            onClick={() => onDeleteUser(user.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 px-2 py-1">Admin</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
