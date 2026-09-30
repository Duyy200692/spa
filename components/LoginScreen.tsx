import React, { useState } from 'react';
import Button from './shared/Button';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => void;
  error?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    onLogin(u, p);
  };

  return (
    <div className="min-h-screen bg-[#FEFBFB] flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-md border border-pink-100/80">
        {/* Brand Logo */}
        <div className="flex flex-col items-center text-[#E5989B] mb-6 sm:mb-8">
          <span className="font-serif font-bold text-4xl sm:text-5xl tracking-wider text-[#D97A7D]">Wellness</span>
          <span className="text-gray-400 font-light mt-1 text-sm sm:text-base">Clinic & Spa Management</span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97A7D]/40 focus:border-[#D97A7D] transition-all"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D97A7D]/40 focus:border-[#D97A7D] transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs sm:text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full py-3 text-sm sm:text-base font-bold shadow-xs">
            Đăng Nhập
          </Button>

          {/* Quick Demo Access Toggle */}
          <div className="pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full py-2 text-xs text-gray-500 hover:text-[#D97A7D] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>{showDemoAccounts ? '▲ Thu gọn tài khoản mẫu' : '⚡ Hoặc đăng nhập nhanh bằng tài khoản mẫu'}</span>
            </button>

            {showDemoAccounts && (
              <div className="grid grid-cols-2 gap-1.5 pt-2 animate-in fade-in duration-200">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('doctor', '1')}
                  className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl border border-teal-200 text-left transition-colors"
                >
                  <div className="font-bold text-xs">🩺 doctor</div>
                  <div className="text-[10px] text-teal-600">Bác sĩ (EMR & VISIA)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin', '1')}
                  className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl border border-purple-200 text-left transition-colors"
                >
                  <div className="font-bold text-xs">👑 admin</div>
                  <div className="text-[10px] text-purple-600">Quản lý (Full quyền)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('reception', '1')}
                  className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200 text-left transition-colors"
                >
                  <div className="font-bold text-xs">🛎️ reception</div>
                  <div className="text-[10px] text-amber-600">Lễ tân (Booking)</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('mkt', '1')}
                  className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl border border-blue-200 text-left transition-colors"
                >
                  <div className="font-bold text-xs">📢 mkt</div>
                  <div className="text-[10px] text-blue-600">Marketing & CRM</div>
                </button>
              </div>
            )}
          </div>

          <div className="text-center text-[11px] text-gray-400">
            Hệ thống quản lý nội bộ Wellness Clinic & Spa
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
