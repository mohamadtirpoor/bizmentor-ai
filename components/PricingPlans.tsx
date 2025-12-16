import React from 'react';
import { Check } from 'lucide-react';

interface PricingPlansProps {
  onSelectPlan: (plan: any) => void;
  plans: any[];
}

const PricingPlans: React.FC<PricingPlansProps> = ({ onSelectPlan, plans }) => {
  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col items-center justify-center min-h-full w-full p-3 sm:p-6">
        {/* Free Trial Info Banner */}
        <div className="w-full max-w-6xl mb-4 sm:mb-6 mt-2 sm:mt-4">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                <span className="text-2xl sm:text-3xl">🎁</span>
              </div>
              <div className="flex-1 text-center sm:text-right">
                <h3 className="text-base sm:text-xl font-bold text-white mb-1">
                  برای استفاده از بیزنس‌متر اشتراک تهیه کنید
                </h3>
                <p className="text-xs sm:text-sm text-gray-300">
                  یکی از پلن‌های زیر را انتخاب کنید و از مشاور هوشمند کسب‌وکار استفاده کنید.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">پلن‌های اشتراک</h2>
          <p className="text-xs sm:text-base text-gray-400">طرح مناسب خود را انتخاب کنید</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-6xl pb-6 sm:pb-10">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative flex flex-col p-4 sm:p-6 rounded-xl sm:rounded-2xl backdrop-blur-md bg-white/5 border transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 hover:-translate-y-1 sm:hover:-translate-y-2 ${plan.borderColor} ${plan.isPopular ? 'shadow-[0_0_30px_rgba(147,51,234,0.15)] ring-1 ring-purple-500/50 bg-white/10' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-0.5 sm:py-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-[10px] sm:text-xs font-bold text-white shadow-lg z-10">
                  پیشنهاد ویژه
                </div>
              )}

              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 ${plan.color}`}>
                  <plan.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-gray-100">{plan.name}</h3>
                </div>
              </div>

              <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-white/10">
                <span className="text-2xl sm:text-3xl font-bold text-white ml-1 sm:ml-2">{plan.price}</span>
                <span className="text-gray-400 text-xs sm:text-sm">تومان / {plan.period}</span>
              </div>

              <div className="flex-1 space-y-2 sm:space-y-4 mb-4 sm:mb-8">
                {plan.features.map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-gray-300">
                    <div className={`mt-0.5 p-0.5 rounded-full bg-white/5 ${plan.color}`}>
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSelectPlan(plan)}
                className={`w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all transform active:scale-95 ${
                  plan.isPopular 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-purple-500/25' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                انتخاب پلن
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;