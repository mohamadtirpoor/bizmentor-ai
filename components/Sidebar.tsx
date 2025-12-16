import React from 'react';
import { 
  X, 
  MessageSquare, 
  Plus, 
  User, 
  Settings, 
  LogIn,
  Clock,
  Trash2,
  ChevronLeft
} from 'lucide-react';

interface ChatHistory {
  id: string;
  title: string;
  date: string;
  preview: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  chatHistory: ChatHistory[];
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  currentChatId?: string;
  isLoggedIn: boolean;
  userData: { name: string; email: string } | null;
  onLogout: () => void;
  onShowAuth: () => void;
  onShowProfile: () => void;
  onShowSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  onNewChat,
  chatHistory,
  onSelectChat,
  onDeleteChat,
  currentChatId,
  isLoggedIn,
  userData,
  onLogout,
  onShowAuth,
  onShowProfile,
  onShowSettings
}) => {



  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 right-0 h-full w-[85vw] sm:w-80 bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/10">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            منو
          </h2>
          <button 
            onClick={onToggle}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Section */}
        <div className="p-3 sm:p-4 border-b border-white/10">
          {isLoggedIn && userData ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/5 rounded-lg sm:rounded-xl">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base">
                  {userData.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate text-sm sm:text-base">{userData.name}</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 truncate">{userData.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              >
                خروج
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button 
                onClick={onShowAuth}
                className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg sm:rounded-xl font-medium transition-all text-sm sm:text-base"
              >
                <LogIn className="w-4 h-4" />
                ورود / ثبت‌نام
              </button>
            </div>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-3 sm:p-4 border-b border-white/10">
          <button 
            onClick={() => {
              onNewChat();
              onToggle();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg sm:rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            چت جدید
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3 text-gray-400 text-xs sm:text-sm">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>تاریخچه</span>
            </div>
            
            {chatHistory.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-500 text-xs sm:text-sm">
                چتی وجود ندارد
              </div>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {chatHistory.map((chat) => (
                  <div 
                    key={chat.id}
                    className={`group relative p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all cursor-pointer ${
                      currentChatId === chat.id 
                        ? 'bg-purple-600/20 border border-purple-500/30' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      onSelectChat(chat.id);
                      onToggle();
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-medium text-white text-xs sm:text-sm line-clamp-1">{chat.title}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded text-red-400 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-2 mb-1 sm:mb-2">{chat.preview}</p>
                    <span className="text-[9px] sm:text-[10px] text-gray-600">{chat.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Menu */}
        <div className="p-3 sm:p-4 border-t border-white/10 space-y-1">
          <button 
            onClick={() => {
              if (isLoggedIn) {
                onShowProfile();
                onToggle();
              } else {
                onShowAuth();
              }
            }}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm"
          >
            <User className="w-4 h-4" />
            پروفایل
          </button>
          <button 
            onClick={() => {
              onShowSettings();
              onToggle();
            }}
            className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm"
          >
            <Settings className="w-4 h-4" />
            تنظیمات
          </button>
        </div>
      </aside>


    </>
  );
};

export default Sidebar;
