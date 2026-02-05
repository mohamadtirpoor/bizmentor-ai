import React from 'react';
import { ArrowRight, CheckCircle, Users, Zap, Target, Award } from 'lucide-react';

interface AboutPageProps {
  darkMode: boolean;
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ darkMode, onBack }) => {
  return (
    <div className={`h-full overflow-y-auto ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <button
          onClick={onBack}
          className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-all ${
            darkMode 
              ? 'text-purple-400 hover:bg-purple-500/10' 
              : 'text-purple-600 hover:bg-purple-50'
          }`}
        >
          <ArrowRight className="w-5 h-5" />
          بازگشت
        </button>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            درباره بیزنس‌متر
          </h1>
          <p className={`text-xl ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            Businessmeter | Business Meter
          </p>
          <p className={`text-lg mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            مشاور هوشمند کسب‌وکار با هوش مصنوعی
          </p>
        </div>

        {/* Mission */}
        <section className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ماموریت ما
          </h2>
          <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            بیزنس‌متر (Businessmeter) یک پلتفرم مشاوره هوشمند کسب‌وکار است که با استفاده از هوش مصنوعی، 
            راهنمایی تخصصی و رایگان برای مدیران، کارآفرینان و صاحبان کسب‌وکار ارائه می‌دهد.
          </p>
        </section>

        {/* Services */}
        <section className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            خدمات ما
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'مدیر محصول', desc: 'Product Management', icon: Target },
              { title: 'مدیر مارکتینگ', desc: 'Marketing Management', icon: Zap },
              { title: 'مدیر فروش', desc: 'Sales Management', icon: Users },
              { title: 'مدیر مالی', desc: 'Financial Management', icon: Award },
              { title: 'مدیر منابع انسانی', desc: 'HR Management', icon: Users },
              { title: 'تحلیل کسب‌وکار', desc: 'Business Analytics', icon: Target },
            ].map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl ${
                    darkMode 
                      ? 'bg-[#1a1a2e] border border-purple-500/10' 
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                    <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {service.title}
                    </h3>
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {service.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Why Us */}
        <section className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            چرا بیزنس‌متر؟
          </h2>
          <div className="space-y-4">
            {[
              'مشاوره رایگان و نامحدود',
              'پاسخ‌های فوری با هوش مصنوعی',
              'محتوای تخصصی 100% فارسی',
              'مقالات آموزشی کاربردی',
              'بدون نیاز به ثبت‌نام پیچیده',
              'دسترسی 24/7',
              'پشتیبانی از 5 حوزه تخصصی',
              'رابط کاربری ساده و کاربرپسند'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className={`w-5 h-5 flex-shrink-0 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="mb-12">
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            آمار و ارقام
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: '1000+', label: 'کاربر فعال' },
              { number: '10000+', label: 'مشاوره انجام شده' },
              { number: '6', label: 'حوزه تخصصی' },
              { number: '100%', label: 'محتوای فارسی' },
            ].map((stat, index) => (
              <div
                key={index}
                className={`text-center p-6 rounded-xl ${
                  darkMode 
                    ? 'bg-purple-500/10 border border-purple-500/20' 
                    : 'bg-purple-50 border border-purple-200'
                }`}
              >
                <div className={`text-3xl font-bold mb-2 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {stat.number}
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className={`p-6 rounded-xl ${
          darkMode 
            ? 'bg-[#1a1a2e] border border-purple-500/10' 
            : 'bg-white border border-gray-200'
        }`}>
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            تماس با ما
          </h2>
          <div className="space-y-2">
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>وب‌سایت:</strong> https://businessmeter.ir
            </p>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>ایمیل:</strong> businessmeter.ir@gmail.com
            </p>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>نام انگلیسی:</strong> Businessmeter | Business Meter
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
