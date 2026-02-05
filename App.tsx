import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import PricingPlans from './components/PricingPlans';
import PaymentPage from './components/PaymentPage';
import AdminPage from './components/AdminPage';
import AdminLoginModal from './components/AdminLoginModal';
import AuthModal from './components/AuthModalSimple';
import ProfileModal from './components/ProfileModal';
import BlogPage from './components/BlogPage';
import { 
  MessageSquare, 
  Star,
  Zap,
  Crown,
  Plus,
  Sun,
  Moon,
  Menu,
  X,
  BookOpen
} from 'lucide-react';

interface ChatHistory {
  id: string;
  title: string;
  messages: any[];
  createdAt: Date;
}

const INITIAL_PLANS = [
  {
    id: 'pro',
    name: 'حرفه‌ای',
    price: '۲۹۹,۰۰۰',
    period: 'ماهانه',
    icon: Star,
    color: 'text-blue-400',
    features: [
      'دسترسی به چت هوشمند',
      'تحلیل‌های استاندارد کسب‌وکار',
      'تاریخچه چت ۳۰ روزه',
      'پشتیبانی ایمیلی'
    ]
  },
  {
    id: 'pro-plus',
    name: 'پرو پلاس',
    price: '۶۹۹,۰۰۰',
    period: 'ماهانه',
    icon: Zap,
    color: 'text-purple-400',
    isPopular: true,
    features: [
      'همه امکانات پلن حرفه‌ای',
      'مدل پیشرفته بیزنس‌متر',
      'تحقیق بازار',
      'پاسخ‌دهی سریع‌تر',
      'خروجی PDF'
    ]
  },
  {
    id: 'platinum',
    name: 'پلاتینیوم',
    price: '۱,۴۹۰,۰۰۰',
    period: 'ماهانه',
    icon: Crown,
    color: 'text-amber-400',
    features: [
      'همه امکانات پلن پرو پلاس',
      'مکالمه صوتی زنده',
      'تحلیل‌های نامحدود',
      'مشاور اختصاصی',
      'پشتیبانی VIP'
    ]
  }
];

