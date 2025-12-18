import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  DollarSign,
  Activity,
  Search,
  Save,
  Edit2,
  MessageSquare,
  Eye,
  Trash2,
  X,
  RefreshCw,
  User,
  Bot
} from 'lucide-react';

const API_URL = 'http://localhost:3001/api';

interface AdminPanelProps {
  plans: any[];
  setPlans: React.Dispatch<React.SetStateAction<any[]>>;
  onLogout?: () => void;
  darkMode?: boolean;
}

interface Stats {
  totalUsers: number;
  totalChats: number;
  totalMessages: number;
  premiumUsers: number;
}

interface ChatItem {
  id: number;
  title: string;
  mode: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string;
  userEmail: string;
}

interface MessageItem {
  id: number;
  chatId: number;
  role: string;
  content: string;
  createdAt: string;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  hasPremium: boolean;
  freeMessagesUsed: number;
  createdAt: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ plans, setPlans, onLogout, darkMode = true }) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'users' | 'chats' | 'plans'>('dashboard');
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalChats: 0, totalMessages: 0, premiumUsers: 0 });
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [chatMessages, setChatMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/stats`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`);
      const data = await res.json();
      setUsersList(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchChats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/chats`);
      const data = await res.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchChatMessages = async (chatId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/chats/${chatId}/messages`);
      const data = await res.json();
      setChatMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    setLoading(false);
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('آیا از حذف این کاربر مطمئن هستید؟')) return;
    try {
      await fetch(`${API_URL}/admin/users/${userId}`, { method: 'DELETE' });
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchChats();
  }, []);

  const handleUpdatePlan = (id: string, field: string, value: string) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  return (
    <div className="flex h-full w-full bg-[#050505]">
      {/* Chat Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedChat.title}</h3>
                <p className="text-xs text-gray-400">{selectedChat.userName} - {selectedChat.userEmail}</p>
              </div>
              <button onClick={() => { setSelectedChat(null); setChatMessages([]); }} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : chatMessages.length === 0 ? (
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

      {/* Sidebar */}
      <aside className="w-64 border-l border-white/10 bg-black/40 flex-col hidden md:flex">
        <div className="p-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            پنل مدیریت
          </h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeView === 'dashboard' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <LayoutDashboard className="w-5 h-5" />
            داشبورد
          </button>
          <button onClick={() => setActiveView('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeView === 'users' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <Users className="w-5 h-5" />
            کاربران
          </button>
          <button onClick={() => setActiveView('chats')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeView === 'chats' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <MessageSquare className="w-5 h-5" />
            چت‌ها
          </button>
          <button onClick={() => setActiveView('plans')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeView === 'plans' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20' : 'text-gray-400 hover:bg-white/5'}`}>
            <DollarSign className="w-5 h-5" />
            اشتراک‌ها
          </button>
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-bold">A</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">مدیر سیستم</p>
              <p className="text-xs text-gray-500 truncate">admin@businessmeter.ir</p>
            </div>
          </div>
          {onLogout && (
            <button onClick={onLogout} className="w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
              خروج از پنل مدیریت
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <div className="md:hidden flex overflow-x-auto p-4 gap-2 border-b border-white/10">
          <button onClick={() => setActiveView('dashboard')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeView === 'dashboard' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'}`}>داشبورد</button>
          <button onClick={() => setActiveView('users')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeView === 'users' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'}`}>کاربران</button>
          <button onClick={() => setActiveView('chats')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeView === 'chats' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'}`}>چت‌ها</button>
          <button onClick={() => setActiveView('plans')} className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${activeView === 'plans' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'}`}>اشتراک‌ها</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
          <div className="max-w-5xl mx-auto w-full">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">
                {activeView === 'dashboard' && 'داشبورد مدیریتی'}
                {activeView === 'users' && 'لیست کاربران'}
                {activeView === 'chats' && 'چت‌های کاربران'}
                {activeView === 'plans' && 'ویرایش طرح‌های درآمدی'}
              </h1>
              <p className="text-gray-400 text-sm">به پنل مدیریت بیزنس‌متر خوش آمدید.</p>
            </div>

            {/* Dashboard */}
            {activeView === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button onClick={() => { fetchStats(); fetchUsers(); fetchChats(); }} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300">
                    <RefreshCw className="w-4 h-4" />
                    بروزرسانی
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4"><Users className="w-6 h-6 text-purple-400" /></div>
                    <h3 className="text-gray-400 text-sm mb-1">کل کاربران</h3>
                    <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="p-3 bg-blue-500/20 rounded-xl w-fit mb-4"><MessageSquare className="w-6 h-6 text-blue-400" /></div>
                    <h3 className="text-gray-400 text-sm mb-1">کل چت‌ها</h3>
                    <p className="text-3xl font-bold text-white">{stats.totalChats}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="p-3 bg-emerald-500/20 rounded-xl w-fit mb-4"><Activity className="w-6 h-6 text-emerald-400" /></div>
                    <h3 className="text-gray-400 text-sm mb-1">کل پیام‌ها</h3>
                    <p className="text-3xl font-bold text-white">{stats.totalMessages}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                    <div className="p-3 bg-amber-500/20 rounded-xl w-fit mb-4"><DollarSign className="w-6 h-6 text-amber-400" /></div>
                    <h3 className="text-gray-400 text-sm mb-1">کاربران Premium</h3>
                    <p className="text-3xl font-bold text-white">{stats.premiumUsers}</p>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-400" />آخرین چت‌ها</h3>
                  <div className="space-y-3">
                    {chats.slice(0, 5).map((chat) => (
                      <div key={chat.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer" onClick={() => { setSelectedChat(chat); fetchChatMessages(chat.id); }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300">{chat.userName?.charAt(0) || '?'}</div>
                          <div>
                            <p className="text-white font-medium text-sm">{chat.title}</p>
                            <p className="text-xs text-gray-500">{chat.userName} - {chat.userEmail}</p>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-gray-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users */}
            {activeView === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-64">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input type="text" placeholder="جستجو کاربر..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-purple-500" />
                  </div>
                  <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300"><RefreshCw className="w-4 h-4" />بروزرسانی</button>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-right">
                    <thead className="bg-white/5 text-gray-400 text-xs uppercase">
                      <tr>
                        <th className="px-6 py-4 font-medium">کاربر</th>
                        <th className="px-6 py-4 font-medium">وضعیت</th>
                        <th className="px-6 py-4 font-medium">پیام رایگان</th>
                        <th className="px-6 py-4 font-medium">تاریخ عضویت</th>
                        <th className="px-6 py-4 font-medium">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {usersList.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                        <tr key={user.id} className="text-sm text-gray-300 hover:bg-white/5">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold">{user.name.charAt(0)}</div>
                              <div>
                                <div className="font-medium text-white">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${user.hasPremium ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>{user.hasPremium ? 'Premium' : 'رایگان'}</span></td>
                          <td className="px-6 py-4 text-gray-400">{user.freeMessagesUsed}/1</td>
                          <td className="px-6 py-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString('fa-IR')}</td>
                          <td className="px-6 py-4"><button onClick={() => deleteUser(user.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400"><Trash2 className="w-4 h-4" /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Chats */}
            {activeView === 'chats' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-64">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                    <input type="text" placeholder="جستجو چت..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full py-2 pr-10 pl-4 text-sm text-white focus:outline-none focus:border-purple-500" />
                  </div>
                  <button onClick={fetchChats} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300"><RefreshCw className="w-4 h-4" />بروزرسانی</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chats.filter(c => c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.userName?.toLowerCase().includes(searchTerm.toLowerCase())).map((chat) => (
                    <div key={chat.id} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer group" onClick={() => { setSelectedChat(chat); fetchChatMessages(chat.id); }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-sm">{chat.userName?.charAt(0) || '?'}</div>
                          <div>
                            <p className="text-xs text-gray-400">{chat.userName}</p>
                            <p className="text-[10px] text-gray-600">{chat.userEmail}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${chat.mode === 'consultant' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{chat.mode === 'consultant' ? 'مشاوره' : 'تحقیق'}</span>
                      </div>
                      <h4 className="text-white font-medium text-sm mb-2 line-clamp-2">{chat.title}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-600">{new Date(chat.createdAt).toLocaleDateString('fa-IR')}</span>
                        <Eye className="w-4 h-4 text-gray-600 group-hover:text-purple-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plans */}
            {activeView === 'plans' && (
              <div className="grid grid-cols-1 gap-6">
                {plans.map((plan) => (
                  <div key={plan.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 relative group">
                    <div className="absolute top-4 left-4 p-2 bg-white/5 rounded-full opacity-0 group-hover:opacity-100"><Edit2 className="w-4 h-4 text-gray-400" /></div>
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`p-4 rounded-2xl bg-white/5 ${plan.color}`}><plan.icon className="w-8 h-8" /></div>
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">نام پلن</label>
                          <input type="text" value={plan.name} onChange={(e) => handleUpdatePlan(plan.id, 'name', e.target.value)} className="bg-transparent border-b border-white/20 pb-1 w-full text-xl font-bold text-white focus:border-purple-500 focus:outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">قیمت (تومان)</label>
                          <input type="text" value={plan.price} onChange={(e) => handleUpdatePlan(plan.id, 'price', e.target.value)} className="bg-transparent border-b border-white/20 pb-1 w-full text-lg font-mono text-gray-300 focus:border-purple-500 focus:outline-none" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs text-gray-500">ویژگی‌ها</label>
                      {plan.features.map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 p-2 rounded-lg">
                          <div className={`w-1.5 h-1.5 rounded-full ${plan.color.replace('text-', 'bg-')}`}></div>
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex justify-end mt-4">
                  <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-600/20">
                    <Save className="w-5 h-5" />
                    ذخیره تغییرات
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
