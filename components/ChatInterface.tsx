import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Sparkles, Star, ArrowUp, MoreHorizontal, Package, Megaphone, PenTool, Users, X, TrendingUp } from 'lucide-react';
import { ChatMode, Message, MessageRole } from '../types';
import { streamChatResponse } from '../services/geminiService';

interface ExpertMode {
  id: string;
  name: string;
  iconName: string;
  color: string;
  description: string;
  systemPrompt: string;
}

const EXPERT_MODES: ExpertMode[] = [
  { 
    id: 'product', 
    name: 'مدیر محصول', 
    iconName: 'package', 
    color: 'text-blue-400', 
    description: 'مشاوره تخصصی مدیریت محصول', 
    systemPrompt: 'شما یک مدیر محصول ارشد با ۱۵ سال تجربه هستید. تخصص شما در تعریف فیچرها، PRD، تحلیل رقبا، Roadmap، متریک‌های محصول و MVP است.' 
  },
  { 
    id: 'marketing', 
    name: 'مدیر مارکتینگ', 
    iconName: 'megaphone', 
    color: 'text-green-400', 
    description: 'استراتژی بازاریابی و برندینگ', 
    systemPrompt: 'شما یک مدیر مارکتینگ ارشد با ۱۵ سال تجربه هستید. تخصص شما در بازاریابی دیجیتال، برندینگ، SEO، محتوا و Growth Hacking است.' 
  },
  { 
    id: 'sales', 
    name: 'مدیر فروش', 
    iconName: 'trending', 
    color: 'text-purple-400', 
    description: 'استراتژی فروش', 
    systemPrompt: 'شما یک مدیر فروش ارشد با ۱۵ سال تجربه هستید. تخصص شما در قیف فروش، مذاکره و افزایش درآمد است.' 
  },
  { 
    id: 'copywriting', 
    name: 'مدیر کمپین‌نویسی', 
    iconName: 'pen', 
    color: 'text-orange-400', 
    description: 'نوشتن متن تبلیغاتی', 
    systemPrompt: 'شما یک کپی‌رایتر ارشد با ۱۵ سال تجربه هستید. تخصص شما در هدلاین، کپی‌رایتینگ، کمپین تبلیغاتی و CTA است.' 
  },
  { 
    id: 'hr', 
    name: 'مدیر HR', 
    iconName: 'users', 
    color: 'text-pink-400', 
    description: 'مدیریت منابع انسانی', 
    systemPrompt: 'شما یک مدیر HR ارشد با ۱۵ سال تجربه هستید. تخصص شما در جذب، استخدام، ارزیابی عملکرد و فرهنگ سازمانی است.' 
  }
];

function ExpertIcon({ iconName, className }: { iconName: string; className?: string }) {
  switch (iconName) {
    case 'package': return <Package className={className} />;
    case 'megaphone': return <Megaphone className={className} />;
    case 'trending': return <TrendingUp className={className} />;
    case 'pen': return <PenTool className={className} />;
    case 'users': return <Users className={className} />;
    default: return <Package className={className} />;
  }
}

interface ChatInterfaceProps {
  onNavigateToPricing?: () => void;
  darkMode?: boolean;
  isLoggedIn?: boolean;
  hasPremium?: boolean;
  onRequestAuth?: () => void;
  initialMessages?: Message[];
  onSaveChat?: (messages: Message[], title: string) => void;
}

