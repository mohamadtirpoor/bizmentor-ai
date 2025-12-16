import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import LiveVoiceInterface from './components/LiveVoiceInterface';
import PricingPlans from './components/PricingPlans';
import PaymentPage from './components/PaymentPage';
import AdminPanel from './components/AdminPanel';
import AdminLoginModal from './components/AdminLoginModal';
import { MessageSquare, Mic, Briefcase, CreditCard, ShieldCheck } from 'lucide-react';
import { Star, Zap, Crown } from 'lucide-react';

const INITIAL_PLANS = [
  {
    id: 'pro',
    name: 'حرفه‌ای (Pro)',
    price: '۲۹۹,۰۰۰',
    period: 'ماهانه',
    icon: Star,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    shadowColor: 'shadow-blue-500/20',
    features: [
      'دسترسی به چت هوشمند',
      'تحلیل‌های استاندارد کسب‌وکار',
      'تاریخچه چت ۳۰ روزه',
      'پشتیبانی ایمیلی'
    ]
  },
  {
    id: 'pro-plus',
    name: 'پرو پلاس (+Pro)',
    price: '۶۹۹,۰۰۰',
    period: 'ماهانه',
    icon: Zap,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/50',
    shadowColor: 'shadow-purple-500/40',
    isPopular: true,
    features: [
      'همه امکانات پلن Pro',
      'مدل متفکر (Gemini 3 Pro)',
      'تحقیق بازار (Search Grounding)',
      'پاسخ‌دهی سریع‌تر',
      'خروجی فایل PDF برنامه'
    ]
  },
  {
    id: 'platinum',
    name: 'پلاتینیوم (Platinum)',
    price: '۱,۴۹۰,۰۰۰',
    period: 'ماهانه',
    icon: Crown,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    shadowColor: 'shadow-amber-500/20',
    features: [
      'همه امکانات پلن Pro+',
      'مکالمه صوتی زنده (Live API)',
      'تحلیل‌های عمیق نامحدود',
      'مشاور اختصاصی AI',
      'پشتیبانی ۲۴/۷ VIP'
    ]
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'pricing' | 'admin'>('chat');
  const [paymentPlan, setPaymentPlan] = useState<any>(null);
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Check if user is admin on mount
  React.useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
  }, []);

  const handleTabChange = (tab: 'chat' | 'voice' | 'pricing' | 'admin') => {
    // Check if trying to access admin panel
    if (tab === 'admin' && !isAdmin) {
      setShowAdminLogin(true);
      return;
    }
    
    setActiveTab(tab);
    if (tab !== 'pricing') {
      setPaymentPlan(null); // Reset payment flow if switching tabs
    }
  };

  const handleAdminLogin = (username: string, password: string) => {
    if (username === 'mohamad' && password === 'mohamad.tir1383') {
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
      setShowAdminLogin(false);
      setActiveTab('admin');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    setActiveTab('chat');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-gray-100 overflow-hidden font-['Vazirmatn']">
      
      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLoginModal 
          onClose={() => setShowAdminLogin(false)}
          onLogin={handleAdminLogin}
        />
      )}

      {/* Header */}
      <header className="h-14 sm:h-16 flex-none flex items-center justify-between px-3 sm:px-6 border-b border-white/10 bg-black/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.5)]">
            <Briefcase className="text-white w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          <div className="hidden xs:block">
            <h1 className="text-base sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-white">
              بیزنس‌متر
            </h1>
            <p className="text-[8px] sm:text-[10px] text-gray-400 tracking-wider">مشاور هوشمند کسب‌وکار</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-0.5 sm:gap-1 bg-white/5 p-0.5 sm:p-1 rounded-full border border-white/10">
          <button
            onClick={() => handleTabChange('chat')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'chat' 
                ? 'bg-purple-600/80 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">گفتگو</span>
          </button>
          <button
            onClick={() => handleTabChange('voice')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all opacity-50 cursor-not-allowed ${
              activeTab === 'voice' 
                ? 'bg-purple-600/80 text-white shadow-lg' 
                : 'text-gray-400'
            }`}
            disabled
            title="قابلیت صوتی در دسترس نیست"
          >
            <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">صوتی</span>
          </button>
          <button
            onClick={() => handleTabChange('pricing')}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'pricing' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">اشتراک</span>
          </button>
          <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5 sm:mx-1 hidden sm:block"></div>
          <button
            onClick={() => {
              if (isAdmin) {
                handleTabChange('admin');
              } else {
                setShowAdminLogin(true);
              }
            }}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'admin' 
                ? 'bg-red-600/80 text-white shadow-lg' 
                : 'text-gray-500 hover:text-red-400 hover:bg-white/5'
            }`}
            title="پنل مدیریت"
          >
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col overflow-hidden min-h-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />
        
        <div className="relative flex-1 h-full w-full overflow-hidden">
          {activeTab === 'chat' && (
            <ChatInterface 
              onNavigateToPricing={() => setActiveTab('pricing')}
            />
          )}
          
          {activeTab === 'voice' && <LiveVoiceInterface />}
          
          {activeTab === 'pricing' && (
            paymentPlan ? (
              <PaymentPage 
                plan={paymentPlan}
                onBack={() => setPaymentPlan(null)}
                onSuccess={() => {
                  // Activate premium after successful payment
                  localStorage.setItem('hasPremium', 'true');
                  setPaymentPlan(null);
                  setActiveTab('chat');
                }}
              />
            ) : (
              <PricingPlans plans={plans} onSelectPlan={setPaymentPlan} />
            )
          )}

          {activeTab === 'admin' && isAdmin && (
            <AdminPanel plans={plans} setPlans={setPlans} onLogout={handleAdminLogout} />
          )}
        </div>
      </main>

    </div>
  );
};

export default App;