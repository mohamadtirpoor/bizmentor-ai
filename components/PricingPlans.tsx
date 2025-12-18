import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

interface PricingPlansProps {
  onSelectPlan: (plan: any) => void;
  plans: any[];
  darkMode?: boolean;
}

const PricingPlans: React.FC<PricingPlansProps> = ({ onSelectPlan, plans, darkMode = false }) => {
  return (
    <div className={`h-full w-full overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-5xl mx-auto p-6 py-12">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>پلن‌های اشتراک</h2>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>پلن مناسب خود را انتخاب کنید</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id}
              className={`relative flex flex-col rounded-2xl border-2 transition-all hover:shadow-lg ${
                plan.isPopular 
                  ? 'border-purple-500 shadow-lg shadow-purple-100' 
                  : darkMode 
                    ? 'border-gray-700 hover:border-gray-600 bg-gray-800' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}>
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 rounded-full text-xs font-bold text-white">
                  پیشنهاد ویژه
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.isPopular ? 'bg-purple-100' : darkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <plan.icon className={`w-6 h-6 ${plan.color}`} />
                  </div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{plan.name}</h3>
                </div>

                <div className="mb-6">
                  <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{plan.price}</span>
                  <span className={`text-sm mr-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>تومان / {plan.period}</span>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feat: string, idx: number) => (
                    <div key={idx} className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.isPopular ? 'bg-purple-100 text-purple-600' : darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 pt-0 mt-auto">
                <button onClick={() => onSelectPlan(plan)}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    plan.isPopular 
                      ? 'bg-purple-600 text-white hover:bg-purple-700' 
                      : darkMode 
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                  انتخاب پلن
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className={`text-center text-sm mt-8 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          تمامی پلن‌ها شامل ۷ روز ضمانت بازگشت وجه هستند
        </p>
      </div>
    </div>
  );
};

export default PricingPlans;
