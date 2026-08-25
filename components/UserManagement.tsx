
import React, { useState } from 'react';
import { User, Role } from '../types';
import Button from './shared/Button';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => Promise<void>;
  // Removed unused onUpdateUser to fix build error
  onDeleteUser: (userId: string) => Promise<void>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onDeleteUser }) => {
  const [newUser, setNewUser] = useState({
    name: '',
    username: '',
    password: '',
    role: Role.Product,
  });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.name && newUser.username && newUser.password) {
      onAddUser(newUser);
      setNewUser({ name: '', username: '', password: '', role: Role.Product });
    } else {
        alert("Vui lòng điền đầy đủ thông tin!");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-serif font-bold text-[#D97A7D] mb-4">Quản lý Thành viên (Nhân viên)</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full whitespace-nowrap">
              <thead className="bg-[#FDF7F8]">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên hiển thị</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đăng nhập</th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                  <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-4 px-6 font-medium text-gray-900">{user.name}</td>
                    <td className="py-4 px-6 text-gray-600">{user.username}</td>
                    <td className="py-4 px-6 text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                          ${user.role === Role.Management ? 'bg-purple-100 text-purple-800' : 
                            user.role === Role.Product ? 'bg-green-100 text-green-800' :
                            user.role === Role.Marketing ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                            {user.role}
                        </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {user.role !== Role.Management && (
                          <Button variant="danger" onClick={() => {
                              if(window.confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
                                  onDeleteUser(user.id);
                              }
                          }}>Xóa</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100">
        <h3 className="text-xl font-serif font-bold text-[#D97A7D] mb-4">Thêm Thành viên Mới</h3>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Tên hiển thị</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="VD: Nguyễn Văn A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="user123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="text"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="******"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Vai trò</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
            >
              {Object.values(Role).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <Button type="submit" className="w-full">Tạo tài khoản</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;
