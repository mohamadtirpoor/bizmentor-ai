import React from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

interface PricingPlansProps {
  onSelectPlan: (plan: any) => void;
  plans: any[];
  darkMode?: boolean;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ onSelectPlan, plans, darkMode = false }) => {
  return (
    <div className={`h-full w-full overflow-y-auto ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-amber-500/20 border border-purple-500/30 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className={`text-sm font-medium ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
              پلن‌های اشتراک بیزنس‌متر
            </span>
          </div>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            پلن مناسب خود را انتخاب کنید
          </h2>
          <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            با بیزنس‌متر، مشاور هوشمند کسب‌وکار خود را داشته باشید
          </p>
        </div>
        
        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {plans.map((plan) => (
            <div key={plan.id}
              className={`relative flex flex-col rounded-2xl border-2 transition-all hover:scale-105 ${
                plan.isPopular 
                  ? darkMode
                    ? 'border-purple-500 shadow-2xl shadow-purple-500/20 bg-gradient-to-b from-purple-900/20 to-transparent'
                    : 'border-purple-500 shadow-2xl shadow-purple-100 bg-gradient-to-b from-purple-50 to-white'
                  : darkMode 
                    ? 'border-gray-700 hover:border-gray-600 bg-[#12121a]' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}>
              
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full text-xs font-bold text-white shadow-lg">
                  محبوب‌ترین
                </div>
              )}

              <div className="p-5 sm:p-6">
                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.isPopular 
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                      : darkMode 
                        ? 'bg-gray-800' 
                        : 'bg-gray-100'
                  }`}>
                    <plan.icon className={`w-6 h-6 ${plan.isPopular ? 'text-white' : plan.color}`} />
                  </div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {plan.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl sm:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      تومان
                    </span>
                  </div>
                  <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {plan.period}
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feat: string, idx: number) => (
                    <div key={idx} className={`flex items-start gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plan.isPopular 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : darkMode 
                            ? 'bg-gray-700 text-gray-400' 
                            : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <div className="p-5 sm:p-6 pt-0 mt-auto">
                <button 
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    plan.isPopular 
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30' 
                      : darkMode 
                        ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  انتخاب پلن
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className={`text-center space-y-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="text-sm">
            ✨ تمامی پلن‌ها شامل ۷ روز ضمانت بازگشت وجه هستند
          </p>
          <p className="text-xs">
            پرداخت امن از طریق درگاه بانکی
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;
