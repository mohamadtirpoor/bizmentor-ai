import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Globe, Brain, User, Bot, Sparkles, ExternalLink, Menu } from 'lucide-react';
import { ChatMode, Message, MessageRole } from '../types';
import { streamChatResponse } from '../services/geminiService';
import Sidebar from './Sidebar';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal';

interface ChatHistory {
  id: string;
  title: string;
  date: string;
  preview: string;
  messages: Message[];
  mode: ChatMode;
}

interface ChatInterfaceProps {
  onNavigateToPricing?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNavigateToPricing }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: MessageRole.MODEL,
      text: 'سلام! من **بیزنس‌متر** هستم، مشاور ارشد کسب‌وکار شما. \n\nآماده‌ام تا با تحلیل دقیق و راهکارهای اجرایی به رشد بیزینس شما کمک کنم. لطفاً اطلاعات کسب‌وکار یا چالش فعلی‌تان را بفرمایید.',
      isThinking: false
    }
  ]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ChatMode>(ChatMode.CONSULTANT);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('default');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null);
  const [freeMessagesUsed, setFreeMessagesUsed] = useState(0);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [hasPremium, setHasPremium] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveCurrentChat = () => {
    if (messages.length > 1) {
      const userMessages = messages.filter(m => m.role === MessageRole.USER);
      const firstUserMsg = userMessages[0]?.text || 'چت جدید';
      const title = firstUserMsg.slice(0, 50) + (firstUserMsg.length > 50 ? '...' : '');
      
      setChatHistory(prev => {
        const existing = prev.find(c => c.id === currentChatId);
        if (existing) {
          return prev.map(c => c.id === currentChatId ? {
            ...c,
            messages,
            mode,
            date: new Date().toLocaleDateString('fa-IR')
          } : c);
        }
        return [...prev, {
          id: currentChatId,
          title,
          date: new Date().toLocaleDateString('fa-IR'),
          preview: firstUserMsg.slice(0, 100),
          messages,
          mode
        }];
      });
    }
  };

  const handleNewChat = () => {
    saveCurrentChat();
    setCurrentChatId(Date.now().toString());
    setMessages([{
      id: 'welcome',
      role: MessageRole.MODEL,
      text: 'سلام! من **بیزنس‌متر** هستم، مشاور ارشد کسب‌وکار شما. \n\nآماده‌ام تا با تحلیل دقیق و راهکارهای اجرایی به رشد بیزینس شما کمک کنم. لطفاً اطلاعات کسب‌وکار یا چالش فعلی‌تان را بفرمایید.',
      isThinking: false
    }]);
    setMode(ChatMode.CONSULTANT);
  };

  const handleSelectChat = (chatId: string) => {
    saveCurrentChat();
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chat.id);
      setMessages(chat.messages);
      setMode(chat.mode);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      handleNewChat();
    }
  };

  const handleAuthSuccess = (user: { name: string; email: string }) => {
    setIsLoggedIn(true);
    setUserData(user);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userData', JSON.stringify(user));
    // Initialize free messages count for new user
    if (!localStorage.getItem('freeMessagesUsed')) {
      localStorage.setItem('freeMessagesUsed', '0');
    }
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUser = localStorage.getItem('userData');
    const messagesUsed = parseInt(localStorage.getItem('freeMessagesUsed') || '0');
    const premium = localStorage.getItem('hasPremium') === 'true';
    
    if (loggedIn && storedUser) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(storedUser));
      setFreeMessagesUsed(messagesUsed);
      setHasPremium(premium);
    }
  }, []);



  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check if user is logged in
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    // Check if user has exceeded free messages and doesn't have premium
    if (!hasPremium && freeMessagesUsed >= 1) {
      setShowPricingModal(true);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Increment free messages counter if not premium
    if (!hasPremium) {
      const newCount = freeMessagesUsed + 1;
      setFreeMessagesUsed(newCount);
      localStorage.setItem('freeMessagesUsed', newCount.toString());
    }

    const botMsgId = (Date.now() + 1).toString();
    // Placeholder message for streaming
    setMessages(prev => [...prev, {
      id: botMsgId,
      role: MessageRole.MODEL,
      text: '',
      isThinking: mode === ChatMode.CONSULTANT
    }]);

    try {
      let fullText = '';
      await streamChatResponse(
        messages,
        userMsg.text,
        mode,
        (textChunk) => {
          fullText += textChunk;
          setMessages(prev => prev.map(m => 
            m.id === botMsgId ? { ...m, text: fullText, isThinking: false } : m
          ));
        },
        (groundingChunks) => {
          setMessages(prev => prev.map(m => 
            m.id === botMsgId ? { ...m, groundingMetadata: groundingChunks } : m
          ));
        }
      );
    } catch (error) {
      console.error("Chat Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    saveCurrentChat();
  }, [messages]);

  return (
    <>
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode="register"
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userData={userData}
        hasPremium={hasPremium}
        freeMessagesUsed={freeMessagesUsed}
        onUpdateProfile={(data) => {
          setUserData(data);
          localStorage.setItem('userData', JSON.stringify(data));
        }}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onLogout={() => {
          setIsLoggedIn(false);
          setUserData(null);
          setFreeMessagesUsed(0);
          setHasPremium(false);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userData');
          localStorage.removeItem('freeMessagesUsed');
          localStorage.removeItem('hasPremium');
          setShowSettingsModal(false);
        }}
        onDeleteAccount={() => {
          setIsLoggedIn(false);
          setUserData(null);
          setFreeMessagesUsed(0);
          setHasPremium(false);
          setChatHistory([]);
          localStorage.clear();
        }}
      />

      {/* Pricing Notification Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-md border border-white/10 shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <span className="text-4xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                پیام رایگان شما تمام شد!
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                شما از <span className="text-purple-400 font-bold">{freeMessagesUsed} پیام رایگان</span> خود استفاده کردید.
                <br />
                برای ادامه، یکی از پلن‌های اشتراک را انتخاب کنید.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pb-6">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">پیام‌های رایگان</span>
                  <span className="text-sm font-bold text-purple-400">{freeMessagesUsed}/1</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500" 
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-white/10 space-y-3">
              <button
                onClick={() => {
                  setShowPricingModal(false);
                  if (onNavigateToPricing) {
                    onNavigateToPricing();
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-600/20"
              >
                مشاهده پلن‌های اشتراک
              </button>
              <button
                onClick={() => setShowPricingModal(false)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-xl transition-all"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        currentChatId={currentChatId}
        isLoggedIn={isLoggedIn}
        userData={userData}
        onLogout={() => {
          setIsLoggedIn(false);
          setUserData(null);
          setFreeMessagesUsed(0);
          setHasPremium(false);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userData');
          localStorage.removeItem('freeMessagesUsed');
          localStorage.removeItem('hasPremium');
        }}
        onShowAuth={() => setShowAuthModal(true)}
        onShowProfile={() => setShowProfileModal(true)}
        onShowSettings={() => setShowSettingsModal(true)}
      />
      
      <div className="flex flex-col h-full w-full max-w-5xl mx-auto">
        {/* Hamburger Button & Free Messages Counter */}
        <div className="flex justify-between items-center p-4 flex-none">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {isLoggedIn && !hasPremium && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs">
              <span className="text-gray-400">پیام رایگان:</span>
              <span className={`font-bold ${freeMessagesUsed >= 1 ? 'text-red-400' : 'text-green-400'}`}>
                {Math.max(0, 1 - freeMessagesUsed)} باقی‌مانده
              </span>
            </div>
          )}
          
          {isLoggedIn && hasPremium && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full text-xs">
              <span className="text-amber-400">👑</span>
              <span className="text-amber-300 font-bold">اشتراک فعال</span>
            </div>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="flex justify-center px-4 pb-4 flex-none">
        <div className="flex bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10">
          <button
            onClick={() => setMode(ChatMode.CONSULTANT)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all text-sm font-medium ${
              mode === ChatMode.CONSULTANT 
                ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            مشاوره تخصصی (Thinking)
          </button>
          <button
            onClick={() => setMode(ChatMode.RESEARCH)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all text-sm font-medium ${
              mode === ChatMode.RESEARCH 
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            تحقیق بازار (Search)
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 min-h-0 scroll-smooth">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === MessageRole.USER 
                ? 'bg-gray-700 text-white' 
                : 'bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
            }`}>
              {msg.role === MessageRole.USER ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col max-w-[85%] ${msg.role === MessageRole.USER ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-5 py-4 rounded-2xl backdrop-blur-sm border ${
                  msg.role === MessageRole.USER
                    ? 'bg-white/10 border-white/5 text-gray-100 rounded-tr-none'
                    : 'bg-purple-900/20 border-purple-500/20 text-gray-200 rounded-tl-none shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                }`}
              >
                {msg.isThinking ? (
                  <div className="flex items-center gap-2 text-purple-300 text-sm animate-pulse">
                    <Sparkles className="w-4 h-4" />
                    <span>در حال تفکر عمیق و تحلیل استراتژیک...</span>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-purple max-w-none text-right leading-loose">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
              
              {/* Search Results (Grounding) */}
              {msg.groundingMetadata && msg.groundingMetadata.length > 0 && (
                 <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                    {msg.groundingMetadata.map((chunk: any, idx: number) => {
                      if (!chunk.web?.uri) return null;
                      return (
                        <a 
                          key={idx}
                          href={chunk.web.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg bg-blue-900/20 border border-blue-500/20 text-xs text-blue-300 hover:bg-blue-900/40 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{chunk.web.title || chunk.web.uri}</span>
                        </a>
                      );
                    })}
                 </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 bg-black/60 backdrop-blur-lg border-t border-white/5">
        <div className="max-w-4xl mx-auto relative flex items-end gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 focus-within:border-purple-500/50 focus-within:bg-white/10 transition-all">
           <textarea
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={handleKeyDown}
             placeholder={mode === ChatMode.CONSULTANT ? "چالش کسب‌وکار خود را توضیح دهید..." : "سوال خود را درباره بازار یا رقبا بپرسید..."}
             className="w-full bg-transparent border-none text-gray-100 placeholder-gray-500 resize-none focus:ring-0 max-h-32 min-h-[24px] overflow-y-auto"
             rows={1}
             style={{ height: 'auto', minHeight: '24px' }}
             onInput={(e) => {
               const target = e.target as HTMLTextAreaElement;
               target.style.height = 'auto';
               target.style.height = `${target.scrollHeight}px`;
             }}
           />
           <button
             onClick={handleSend}
             disabled={!input.trim() || isLoading}
             className="p-3 rounded-xl bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_10px_rgba(168,85,247,0.4)] flex-shrink-0"
             title={!isLoggedIn ? 'برای ارسال پیام ابتدا وارد شوید' : ''}
           >
             {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <Send className="w-5 h-5 rtl:rotate-180" />
             )}
           </button>
        </div>
        <p className="text-center text-xs text-gray-600 mt-2">
          بیزنس‌متر ممکن است اشتباه کند. لطفاً اطلاعات مهم را بررسی کنید.
        </p>
      </div>

      </div>
    </>
  );
};

export default ChatInterface;