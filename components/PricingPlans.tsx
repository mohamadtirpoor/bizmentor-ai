import React from 'react';
import { Check } from 'lucide-react';

interface PricingPlansProps {
  onSelectPlan: (plan: any) => void;
  plans: any[];
}

const PricingPlans: React.FC<PricingPlansProps> = ({ onSelectPlan, plans }) => {
  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar">
      <div className="flex flex-col items-center justify-center min-h-full w-full p-6">
        {/* Free Trial Info Banner */}
        <div className="w-full max-w-6xl mb-6 mt-4">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                <span className="text-3xl">🎁</span>
              </div>
              <div className="flex-1 text-center sm:text-right">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                  شما ۱ پیام رایگان دریافت کردید!
                </h3>
                <p className="text-sm text-gray-300">
                  برای استفاده نامحدود از بیزنس‌متر و دسترسی به تمام امکانات، یکی از پلن‌های زیر را انتخاب کنید.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">طرح‌های اشتراک ویژه</h2>
          <p className="text-gray-400">برای دسترسی به قابلیت‌های پیشرفته و تحلیل‌های عمیق‌تر، طرح خود را انتخاب کنید.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl pb-10">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative flex flex-col p-6 rounded-2xl backdrop-blur-md bg-white/5 border transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${plan.borderColor} ${plan.isPopular ? 'shadow-[0_0_30px_rgba(147,51,234,0.15)] ring-1 ring-purple-500/50 bg-white/10' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-xs font-bold text-white shadow-lg z-10">
                  پیشنهاد ویژه
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl bg-white/5 ${plan.color}`}>
                  <plan.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-100">{plan.name}</h3>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-white/10">
                <span className="text-3xl font-bold text-white ml-2">{plan.price}</span>
                <span className="text-gray-400 text-sm">تومان / {plan.period}</span>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                {plan.features.map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                    <div className={`mt-0.5 p-0.5 rounded-full bg-white/5 ${plan.color}`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSelectPlan(plan)}
                className={`w-full py-3 rounded-xl font-bold transition-all transform active:scale-95 ${
                  plan.isPopular 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-purple-500/25' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                انتخاب طرح
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;