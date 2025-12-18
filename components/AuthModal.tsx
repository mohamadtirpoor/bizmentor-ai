import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { name: string; email: string; phone?: string }) => void;
  initialMode?: 'login' | 'register';
  darkMode?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, initialMode = 'login', darkMode = false }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: any = {};
    if (mode === 'register' && !formData.name.trim()) newErrors.name = 'نام و نام خانوادگی الزامی است';
    if (mode === 'register' && !formData.phone.trim()) newErrors.phone = 'شماره تلفن الزامی است';
    else if (mode === 'register' && !/^09\d{9}$/.test(formData.phone)) newErrors.phone = 'شماره تلفن باید ۱۱ رقم و با ۰۹ شروع شود';
    if (!formData.email.trim()) newErrors.email = 'ایمیل الزامی است';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'فرمت ایمیل صحیح نیست';
    if (!formData.password) newErrors.password = 'رمز عبور الزامی است';
    else if (formData.password.length < 6) newErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess({ name: formData.name || formData.email.split('@')[0], email: formData.email, phone: formData.phone });
      onClose();
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className={`rounded-2xl w-full max-w-md shadow-2xl my-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-4 sm:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex-1 min-w-0 pr-2">
            <h3 className={`text-xl sm:text-2xl font-bold truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {mode === 'login' ? 'خوش آمدید' : 'ثبت‌نام در بیزنس‌متر'}
            </h3>
            <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {mode === 'login' ? 'برای ادامه وارد حساب خود شوید' : 'برای شروع حساب کاربری بسازید'}
            </p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors flex-shrink-0 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>نام و نام خانوادگی</label>
                <div className="relative">
                  <User className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full pr-10 pl-3 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors ${
                      darkMode 
                        ? `bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500 ${errors.name ? 'border-red-500' : ''}`
                        : `bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500 ${errors.name ? 'border-red-500' : ''}`
                    }`}
                    placeholder="نام خود را وارد کنید" />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>شماره تلفن</label>
                <div className="relative">
                  <Phone className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  <input type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full pr-10 pl-3 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors ${
                      darkMode 
                        ? `bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500 ${errors.phone ? 'border-red-500' : ''}`
                        : `bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500 ${errors.phone ? 'border-red-500' : ''}`
                    }`}
                    placeholder="09123456789" dir="ltr" />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </>
          )}
          
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>ایمیل</label>
            <div className="relative">
              <Mail className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full pr-10 pl-3 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors ${
                  darkMode 
                    ? `bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500 ${errors.email ? 'border-red-500' : ''}`
                    : `bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500 ${errors.email ? 'border-red-500' : ''}`
                }`}
                placeholder="example@email.com" dir="ltr" />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>رمز عبور</label>
            <div className="relative">
              <Lock className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full pr-10 pl-10 py-2.5 border rounded-xl text-sm focus:outline-none transition-colors ${
                  darkMode 
                    ? `bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500 ${errors.password ? 'border-red-500' : ''}`
                    : `bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500 ${errors.password ? 'border-red-500' : ''}`
                }`}
                placeholder="••••••••" dir="ltr" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {mode === 'login' && (
            <div className="flex justify-end">
              <button type="button" className="text-xs sm:text-sm text-purple-600 hover:text-purple-700">فراموشی رمز عبور؟</button>
            </div>
          )}

          <button type="submit" disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>در حال پردازش...</span></> : <span>{mode === 'login' ? 'ورود' : 'ثبت‌نام'}</span>}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div></div>
            <div className="relative flex justify-center text-xs"><span className={`px-3 ${darkMode ? 'bg-gray-800 text-gray-500' : 'bg-white text-gray-400'}`}>یا</span></div>
          </div>

          <div className="text-center">
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrors({}); }}
              className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {mode === 'login' ? <>حساب کاربری ندارید؟ <span className="text-purple-600 font-medium">ثبت‌نام کنید</span></> : <>قبلاً ثبت‌نام کرده‌اید؟ <span className="text-purple-600 font-medium">وارد شوید</span></>}
            </button>
          </div>
        </form>

        <div className={`px-4 py-3 border-t rounded-b-2xl ${darkMode ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
          <p className={`text-[10px] text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            با ورود یا ثبت‌نام، شما <span className="text-purple-600">شرایط و قوانین</span> و <span className="text-purple-600">حریم خصوصی</span> را می‌پذیرید.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
