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
            <p className="text-xs font-semibold text-gray-500 mb-2 text-center">Tài khoản mẫu để truy cập nhanh:</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => { setUsername('admin'); setPassword('1'); onLogin('admin', '1'); }}
                className="p-1.5 bg-pink-50 hover:bg-pink-100 text-[#D97A7D] rounded border border-pink-200 text-left transition-colors"
              >
                👑 <strong>admin</strong> (Quản lý)
              </button>
              <button
                type="button"
                onClick={() => { setUsername('ketoan'); setPassword('1'); onLogin('ketoan', '1'); }}
                className="p-1.5 bg-pink-50 hover:bg-pink-100 text-[#D97A7D] rounded border border-pink-200 text-left transition-colors"
              >
                📦 <strong>ketoan</strong> (Kho)
              </button>
              <button
                type="button"
                onClick={() => { setUsername('mkt'); setPassword('1'); onLogin('mkt', '1'); }}
                className="p-1.5 bg-pink-50 hover:bg-pink-100 text-[#D97A7D] rounded border border-pink-200 text-left transition-colors"
              >
                📢 <strong>mkt</strong> (Marketing)
              </button>
              <button
                type="button"
                onClick={() => { setUsername('reception'); setPassword('1'); onLogin('reception', '1'); }}
                className="p-1.5 bg-pink-50 hover:bg-pink-100 text-[#D97A7D] rounded border border-pink-200 text-left transition-colors"
              >
                🛎️ <strong>reception</strong> (Lễ tân)
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
