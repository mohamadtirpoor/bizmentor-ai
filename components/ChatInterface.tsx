import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  User, 
  Bot, 
  Sparkles, 
  Star,
  ArrowUp
} from 'lucide-react';
import { ChatMode, Message, MessageRole } from '../types';
import { streamChatResponse } from '../services/geminiService';

interface ChatInterfaceProps {
  onNavigateToPricing?: () => void;
  darkMode?: boolean;
  isLoggedIn?: boolean;
  hasPremium?: boolean;
  onRequestAuth?: () => void;
  initialMessages?: Message[];
  onSaveChat?: (messages: Message[], title: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onNavigateToPricing, 
  darkMode = false,
  isLoggedIn = false,
  hasPremium = false,
  onRequestAuth,
  initialMessages,
  onSaveChat
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [mode] = useState<ChatMode>(ChatMode.CONSULTANT);
  const [isLoading, setIsLoading] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const handleInputFocus = () => {
    if (!isLoggedIn && onRequestAuth) {
      onRequestAuth();
      return;
    }
    if (!hasPremium) {
      setShowPricingModal(true);
    }
  };

  const handleSend = async () => {
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

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      role: MessageRole.MODEL,
      text: '',
      isThinking: true
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
        () => {}
      );
      
      // Save chat after response
      const finalMessages = [...newMessages, { id: botMsgId, role: MessageRole.MODEL, text: fullText }];
      const title = userMsg.text.slice(0, 30) + (userMsg.text.length > 30 ? '...' : '');
      if (onSaveChat) {
        onSaveChat(finalMessages, title);
      }
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

  return (
    <div className="flex flex-col h-full">
      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className={`rounded-2xl w-full max-w-md shadow-2xl ${
            darkMode ? 'bg-[#12121a] border border-purple-500/20' : 'bg-white'
          }`}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                اشتراک تهیه کنید
              </h3>
              <p className={`text-sm ${darkMode ? 'text-purple-300/60' : 'text-gray-500'}`}>
                برای استفاده از بیزنس‌متر، یکی از پلن‌ها را انتخاب کنید.
              </p>
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
                className={`w-full py-3 font-medium rounded-xl ${
                  darkMode ? 'bg-purple-500/10 text-purple-300' : 'bg-gray-100 text-gray-600'
                }`}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center p-6">
            <img src="/logo/Untitled-1.png" alt="بیزنس‌متر" className="w-16 h-16 rounded-2xl object-contain mb-6" />
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              سلام! من بیزنس‌متر هستم
            </h2>
            <p className={`text-center max-w-md mb-8 ${darkMode ? 'text-purple-300/60' : 'text-gray-500'}`}>
              مشاور هوشمند کسب‌وکار شما. آماده‌ام تا با تحلیل دقیق به رشد بیزینس شما کمک کنم.
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              <button 
                onClick={() => {
                  if (!isLoggedIn && onRequestAuth) {
                    onRequestAuth();
                  } else if (!hasPremium) {
                    setShowPricingModal(true);
                  } else {
                    setInput('چطور می‌تونم فروشم رو افزایش بدم؟');
                  }
                }}
                className={`p-4 border rounded-xl text-right transition-all ${
                  darkMode 
                    ? 'bg-[#12121a] border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/5' 
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>افزایش فروش</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-purple-400/50' : 'text-gray-400'}`}>راهکارهای عملی برای رشد فروش</p>
              </button>
              <button 
                onClick={() => {
                  if (!isLoggedIn && onRequestAuth) {
                    onRequestAuth();
                  } else if (!hasPremium) {
                    setShowPricingModal(true);
                  } else {
                    setInput('برای شروع یک استارتاپ چه کارهایی باید انجام بدم؟');
                  }
                }}
                className={`p-4 border rounded-xl text-right transition-all ${
                  darkMode 
                    ? 'bg-[#12121a] border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/5' 
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>شروع استارتاپ</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-purple-400/50' : 'text-gray-400'}`}>راهنمای گام به گام</p>
              </button>
              <button 
                onClick={() => {
                  if (!isLoggedIn && onRequestAuth) {
                    onRequestAuth();
                  } else if (!hasPremium) {
                    setShowPricingModal(true);
                  } else {
                    setInput('چطور بازاریابی دیجیتال انجام بدم؟');
                  }
                }}
                className={`p-4 border rounded-xl text-right transition-all ${
                  darkMode 
                    ? 'bg-[#12121a] border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/5' 
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>بازاریابی دیجیتال</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-purple-400/50' : 'text-gray-400'}`}>استراتژی‌های آنلاین</p>
              </button>
              <button 
                onClick={() => {
                  if (!isLoggedIn && onRequestAuth) {
                    onRequestAuth();
                  } else if (!hasPremium) {
                    setShowPricingModal(true);
                  } else {
                    setInput('چطور تیم خوب بسازم؟');
                  }
                }}
                className={`p-4 border rounded-xl text-right transition-all ${
                  darkMode 
                    ? 'bg-[#12121a] border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/5' 
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>مدیریت تیم</p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-purple-400/50' : 'text-gray-400'}`}>ساخت تیم موفق</p>
              </button>
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="max-w-3xl mx-auto p-4 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === MessageRole.USER 
                    ? darkMode ? 'bg-purple-500/20' : 'bg-gray-200'
                    : 'bg-gradient-to-br from-purple-500 to-purple-600'
                }`}>
                  {msg.role === MessageRole.USER 
                    ? <User className={`w-4 h-4 ${darkMode ? 'text-purple-300' : 'text-gray-600'}`} /> 
                    : <Bot className="w-4 h-4 text-white" />
                  }
                </div>

                {/* Message */}
                <div className={`flex-1 ${msg.role === MessageRole.USER ? 'text-left' : 'text-right'}`}>
                  <div className={`inline-block max-w-[90%] p-4 rounded-2xl ${
                    msg.role === MessageRole.USER
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-tr-none'
                      : darkMode 
                        ? 'bg-[#12121a] border border-purple-500/20 text-gray-200 rounded-tl-none'
                        : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'
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
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`p-4 ${darkMode ? 'bg-[#0a0a0f]' : 'bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto">
          <div 
            className={`flex items-end gap-3 p-4 rounded-2xl transition-all shadow-lg ${
              darkMode 
                ? 'bg-[#12121a] border border-purple-500/30 shadow-purple-500/5 focus-within:border-purple-500/50' 
                : 'bg-white border border-gray-200 shadow-gray-200/50 focus-within:border-purple-400 focus-within:shadow-purple-100'
            }`}
            onClick={() => {
              if (!isLoggedIn || !hasPremium) {
                handleInputFocus();
              }
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              placeholder="هر چیزی بپرسید..."
              className={`flex-1 bg-transparent border-none resize-none focus:ring-0 focus:outline-none min-h-[24px] max-h-32 text-right text-sm ${
                darkMode 
                  ? 'text-gray-200 placeholder-purple-400/40' 
                  : 'text-gray-700 placeholder-gray-400'
              }`}
              rows={1}
              dir="rtl"
              readOnly={!isLoggedIn || !hasPremium}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
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
          </div>
          
          {/* Footer */}
          <p className={`text-center text-xs mt-3 ${darkMode ? 'text-purple-400/40' : 'text-gray-400'}`}>
            بیزنس‌متر ممکن است خطا کند. اطلاعات مهم را بررسی کنید.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
