import React, { useState } from 'react';
import { X, Shield, Lock, User, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  onClose: () => void;
  onLogin: (username: string, password: string) => boolean;
  darkMode?: boolean;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onLogin, darkMode = false }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className={`rounded-2xl w-full max-w-md border shadow-2xl ${
        darkMode ? 'bg-gray-800 border-red-500/20' : 'bg-white border-red-200'
      }`}>
        <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${darkMode ? 'bg-red-500/20' : 'bg-red-100'}`}>
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>ورود به پنل مدیریت</h3>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>دسترسی محدود به مدیران</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className={`p-4 mx-6 mt-6 rounded-xl flex items-start gap-3 ${darkMode ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'}`}>
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className={`text-sm font-medium ${darkMode ? 'text-red-300' : 'text-red-600'}`}>هشدار امنیتی</p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-red-400/80' : 'text-red-500/80'}`}>
              این بخش فقط برای مدیران سیستم قابل دسترسی است.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'}`}>
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>نام کاربری</label>
            <div className="relative">
              <User className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className={`w-full pr-11 pl-4 py-3 border rounded-xl focus:outline-none focus:border-red-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                }`}
                placeholder="نام کاربری خود را وارد کنید" required autoFocus />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>رمز عبور</label>
            <div className="relative">
              <Lock className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className={`w-full pr-11 pl-4 py-3 border rounded-xl focus:outline-none focus:border-red-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
                }`}
                placeholder="رمز عبور خود را وارد کنید" required />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isLoading || !username || !password}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>در حال بررسی...</span></> : <><Shield className="w-5 h-5" /><span>ورود به پنل</span></>}
            </button>
            <button type="button" onClick={onClose} className={`px-6 py-3 font-medium rounded-xl ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>انصراف</button>
          </div>
        </form>

        <div className={`px-6 py-4 border-t rounded-b-2xl ${darkMode ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
          <p className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            در صورت فراموشی اطلاعات ورود، با پشتیبانی تماس بگیرید.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
