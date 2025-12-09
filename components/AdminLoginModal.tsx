import React, { useState } from 'react';
import { X, Shield, Lock, User, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  onClose: () => void;
  onLogin: (username: string, password: string) => boolean;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const success = onLogin(username, password);
      setIsLoading(false);
      
      if (!success) {
        setError('نام کاربری یا رمز عبور اشتباه است');
        setPassword('');
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-md border border-red-500/20 shadow-2xl shadow-red-500/10 animate-in zoom-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">ورود به پنل مدیریت</h3>
              <p className="text-xs text-gray-400 mt-1">دسترسی محدود به مدیران</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="p-4 mx-6 mt-6 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-300 font-medium">هشدار امنیتی</p>
            <p className="text-xs text-red-400/80 mt-1">
              این بخش فقط برای مدیران سیستم قابل دسترسی است. تلاش‌های ناموفق ثبت می‌شود.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              نام کاربری
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input 
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                className="w-full pr-11 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                placeholder="نام کاربری خود را وارد کنید"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              رمز عبور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input 
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full pr-11 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                placeholder="رمز عبور خود را وارد کنید"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="submit"
              disabled={isLoading || !username || !password}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>در حال بررسی...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>ورود به پنل</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-all"
            >
              انصراف
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/5 border-t border-white/10 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center">
            در صورت فراموشی اطلاعات ورود، با پشتیبانی تماس بگیرید.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
