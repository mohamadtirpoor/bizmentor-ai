import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Lock, ChevronRight, Loader2, ArrowRight } from 'lucide-react';

interface PaymentPageProps {
  plan: any;
  onBack: () => void;
  onSuccess: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ plan, onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Auto redirect after success
      setTimeout(() => {
        onSuccess();
      }, 3000);
    }, 2000);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-6 animate-in fade-in zoom-in duration-300 text-center">
        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">پرداخت با موفقیت انجام شد</h2>
        <p className="text-gray-300 mb-8 text-lg">اشتراک <span className="text-purple-400 font-bold">{plan.name}</span> برای شما فعال شد.</p>
        <p className="text-sm text-gray-500 animate-pulse">در حال انتقال به صفحه اصلی...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col items-center justify-center min-h-full w-full p-4">
        <div className="w-full max-w-lg bg-gray-100 rounded-3xl overflow-hidden shadow-2xl text-gray-800 animate-in slide-in-from-bottom-10 fade-in duration-500 my-4">
          {/* Header */}
          <div className="bg-white p-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/20">ش</div>
              <div>
                 <span className="block font-bold text-gray-800">درگاه پرداخت اینترنتی</span>
                 <span className="text-xs text-gray-500">پرداخت امن شاپرک</span>
              </div>
            </div>
            <button onClick={onBack} className="text-sm text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors font-medium">
              انصراف
            </button>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col gap-2">
              <div className="flex justify-between items-center border-b border-blue-200 pb-2">
                 <span className="text-sm text-gray-600">پذیرنده:</span>
                 <span className="font-bold text-gray-800">بیزنس‌متر</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                 <span className="text-sm text-gray-600">محصول:</span>
                 <span className="font-medium text-blue-700">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                 <span className="text-sm text-gray-600">مبلغ قابل پرداخت:</span>
                 <div className="flex items-baseline gap-1">
                   <span className="text-2xl font-bold text-blue-700">{plan.price}</span>
                   <span className="text-xs text-blue-600">تومان</span>
                 </div>
              </div>
            </div>

            <div className="space-y-5">
               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-1.5 mr-1">شماره کارت</label>
                 <div className="relative">
                   <input type="text" className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl bg-white text-left font-mono tracking-[0.2em] text-lg focus:border-blue-500 focus:ring-0 outline-none transition-all placeholder:tracking-normal" placeholder="0000 0000 0000 0000" />
                   <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1.5 mr-1">رمز دوم (POYA)</label>
                   <input type="password" className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white text-center font-mono text-lg outline-none focus:border-blue-500 transition-all" placeholder="*****" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-500 mb-1.5 mr-1">CVV2</label>
                   <input type="text" className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white text-center font-mono text-lg outline-none focus:border-blue-500 transition-all" placeholder="***" />
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 mb-1.5 mr-1">تاریخ انقضا</label>
                     <div className="flex gap-2" dir="ltr">
                       <input type="text" className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white text-center text-lg outline-none focus:border-blue-500 transition-all placeholder:text-sm" placeholder="ماه" />
                       <input type="text" className="w-full p-4 border-2 border-gray-200 rounded-xl bg-white text-center text-lg outline-none focus:border-blue-500 transition-all placeholder:text-sm" placeholder="سال" />
                     </div>
                   </div>
                   <div className="flex items-end">
                       <div className="w-full bg-yellow-50 text-yellow-700 text-[10px] p-2 rounded-lg leading-tight border border-yellow-100">
                          از صحت نام پذیرنده و مبلغ اطمینان حاصل کنید.
                       </div>
                   </div>
               </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 text-lg mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Lock className="w-5 h-5" />}
              <span>پرداخت نهایی</span>
            </button>
          </div>
        </div>
        <p className="mt-6 text-xs text-gray-500 opacity-60">
          این یک صفحه شبیه‌سازی شده است (Demo) و تراکنش واقعی انجام نمی‌شود.
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;