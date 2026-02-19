import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Search, 
  TrendingUp, 
  TrendingDown,
  Crown,
  Calendar,
  Clock,
  Mail,
  Phone,
  RefreshCw,
  Filter,
  Download,
  BarChart3,
  Activity,
  X,
  User,
  Bot,
  Brain,
  Bug
} from 'lucide-react';
import LearningPanel from './LearningPanel';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  hasPremium: boolean;
  freeMessagesUsed: number;
  createdAt: string;
}

interface Chat {
  id: number;
  userId: number;
  title: string;
  mode: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  chatId: number;
  role: string;
  content: string;
  metadata: any;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalChats: number;
  totalMessages: number;
  premiumUsers: number;
}

interface AdminDashboardProps {
  darkMode?: boolean;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ darkMode = true, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'learning'>('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalChats: 0, totalMessages: 0, premiumUsers: 0 });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [showDebugModal, setShowDebugModal] = useState(false);

  useEffect(() => {
    loadAllData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadAllData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadAllData = async () => {
    await Promise.all([
      loadUsers(),
      loadStats(),
      loadRecentChats()
    ]);
  };

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
      setRecentUsers(data.slice(0, 5));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentChats = async () => {
    try {
      const response = await fetch('/api/admin/chats');
      const data = await response.json();
      setRecentChats(data.slice(0, 5));
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadUserChats = async (userId: number) => {
    try {
      const response = await fetch(`/api/chats/user/${userId}`);
      const data = await response.json();
      setUserChats(data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadChatMessages = async (chatId: number) => {
    try {
      const response = await fetch(`/api/admin/chats/${chatId}/messages`);
      const data = await response.json();
      setChatMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadDebugData = async () => {
    try {
      const response = await fetch('/api/admin/debug-data');
      const data = await response.json();
      setDebugData(data);
      setShowDebugModal(true);
      console.log('🔍 Debug Data:', data);
    } catch (error) {
      console.error('Error loading debug data:', error);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
    loadUserChats(user.id);
  };

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat);
    setShowChatModal(true);
    loadChatMessages(chat.id);
  };

  const handleRefresh = () => {
    loadAllData();
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      'consultant': 'مشاور',
      'product': 'مدیر محصول',
      'marketing': 'مدیر مارکتینگ',
      'sales': 'مدیر فروش',
      'finance': 'مدیر مالی',
      'hr': 'مدیر منابع انسانی',
      'analysis': 'تحلیلگر'
    };
    return labels[mode] || mode;
  };

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Header */}
      <header className={`h-16 flex items-center justify-between px-6 border-b ${darkMode ? 'bg-[#12121a] border-purple-500/20' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo/Untitled-2.png" alt="بیزنس‌متر" className="w-20 h-20 rounded-xl" />
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>پنل مدیریت بیزنس‌متر</h1>
              <p className={`text-sm ${darkMode ? 'text-purple-400' : 'text-gray-500'}`}>داشبورد تحلیلی و مدیریت کاربران</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? darkMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-600 text-white'
                  : darkMode
                  ? 'text-gray-400 hover:bg-purple-500/10'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              داشبورد
            </button>
            <button
              onClick={() => setActiveTab('learning')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'learning'
                  ? darkMode
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-600 text-white'
                  : darkMode
                  ? 'text-gray-400 hover:bg-purple-500/10'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Brain className="w-4 h-4" />
              یادگیری AI
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDebugData}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30' : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
            }`}
            title="بررسی دیتابیس"
          >
            <Bug className="w-5 h-5" />
          </button>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
            }`}
            title="بروزرسانی"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={onLogout}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              darkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
          >
            خروج
          </button>
        </div>
      </header>

      {/* Content */}
      {activeTab === 'learning' ? (
        <LearningPanel darkMode={darkMode} />
      ) : (
        <>
      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Users Card */}
          <div className={`p-5 rounded-xl ${darkMode ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30' : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>کل کاربران</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.totalUsers}</p>
            <p className="text-xs text-green-500 mt-2">+12% نسبت به ماه قبل</p>
          </div>

          {/* Premium Users Card */}
          <div className={`p-5 rounded-xl ${darkMode ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30' : 'bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/30 flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>کاربران Premium</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.premiumUsers}</p>
            <p className="text-xs text-green-500 mt-2">+8% نسبت به ماه قبل</p>
          </div>

          {/* Total Chats Card */}
          <div className={`p-5 rounded-xl ${darkMode ? 'bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30' : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/30 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>کل چت‌ها</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.totalChats}</p>
            <p className="text-xs text-green-500 mt-2">+25% نسبت به ماه قبل</p>
          </div>

          {/* Total Messages Card */}
          <div className={`p-5 rounded-xl ${darkMode ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30' : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className={`text-sm mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>کل پیام‌ها</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.totalMessages}</p>
            <p className="text-xs text-green-500 mt-2">+18% نسبت به ماه قبل</p>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Recent Users */}
          <div className={`p-5 rounded-xl ${darkMode ? 'bg-[#12121a] border border-purple-500/20' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>کاربران اخیر</h3>
              <Users className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-[#1a1a24] hover:bg-[#1f1f2a]' : 'bg-gray-50 hover:bg-gray-100'} transition-colors cursor-pointer`} onClick={() => handleUserClick(user)}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.name}</p>
                      {user.hasPremium && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 text-xs rounded-full">Premium</span>
                      )}
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} dir="ltr">{user.email}</p>
                  </div>
                  <div className="text-left">
                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Chats */}
          <div className={`p-5 rounded-xl ${darkMode ? 'bg-[#12121a] border border-purple-500/20' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>چت‌های اخیر</h3>
              <MessageSquare className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div className="space-y-3">
              {recentChats.map((chat) => (
                <div key={chat.id} className={`flex items-center gap-3 p-3 rounded-lg ${darkMode ? 'bg-[#1a1a24] hover:bg-[#1f1f2a]' : 'bg-gray-50 hover:bg-gray-100'} transition-colors cursor-pointer`} onClick={() => handleChatClick(chat)}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{chat.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                        {getModeLabel(chat.mode)}
                      </span>
                      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(chat.updatedAt).toLocaleDateString('fa-IR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - با اسکرول */}
      <div className="flex-1 overflow-y-auto px-6 pb-6" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        <div className="grid grid-cols-1 gap-4">
          {/* All Users Table */}
          <div className={`rounded-xl ${darkMode ? 'bg-[#12121a] border border-purple-500/20' : 'bg-white border border-gray-200'}`}>
            <div className={`p-4 border-b ${darkMode ? 'border-purple-500/20' : 'border-gray-200'}`}>
              <h3 className={`font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>همه کاربران</h3>
              <div className="relative">
                <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجو نام، ایمیل، شماره..."
                  className={`w-full pr-10 pl-4 py-2 rounded-lg text-sm ${
                    darkMode ? 'bg-[#1a1a24] border border-purple-500/20 text-white placeholder-gray-500' : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400'
                  }`}
                />
              </div>
            </div>
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className={`text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} py-8`}>کاربری یافت نشد</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserClick(user)}
                      className={`p-4 rounded-lg text-right transition-colors ${
                        darkMode ? 'bg-[#1a1a24] hover:bg-[#1f1f2a] border border-purple-500/10' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.name}</p>
                        {user.hasPremium && (
                          <Crown className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-1">
                        <Mail className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} dir="ltr">{user.email}</p>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1 mb-1">
                          <Phone className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} dir="ltr">{user.phone}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className={`w-3 h-3 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                          <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                            {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                          {user.freeMessagesUsed} پیام
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-lg">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-xs text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">وضعیت اشتراک</p>
                  <p className={`text-lg font-bold ${selectedUser.hasPremium ? 'text-amber-400' : 'text-gray-400'}`}>
                    {selectedUser.hasPremium ? 'Premium' : 'رایگان'}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">پیام‌های استفاده شده</p>
                  <p className="text-lg font-bold text-white">{selectedUser.freeMessagesUsed}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl col-span-2">
                  <p className="text-xs text-gray-500 mb-1">تاریخ عضویت</p>
                  <p className="text-lg font-bold text-white">{new Date(selectedUser.createdAt).toLocaleDateString('fa-IR')}</p>
                </div>
                {selectedUser.phone && (
                  <div className="p-4 bg-white/5 rounded-xl col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-xs text-gray-500">شماره تماس</p>
                    </div>
                    <p className="text-lg font-bold text-white" dir="ltr">{selectedUser.phone}</p>
                  </div>
                )}
              </div>
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <p className="text-sm text-purple-300">شناسه کاربر: {selectedUser.id}</p>
              </div>
              {userChats.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-3">چت‌های کاربر ({userChats.length})</h4>
                  <div className="space-y-2">
                    {userChats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => handleChatClick(chat)}
                        className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-right transition-colors"
                      >
                        <p className="text-sm text-white font-medium">{chat.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                            {getModeLabel(chat.mode)}
                          </span>
                          <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {new Date(chat.updatedAt).toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-white/10">
              <button 
                onClick={() => setShowUserModal(false)}
                className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Details Modal */}
      {showChatModal && selectedChat && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedChat.title}</h3>
                <p className="text-xs text-gray-400">{getModeLabel(selectedChat.mode)}</p>
              </div>
              <button onClick={() => setShowChatModal(false)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">پیامی یافت نشد</div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-700' : 'bg-purple-600'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-white/10 rounded-tr-none' : 'bg-purple-900/30 rounded-tl-none'}`}>
                      <p className="text-sm text-gray-200 whitespace-pre-wrap">{msg.content}</p>
                      <span className="text-[10px] text-gray-600 mt-1 block">{new Date(msg.createdAt).toLocaleString('fa-IR')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Debug Modal */}
      {showDebugModal && debugData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bug className="w-6 h-6 text-yellow-500" />
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>بررسی دیتابیس</h2>
                </div>
                <button onClick={() => setShowDebugModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="space-y-6">
                {/* Summary */}
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>خلاصه</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">کاربران</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{debugData.summary.totalUsers}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">چت‌ها</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{debugData.summary.totalChats}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">پیام‌ها</p>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{debugData.summary.totalMessages}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">کاربران بدون چت</p>
                      <p className={`text-2xl font-bold text-yellow-500`}>{debugData.summary.usersWithoutChats}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">چت‌های خالی</p>
                      <p className={`text-2xl font-bold text-red-500`}>{debugData.summary.chatsWithoutMessages}</p>
                    </div>
                  </div>
                </div>

                {/* Raw Data */}
                <div>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>دیتای خام (JSON)</h3>
                  <pre className={`p-4 rounded-xl text-xs overflow-x-auto ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                    {JSON.stringify(debugData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default AdminDashboard;
