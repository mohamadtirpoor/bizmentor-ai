import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Search, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface Chat {
  id: number;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  chatId: number;
  role: string;
  content: string;
  createdAt: string;
}

interface AdminDashboardProps {
  darkMode?: boolean;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ darkMode = false, onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalChats: 0, totalMessages: 0 });

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
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

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setSelectedChat(null);
    setChatMessages([]);
    loadUserChats(user.id);
  };

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat);
    loadChatMessages(chat.id);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm)
  );

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-[#0a0a0f] text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Header */}
      <header className={`h-16 flex items-center justify-between px-6 border-b ${darkMode ? 'bg-[#12121a] border-purple-500/20' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <img src="/logo/Untitled-1.png" alt="بیزنس‌متر" className="w-10 h-10 rounded-xl" />
          <div>
            <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>پنل مدیریت</h1>
            <p className={`text-xs ${darkMode ? 'text-purple-400' : 'text-gray-500'}`}>مدیریت کاربران و چت‌ها</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            darkMode ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200'
          }`}
        >
          خروج
        </button>
      </header>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-[#12121a] border border-purple-500/20' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>کل کاربران</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-[#12121a] border border-purple-500/20' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>کل چت‌ها</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.totalChats}</p>
              </div>
            </div>
          </div>
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-[#12121a] border border-purple-500/20' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>کل پیام‌ها</p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.totalMessages}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 px-6 pb-6 overflow-hidden">
        {/* Users List */}
        <div className={`w-80 flex flex-col rounded-xl ${darkMode ? 'bg-[#12121a] border border-purple-500/20' : 'bg-white border border-gray-200'}`}>
          <div className="p-4 border-b ${darkMode ? 'border-purple-500/20' : 'border-gray-200'}">
            <div className="relative">
              <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                className={`w-full pr-10 pl-4 py-2 rounded-lg text-sm ${
                  darkMode ? 'bg-[#1a1a24] border border-purple-500/20 text-white' : 'bg-gray-50 border border-gray-200 text-gray-800'
                }`}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className={`w-full p-3 rounded-lg text-right mb-2 transition-colors ${
                    selectedUser?.id === user.id
                      ? (darkMode ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-100 border border-purple-200')
                      : (darkMode ? 'hover:bg-purple-500/10' : 'hover:bg-gray-50')
                  }`}
                >
                  <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{user.name}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                  {user.phone && <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{user.phone}</p>}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chats List */}
        {selectedUser && (
          <div className={`w-80 flex flex-col rounded-xl ${darkMode ? 'bg-[#12121a] border border-purple-500/20' : 'bg-white border border-gray-200'}`}>
            <div className={`p-4 border-b ${darkMode ? 'border-purple-500/20' : 'border-gray-200'}`}>
              <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>چت‌های {selectedUser.name}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {userChats.length === 0 ? (
                <p className={`text-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'} mt-4`}>چتی وجود ندارد</p>
              ) : (
                userChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleChatClick(chat)}
                    className={`w-full p-3 rounded-lg text-right mb-2 transition-colors ${
                      selectedChat?.id === chat.id
                        ? (darkMode ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-100 border border-purple-200')
                        : (darkMode ? 'hover:bg-purple-500/10' : 'hover:bg-gray-50')
                    }`}
                  >
                    <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{chat.title}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(chat.createdAt).toLocaleDateString('fa-IR')}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        {selectedChat && (
          <div className={`flex-1 flex flex-col rounded-xl ${darkMode ? 'bg-[#12121a] border border-purple-500/20' : 'bg-white border border-gray-200'}`}>
            <div className={`p-4 border-b ${darkMode ? 'border-purple-500/20' : 'border-gray-200'}`}>
              <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedChat.title}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : (darkMode ? 'bg-[#1a1a24] text-gray-200' : 'bg-gray-100 text-gray-800')
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-purple-200' : (darkMode ? 'text-gray-500' : 'text-gray-400')}`}>
                      {new Date(msg.createdAt).toLocaleString('fa-IR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