const App: React.FC = () => {
  // Check if we're on /admin route
  const isAdminRoute = window.location.pathname === '/admin';
  
  // If admin route, show only admin page
  if (isAdminRoute) {
    return <AdminPage darkMode={true} />;
  }
  
  const [activeTab, setActiveTab] = useState<'chat' | 'pricing' | 'blog' | 'admin'>('chat');
  const [paymentPlan, setPaymentPlan] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [chatKey, setChatKey] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  // User state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [hasPremium] = useState(true); // همه کاربران دسترسی کامل دارن
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUser = localStorage.getItem('userData');
    const savedTheme = localStorage.getItem('darkMode');
    const savedChats = localStorage.getItem('chatHistory');
    
    setIsAdmin(adminStatus);
    // اگر savedTheme وجود نداشت، پیش‌فرض true (dark) است
    setDarkMode(savedTheme === null ? true : savedTheme === 'true');
    
    if (loggedIn && storedUser) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(storedUser));
    }
    
    if (savedChats) {
      setChatHistory(JSON.parse(savedChats));
    }
  }, []);

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

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    setActiveChatId(newChatId);
    setChatKey(prev => prev + 1);
    setActiveTab('chat');
  };

  const handleSaveChat = (messages: any[], title: string) => {
    if (messages.length === 0) return;
    
    const chatId = activeChatId || Date.now().toString();
    const existingIndex = chatHistory.findIndex(c => c.id === chatId);
    
    let newHistory: ChatHistory[];
    if (existingIndex >= 0) {
      newHistory = [...chatHistory];
      newHistory[existingIndex] = { ...newHistory[existingIndex], messages, title };
    } else {
      const newChat: ChatHistory = {
        id: chatId,
        title: title || 'چت جدید',
        messages,
        createdAt: new Date()
      };
      newHistory = [newChat, ...chatHistory];
    }
    
    setChatHistory(newHistory);
    setActiveChatId(chatId);
    localStorage.setItem('chatHistory', JSON.stringify(newHistory));
  };

  const handleSelectChat = (chat: ChatHistory) => {
    setActiveChatId(chat.id);
    setChatKey(prev => prev + 1);
    setActiveTab('chat');
  };

  const handleAuthSuccess = (user: { name: string; email: string }) => {
    setIsLoggedIn(true);
    setUserData(user);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(user));
    setShowAuthModal(false);
    setActiveTab('chat'); // بعد از ثبت‌نام مستقیم به چت برو
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
  };

  const currentChat = chatHistory.find(c => c.id === activeChatId);

  return (
    <div className={`h-screen w-screen flex overflow-hidden font-['Vazirmatn'] ${
      darkMode 
        ? 'bg-[#0a0a0f] text-white' 
        : 'bg-white text-gray-800'
    }`}>
      
      {showAdminLogin && (
        <AdminLoginModal 
          onClose={() => setShowAdminLogin(false)}
          onLogin={handleAdminLogin}
          darkMode={darkMode}
        />
      )}

      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          darkMode={darkMode}
        />
      )}

      {showProfileModal && userData && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userData={userData}
          hasPremium={hasPremium}
          freeMessagesUsed={0}
          onUpdateProfile={(data) => {
            setUserData(data);
            localStorage.setItem('userData', JSON.stringify(data));
          }}
          onLogout={handleLogout}
          darkMode={darkMode}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileSidebar(false)} />
          <aside className={`absolute right-0 top-0 h-full w-72 flex flex-col ${
            darkMode 
              ? 'bg-[#0d0d15]' 
              : 'bg-white'
          }`}>
            {/* Header */}
            <div className={`p-4 flex items-center justify-between ${darkMode ? 'shadow-[0_2px_10px_rgba(139,92,246,0.1)]' : 'shadow-sm'}`}>
              <div className="flex items-center gap-3">
                <img src="/logo/Untitled-2.png" alt="بیزنس‌متر" className="w-10 h-10 rounded-xl object-contain" />
                <div>
                  <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>بیزنس‌متر</h1>
                  <p className={`text-[10px] ${darkMode ? 'text-purple-400' : 'text-gray-500'}`}>مشاور هوشمند کسب‌وکار</p>
                </div>
              </div>
              <button onClick={() => setShowMobileSidebar(false)} className={`p-2 rounded-lg ${darkMode ? 'text-gray-400 hover:bg-purple-500/20' : 'text-gray-500 hover:bg-gray-100'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-3">
              <button
                onClick={() => { handleNewChat(); setShowMobileSidebar(false); }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  darkMode 
                    ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                <Plus className="w-5 h-5" />
                چت جدید
              </button>
            </div>

            {/* Recent Chats */}
            <div className="flex-1 p-3 overflow-y-auto">
              <p className={`px-4 py-2 text-xs font-medium ${darkMode ? 'text-purple-400/60' : 'text-gray-500'}`}>گفتگوهای اخیر</p>
              <div className="space-y-1">
                {chatHistory.length === 0 ? (
                  <p className={`px-4 py-2 text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>هنوز گفتگویی ندارید</p>
                ) : (
                  chatHistory.slice(0, 10).map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => { handleSelectChat(chat); setShowMobileSidebar(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all text-right ${
                        activeChatId === chat.id
                          ? darkMode 
                            ? 'bg-purple-500/20 text-purple-300' 
                            : 'bg-purple-100 text-purple-700'
                          : darkMode 
                            ? 'text-gray-400 hover:bg-purple-500/10' 
                            : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-purple-500' : 'text-gray-400'}`} />
                      <span className="truncate">{chat.title}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Blog Link - Mobile */}
            <button
              onClick={() => { setActiveTab('blog'); setShowMobileSidebar(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all mb-2 ${
                activeTab === 'blog'
                  ? darkMode
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-purple-100 text-purple-700'
                  : darkMode
                    ? 'text-gray-300 hover:bg-purple-500/10'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>مقالات آموزشی</span>
            </button>

            {/* User Account */}
            {isLoggedIn && userData && (
              <div className={`p-3 ${darkMode ? 'shadow-[0_-2px_10px_rgba(139,92,246,0.1)]' : 'shadow-[0_-2px_10px_rgba(0,0,0,0.05)]'}`}>
                {isAdmin && (
                  <a
                    href="/admin"
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all mb-2 ${
                      darkMode ? 'text-gray-300 hover:bg-purple-500/10' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span>پنل مدیریت</span>
                  </a>
                )}
                <button
                  onClick={() => { setShowProfileModal(true); setShowMobileSidebar(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    darkMode ? 'text-gray-300 hover:bg-purple-500/10' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-sm font-bold">
                    {userData.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-right">
                    <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{userData.name}</p>
                    <p className={`text-xs ${darkMode ? 'text-purple-400/60' : 'text-gray-400'}`}>
                      {hasPremium ? 'اشتراک فعال' : 'بدون اشتراک'}
                    </p>
                  </div>
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex w-64 flex-col ${
        darkMode 
          ? 'bg-[#0d0d15] shadow-[2px_0_15px_rgba(139,92,246,0.05)]' 
          : 'bg-gray-50/50 shadow-[2px_0_15px_rgba(0,0,0,0.05)]'
      }`}>
        {/* Logo + New Chat */}
        <div className={`p-4 ${darkMode ? 'shadow-[0_2px_10px_rgba(139,92,246,0.1)]' : 'shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo/Untitled-2.png" alt="بیزنس‌متر" className="w-10 h-10 rounded-xl object-contain" />
              <div>
                <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>بیزنس‌متر</h1>
                <p className={`text-[10px] ${darkMode ? 'text-purple-400' : 'text-gray-500'}`}>مشاور هوشمند کسب‌وکار</p>
              </div>
            </div>
            <button
              onClick={handleNewChat}
              className={`p-2 rounded-lg transition-all ${
                darkMode 
                  ? 'hover:bg-purple-500/20 text-purple-400 hover:text-purple-300' 
                  : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
              }`}
              title="چت جدید"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Recent Chats */}
        <div className="flex-1 p-3 overflow-y-auto">
          <p className={`px-4 py-2 text-xs font-medium ${darkMode ? 'text-purple-400/60' : 'text-gray-500'}`}>گفتگوهای اخیر</p>
          <div className="space-y-1">
            {chatHistory.length === 0 ? (
              <p className={`px-4 py-2 text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>هنوز گفتگویی ندارید</p>
            ) : (
              chatHistory.slice(0, 10).map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all text-right ${
                    activeChatId === chat.id
                      ? darkMode 
                        ? 'bg-purple-500/20 text-purple-300' 
                        : 'bg-purple-100 text-purple-700'
                      : darkMode 
                        ? 'text-gray-400 hover:bg-purple-500/10' 
                        : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${darkMode ? 'text-purple-500' : 'text-gray-400'}`} />
                  <span className="truncate">{chat.title}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Blog Link - Desktop */}
        <button
          onClick={() => setActiveTab('blog')}
          className={`mx-3 mb-2 flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'blog'
              ? darkMode
                ? 'bg-purple-500/20 text-purple-300'
                : 'bg-purple-100 text-purple-700'
              : darkMode
                ? 'text-gray-300 hover:bg-purple-500/10'
                : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>مقالات آموزشی</span>
        </button>

        {/* User Account */}
        {isLoggedIn && userData && (
          <div className={`p-3 ${darkMode ? 'shadow-[0_-2px_10px_rgba(139,92,246,0.1)]' : 'shadow-[0_-2px_10px_rgba(0,0,0,0.05)]'}`}>
            {isAdmin && (
              <a
                href="/admin"
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all mb-2 ${
                  darkMode ? 'text-gray-300 hover:bg-purple-500/10' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <span>پنل مدیریت</span>
              </a>
            )}
            <button
              onClick={() => setShowProfileModal(true)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                darkMode
                  ? 'text-gray-300 hover:bg-purple-500/10'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-sm font-bold">
                {userData.name.charAt(0)}
              </div>
              <div className="flex-1 text-right">
                <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{userData.name}</p>
                <p className={`text-xs ${darkMode ? 'text-purple-400/60' : 'text-gray-400'}`}>
                  {hasPremium ? 'اشتراک فعال' : 'بدون اشتراک'}
                </p>
              </div>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={`h-14 flex items-center justify-between px-4 ${
          darkMode 
            ? 'bg-[#0a0a0f]' 
            : 'bg-gray-50'
        }`}>
          {/* Mobile Logo + Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className={`p-1.5 rounded-lg transition-all ${
                darkMode 
                  ? 'hover:bg-purple-500/20 text-purple-400' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
            <img src="/logo/Untitled-2.png" alt="بیزنس‌متر" className="w-8 h-8 rounded-lg object-contain" />
            <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>بیزنس‌متر</span>
          </div>

          {/* Desktop - Empty space */}
          <div className="hidden lg:flex"></div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Blog Button */}
            <button
              onClick={() => setActiveTab('blog')}
              className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'blog'
                  ? darkMode
                    ? 'bg-purple-500 text-white'
                    : 'bg-purple-600 text-white'
                  : darkMode
                    ? 'text-gray-400 hover:bg-purple-500/10'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              مقالات
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`flex items-center p-1 rounded-full transition-all ${
                darkMode 
                  ? 'bg-purple-500/20' 
                  : 'bg-gray-200'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-all ${
                !darkMode ? 'bg-white shadow' : ''
              }`}>
                <Sun className={`w-4 h-4 ${!darkMode ? 'text-amber-500' : 'text-gray-500'}`} />
              </div>
              <div className={`p-1.5 rounded-full transition-all ${
                darkMode ? 'bg-purple-600 shadow' : ''
              }`}>
                <Moon className={`w-4 h-4 ${darkMode ? 'text-white' : 'text-gray-400'}`} />
              </div>
            </button>

            {/* User Account - Mobile */}
            {isLoggedIn && userData && (
              <button
                onClick={() => setShowProfileModal(true)}
                className="lg:hidden w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white text-sm font-bold"
              >
                {userData.name.charAt(0)}
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className={`flex-1 overflow-hidden ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
          {activeTab === 'chat' && (
            <ChatInterface 
              key={chatKey}
              onNavigateToPricing={() => setActiveTab('pricing')}
              darkMode={darkMode}
              isLoggedIn={isLoggedIn}
              hasPremium={hasPremium}
              onRequestAuth={() => setShowAuthModal(true)}
              initialMessages={currentChat?.messages}
              onSaveChat={handleSaveChat}
            />
          )}
          
          {activeTab === 'pricing' && (
            paymentPlan ? (
              <PaymentPage 
                plan={paymentPlan}
                onBack={() => setPaymentPlan(null)}
                onSuccess={() => {
                  setPaymentPlan(null);
                  setActiveTab('chat');
                }}
                darkMode={darkMode}
              />
            ) : (
              <PricingPlans plans={INITIAL_PLANS} onSelectPlan={setPaymentPlan} darkMode={darkMode} />
            )
          )}

          {activeTab === 'blog' && (
            <BlogPage 
              darkMode={darkMode}
              onBack={() => setActiveTab('chat')}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
