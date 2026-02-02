import React, { useState } from 'react';
import { X, Mail, User, Phone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { name: string; email: string; phone: string }) => void;
  darkMode?: boolean;
}

const AuthModalSimple: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  darkMode = false 
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('لطفاً نام خود را وارد کنید');
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('لطفاً یک ایمیل معتبر وارد کنید');
      return;
    }
    if (!phone.trim() || !/^09\d{9}$/.test(phone)) {
      setError('لطفاً شماره موبایل معتبر وارد کنید (مثال: 09123456789)');
      return;
    }

    setIsLoading(true);

    // Save to localStorage (temporary until database is connected)
    try {
      const userData = {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        hasPremium: true,
        createdAt: new Date().toISOString()
      };

      // Save user data
      localStorage.setItem('tempUserData', JSON.stringify(userData));
      
      // Success
      onSuccess(userData);
      onClose();
    } catch (err) {
      setError('خطا در ذخیره اطلاعات');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className={`rounded-2xl w-full max-w-md shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              شروع کنید
            </h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              اطلاعات خود را وارد کنید
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                نام و نام خانوادگی
              </label>
              <div className="relative">
                <User className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(''); }}
                  className={`w-full pr-11 pl-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500'
                      : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500'
                  }`}
                  placeholder="نام خود را وارد کنید"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                ایمیل
              </label>
              <div className="relative">
                <Mail className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className={`w-full pr-11 pl-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500'
                      : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500'
                  }`}
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                شماره موبایل
              </label>
              <div className="relative">
                <Phone className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(''); }}
                  className={`w-full pr-11 pl-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500'
                      : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500'
                  }`}
                  placeholder="09123456789"
                  dir="ltr"
                  maxLength={11}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>در حال ثبت...</span>
                </>
              ) : (
                <span>شروع گفتگو</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className={`px-6 py-4 border-t rounded-b-2xl ${darkMode ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
          <p className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            با ثبت اطلاعات، شما <span className="text-purple-600">شرایط و قوانین</span> را می‌پذیرید
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModalSimple;