function ChatInterface({ 
  onNavigateToPricing, 
  darkMode = false, 
  isLoggedIn = false, 
  hasPremium = false, 
  onRequestAuth, 
  initialMessages, 
  onSaveChat 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [mode] = useState<ChatMode>(ChatMode.CONSULTANT);
  const [isLoading, setIsLoading] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showExpertMenu, setShowExpertMenu] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<ExpertMode | null>(null);
  const [messageExperts, setMessageExperts] = useState<Record<string, ExpertMode | null>>({});
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  function handleScroll() {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 150);
  }

  function handleInputFocus() {
    if (!isLoggedIn && onRequestAuth) {
      onRequestAuth();
      return;
    }
    if (!hasPremium) {
      setShowPricingModal(true);
    }
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    if (!isLoggedIn && onRequestAuth) {
      onRequestAuth();
      return;
    }
    if (!hasPremium) {
      setShowPricingModal(true);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: input
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setAutoScroll(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: botMsgId, role: MessageRole.MODEL, text: '', isThinking: true }]);
    setMessageExperts(prev => ({ ...prev, [botMsgId]: selectedExpert }));

    try {
      let fullText = '';
      await streamChatResponse(
        messages,
        userMsg.text,
        mode,
        (chunk) => {
          fullText += chunk;
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullText, isThinking: false } : m));
        },
        () => {},
        selectedExpert?.systemPrompt
      );
      
      const finalMessages = [...newMessages, { id: botMsgId, role: MessageRole.MODEL, text: fullText }];
      if (onSaveChat) {
        onSaveChat(finalMessages, userMsg.text.slice(0, 30) + (userMsg.text.length > 30 ? '...' : ''));
      }
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleTextareaInput(e: React.FormEvent<HTMLTextAreaElement>) {
    const target = e.target as HTMLTextAreaElement;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
  }

  return (
    <div className="flex flex-col h-full relative">
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-md shadow-2xl ${darkMode ? 'bg-[#12121a] border border-purple-500/20' : 'bg-white'}`}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>اشتراک تهیه کنید</h3>
              <p className={`text-sm ${darkMode ? 'text-purple-300/60' : 'text-gray-500'}`}>برای استفاده از بیزنس‌متر، یکی از پلن‌ها را انتخاب کنید.</p>
            </div>
            <div className={`p-6 border-t space-y-3 ${darkMode ? 'border-purple-500/20' : 'border-gray-100'}`}>
              <button
                onClick={() => {
                  setShowPricingModal(false);
                  if (onNavigateToPricing) onNavigateToPricing();
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-xl"
              >
                مشاهده پلن‌ها
              </button>
              <button
                onClick={() => setShowPricingModal(false)}
                className={`w-full py-3 font-medium rounded-xl ${darkMode ? 'bg-purple-500/10 text-purple-300' : 'bg-gray-100 text-gray-600'}`}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto pb-48">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-6">
            <img src="/logo/Untitled-1.png" alt="بیزنس‌متر" className="w-16 h-16 rounded-2xl object-contain mb-6" />
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>سلام! من بیزنس‌متر هستم - نسخه جدید</h2>
            <p className={`text-center max-w-md mb-8 ${darkMode ? 'text-purple-300/60' : 'text-gray-500'}`}>
              مشاور هوشمند کسب‌وکار شما. آماده‌ام تا با تحلیل دقیق به رشد بیزینس شما کمک کنم.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {[
                { title: 'افزایش فروش', desc: 'راهکارهای عملی', query: 'چطور می‌تونم فروشم رو افزایش بدم؟' },
                { title: 'شروع استارتاپ', desc: 'راهنمای گام به گام', query: 'برای شروع استارتاپ چه کنم؟' },
                { title: 'بازاریابی دیجیتال', desc: 'استراتژی آنلاین', query: 'چطور بازاریابی دیجیتال انجام بدم؟' },
                { title: 'مدیریت تیم', desc: 'ساخت تیم موفق', query: 'چطور تیم خوب بسازم؟' }
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (!isLoggedIn && onRequestAuth) {
                      onRequestAuth();
                    } else if (!hasPremium) {
                      setShowPricingModal(true);
                    } else {
                      setInput(item.query);
                    }
                  }}
                  className={`p-4 border rounded-xl text-right transition-all ${
                    darkMode
                      ? 'bg-[#12121a] border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/5'
                      : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{item.title}</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-purple-400/50' : 'text-gray-400'}`}>{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-4 space-y-6">
            {messages.map((msg) => {
              const expert = messageExperts[msg.id];
              return (
              <div key={msg.id} className={`flex gap-3 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === MessageRole.USER
                    ? (darkMode ? 'bg-purple-500/20' : 'bg-gray-200')
                    : expert 
                      ? (darkMode ? 'bg-purple-500/20' : 'bg-gray-100')
                      : 'bg-gradient-to-br from-purple-500 to-purple-600'
                }`}>
                  {msg.role === MessageRole.USER ? (
                    <User className={`w-4 h-4 ${darkMode ? 'text-purple-300' : 'text-gray-600'}`} />
                  ) : expert ? (
                    <ExpertIcon iconName={expert.iconName} className={`w-4 h-4 ${expert.color}`} />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`flex-1 ${msg.role === MessageRole.USER ? 'text-left' : 'text-right'}`}>
                  {msg.role === MessageRole.MODEL && expert && (
                    <div className={`inline-flex items-center gap-1.5 mb-1 px-2 py-0.5 rounded-full text-xs ${
                      darkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'
                    }`}>
                      <ExpertIcon iconName={expert.iconName} className={`w-3 h-3 ${expert.color}`} />
                      {expert.name}
                    </div>
                  )}
                  <div className={`inline-block max-w-[90%] p-4 rounded-2xl ${
                    msg.role === MessageRole.USER
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-tr-none'
                      : (darkMode
                          ? 'bg-[#12121a] border border-purple-500/20 text-gray-200 rounded-tl-none'
                          : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none')
                  }`}>
                    {msg.isThinking ? (
                      <div className={`flex items-center gap-2 ${darkMode ? 'text-purple-400' : 'text-gray-400'}`}>
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span className="text-sm">در حال تحلیل...</span>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none text-right leading-relaxed">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )})}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="max-w-3xl mx-auto">
          {/* Expert Buttons - Horizontal Scrollable */}
          <div className="mb-3 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2" style={{ direction: 'rtl' }}>
              {EXPERT_MODES.map((expert) => (
                <button
                  key={expert.id}
                  onClick={() => setSelectedExpert(selectedExpert?.id === expert.id ? null : expert)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedExpert?.id === expert.id
                      ? (darkMode 
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                          : 'bg-purple-600 text-white shadow-lg shadow-purple-500/30')
                      : (darkMode 
                          ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30' 
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200')
                  }`}
                >
                  <ExpertIcon iconName={expert.iconName} className={`w-4 h-4 ${selectedExpert?.id === expert.id ? 'text-white' : expert.color}`} />
                  <span>{expert.name}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedExpert && (
            <div className={`flex items-center justify-between mb-2 px-4 py-2 rounded-2xl ${
              darkMode ? 'bg-purple-500/20 border border-purple-500/30' : 'bg-purple-100 border border-purple-200'
            }`}>
              <div className="flex items-center gap-2">
                <ExpertIcon iconName={selectedExpert.iconName} className={`w-4 h-4 ${selectedExpert.color}`} />
                <span className={`text-sm font-medium ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                  {selectedExpert.name}
                </span>
                <span className={`text-xs ${darkMode ? 'text-purple-400/60' : 'text-purple-500'}`}>
                  - {selectedExpert.description}
                </span>
              </div>
              <button
                onClick={() => setSelectedExpert(null)}
                className={`p-1 rounded-lg ${darkMode ? 'hover:bg-purple-500/30 text-purple-400' : 'hover:bg-purple-200 text-purple-600'}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className={`relative flex items-end gap-3 p-4 rounded-3xl backdrop-blur-xl border ${
            darkMode
              ? 'bg-white/5 border-purple-500/30 shadow-[0_8px_32px_rgba(139,92,246,0.2)]'
              : 'bg-white/80 border-gray-200 shadow-[0_8px_32px_rgba(0,0,0,0.1)]'
          }`}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onInput={handleTextareaInput}
              placeholder="هر چیزی بپرسید..."
              rows={1}
              dir="rtl"
              readOnly={!isLoggedIn || !hasPremium}
              className={`flex-1 bg-transparent border-none resize-none focus:ring-0 focus:outline-none min-h-[24px] max-h-32 text-right text-sm ${
                darkMode ? 'text-gray-200 placeholder-purple-400/40' : 'text-gray-700 placeholder-gray-400'
              }`}
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !isLoggedIn || !hasPremium}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:opacity-90'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <p className={`text-center text-xs mt-3 ${darkMode ? 'text-purple-400/40' : 'text-gray-400'}`}>
            بیزنس‌متر ممکن است خطا کند. اطلاعات مهم را بررسی کنید.
          </p>
        </div>
      </div>

      {showExpertMenu && <div className="fixed inset-0 z-40" onClick={() => setShowExpertMenu(false)} />}
    </div>
  );
}

export default ChatInterface;
