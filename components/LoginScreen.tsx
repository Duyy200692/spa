import React, { useState } from 'react';
import Button from './shared/Button';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => void;
  error?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  const WellnessLogoLarge = () => (
    <div className="flex flex-col items-center text-[#E5989B] mb-8">
        <span className="font-serif font-bold text-5xl tracking-wider mt-2 text-[#D97A7D]">Wellness</span>
        <span className="text-gray-500 font-light mt-2 text-lg">Promotion Manager</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FEFBFB] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-pink-100">
        <WellnessLogoLarge />
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#D97A7D] focus:border-[#D97A7D]"
              placeholder="Nhập tên đăng nhập của bạn"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-[#D97A7D] focus:border-[#D97A7D]"
              placeholder="••••••"
              required
            />
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full py-3 text-lg">
            Đăng nhập
          </Button>

          <div className="pt-2 border-t border-pink-100">
            <p className="text-xs font-semibold text-gray-500 mb-2 text-center">Tài khoản truy cập nhanh theo phân quyền:</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => { setUsername('admin'); setPassword('1'); onLogin('admin', '1'); }}
                className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded border border-purple-200 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold">👑 admin</span>
                  <div className="text-[10px] text-purple-600">Quản lý (Full quyền)</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setUsername('doctor'); setPassword('1'); onLogin('doctor', '1'); }}
                className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded border border-teal-200 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold">🩺 doctor</span>
                  <div className="text-[10px] text-teal-600">Bác sĩ (EMR & VISIA)</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setUsername('mkt'); setPassword('1'); onLogin('mkt', '1'); }}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded border border-blue-200 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold">📢 mkt</span>
                  <div className="text-[10px] text-blue-600">Marketing (CRM & ZNS)</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setUsername('reception'); setPassword('1'); onLogin('reception', '1'); }}
                className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold">🛎️ reception</span>
                  <div className="text-[10px] text-amber-600">Lễ tân (Booking)</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setUsername('ketoan'); setPassword('1'); onLogin('ketoan', '1'); }}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded border border-rose-200 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold">💰 ketoan</span>
                  <div className="text-[10px] text-rose-600">Kế toán (Kho & POS)</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => { setUsername('product'); setPassword('1'); onLogin('product', '1'); }}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded border border-emerald-200 text-left transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="font-bold">📦 product</span>
                  <div className="text-[10px] text-emerald-600">Sản phẩm & Dịch vụ</div>
                </div>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 mt-4">
             Hệ thống quản lý nội bộ Wellness
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
