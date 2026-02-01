import React, { useState, useEffect } from 'react';
import { X, Mail, Check, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { name: string; email: string }) => void;
  initialMode?: 'login' | 'register';
  darkMode?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialMode = 'login', 
  darkMode = false 
}) => {
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendCode = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('لطفاً یک ایمیل معتبر وارد کنید');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('code');
        setCountdown(600); // 10 minutes
        setCanResend(false);
      } else {
        setError(data.error || 'خطا در ارسال کد. لطفاً دوباره تلاش کنید.');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('لطفاً کد 6 رقمی را کامل وارد کنید');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode, name }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'کد تایید اشتباه است');
      }
    } catch (err) {
      setError('خطا در تایید کد');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    setError('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);
    
    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    document.getElementById(`code-${lastIndex}`)?.focus();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className={`rounded-2xl w-full max-w-md shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center gap-3">
            {step === 'code' && (
              <button
                onClick={() => setStep('email')}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <ArrowRight className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            )}
            <div>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {step === 'email' ? 'ورود / ثبت‌نام' : 'تایید ایمیل'}
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {step === 'email' ? 'با ایمیل خود وارد شوید' : 'کد ارسال شده را وارد کنید'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'email' ? (
            <div className="space-y-4">
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                    className={`w-full pr-11 pl-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500'
                        : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500'
                    } ${error ? 'border-red-500' : ''}`}
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  نام (اختیاری)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none transition-colors ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:border-purple-500'
                      : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-purple-500'
                  }`}
                  placeholder="نام خود را وارد کنید"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>در حال ارسال...</span>
                  </>
                ) : (
                  <span>ارسال کد تایید</span>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                  <Mail className="w-8 h-8 text-purple-600" />
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  کد تایید به ایمیل <span className="font-medium text-purple-600">{email}</span> ارسال شد
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-3 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  کد 6 رقمی را وارد کنید
                </label>
                <div className="flex gap-2 justify-center" dir="ltr">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none transition-all ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                          : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-purple-500'
                      } ${digit ? 'border-purple-500' : ''}`}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-500 text-sm text-center">{error}</p>
                </div>
              )}

              <div className="text-center space-y-2">
                {countdown > 0 ? (
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    زمان باقی‌مانده: <span className="font-mono font-bold text-purple-600">{formatTime(countdown)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-red-500">کد منقضی شده است</p>
                )}
                
                <button
                  onClick={handleSendCode}
                  disabled={!canResend || isLoading}
                  className={`text-sm font-medium transition-colors ${
                    canResend && !isLoading
                      ? 'text-purple-600 hover:text-purple-700'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  ارسال مجدد کد
                </button>
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isLoading || code.join('').length !== 6}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 transition-all hover:opacity-90"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>در حال تایید...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>تایید و ورود</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t rounded-b-2xl ${darkMode ? 'bg-gray-700/50 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
          <p className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            با ورود، شما <span className="text-purple-600">شرایط و قوانین</span> را می‌پذیرید
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
