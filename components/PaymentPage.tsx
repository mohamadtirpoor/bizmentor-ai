import React, { useState } from 'react';
import { CreditCard, CheckCircle, Lock, Loader2 } from 'lucide-react';

interface PaymentPageProps {
  plan: any;
  onBack: () => void;
  onSuccess: () => void;
  darkMode?: boolean;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ plan, onBack, onSuccess, darkMode = false }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => onSuccess(), 3000);
    }, 2000);
  };

  if (success) {
    return (
      <div className={`flex flex-col items-center justify-center h-full w-full p-4 text-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-green-900/50' : 'bg-green-100'}`}>
          <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-500" />
        </div>
        <h2 className={`text-xl sm:text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>پرداخت موفق</h2>
        <p className={`mb-6 text-sm sm:text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          اشتراک <span className="text-purple-600 font-bold">{plan.name}</span> فعال شد.
        </p>
        <p className={`text-xs sm:text-sm animate-pulse ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>در حال انتقال...</p>
      </div>
    );
  }

  return (
    <div className={`h-full w-full overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex flex-col items-center justify-center min-h-full w-full p-2 sm:p-4">
        <div className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-xl border my-2 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`p-3 sm:p-5 border-b flex items-center justify-between ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg">ش</div>
              <div>
                <span className={`block font-bold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>درگاه پرداخت</span>
                <span className={`text-[10px] sm:text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>پرداخت امن شاپرک</span>
              </div>
            </div>
            <button onClick={onBack} className="text-xs sm:text-sm text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg font-medium">انصراف</button>
          </div>

          <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            <div className={`p-3 sm:p-4 rounded-xl border flex flex-col gap-2 ${darkMode ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-100'}`}>
              <div className={`flex justify-between items-center border-b pb-2 ${darkMode ? 'border-blue-800' : 'border-blue-200'}`}>
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>پذیرنده:</span>
                <span className={`font-bold text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>بیزنس‌متر</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>محصول:</span>
                <span className="font-medium text-blue-600 text-sm sm:text-base">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>مبلغ:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg sm:text-2xl font-bold text-blue-600">{plan.price}</span>
                  <span className="text-[10px] sm:text-xs text-blue-500">تومان</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-5">
              <div>
                <label className={`block text-[10px] sm:text-xs font-bold mb-1 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>شماره کارت</label>
                <div className="relative">
                  <input type="text" className={`w-full p-3 sm:p-4 pl-10 border-2 rounded-xl text-left font-mono tracking-[0.15em] text-sm sm:text-lg focus:border-blue-500 outline-none ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-800'
                  }`} placeholder="0000 0000 0000 0000" />
                  <CreditCard className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className={`block text-[10px] sm:text-xs font-bold mb-1 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>رمز دوم</label>
                  <input type="password" className={`w-full p-3 sm:p-4 border-2 rounded-xl text-center font-mono text-sm sm:text-lg focus:border-blue-500 outline-none ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'
                  }`} placeholder="*****" />
                </div>
                <div>
                  <label className={`block text-[10px] sm:text-xs font-bold mb-1 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CVV2</label>
                  <input type="text" className={`w-full p-3 sm:p-4 border-2 rounded-xl text-center font-mono text-sm sm:text-lg focus:border-blue-500 outline-none ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'
                  }`} placeholder="***" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <label className={`block text-[10px] sm:text-xs font-bold mb-1 mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>تاریخ انقضا</label>
                  <div className="flex gap-1 sm:gap-2" dir="ltr">
                    <input type="text" className={`w-full p-3 sm:p-4 border-2 rounded-xl text-center text-sm sm:text-lg focus:border-blue-500 outline-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'
                    }`} placeholder="ماه" />
                    <input type="text" className={`w-full p-3 sm:p-4 border-2 rounded-xl text-center text-sm sm:text-lg focus:border-blue-500 outline-none ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'
                    }`} placeholder="سال" />
                  </div>
                </div>
                <div className="flex items-end">
                  <div className={`w-full text-[9px] sm:text-[10px] p-1.5 sm:p-2 rounded-lg leading-tight border ${
                    darkMode ? 'bg-yellow-900/30 text-yellow-500 border-yellow-800' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                  }`}>صحت اطلاعات را بررسی کنید.</div>
                </div>
              </div>
            </div>

            <button onClick={handlePayment} disabled={loading}
              className="w-full py-3 sm:py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm sm:text-lg mt-2 disabled:opacity-70">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>پرداخت</span>
            </button>
          </div>
        </div>
        <p className={`mt-3 text-[10px] sm:text-xs text-center px-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
          این صفحه شبیه‌سازی شده است و تراکنش واقعی انجام نمی‌شود.
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
