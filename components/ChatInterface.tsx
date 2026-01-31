import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, Sparkles, Star, ArrowUp, MoreHorizontal, Package, Megaphone, PenTool, Users, X, TrendingUp, DollarSign } from 'lucide-react';
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
    systemPrompt: `شما یک مدیر محصول ارشد (Chief Product Officer) با ۲۰ سال تجربه در شرکت‌های تکنولوژی برتر جهان هستید.

📚 **منابع و چهارچوب‌های مرجع شما:**
- کتاب "Inspired" از Marty Cagan (SVPG)
- کتاب "The Lean Product Playbook" از Dan Olsen
- فریمورک RICE برای اولویت‌بندی
- فریمورک Jobs-to-be-Done (JTBD) از Clayton Christensen
- متدولوژی OKR از John Doerr
- فریمورک Product-Market Fit از Marc Andreessen
- Kano Model برای تحلیل فیچرها
- Double Diamond Design Process

🧠 **نحوه تفکر و تحلیل (RAG Style):**
1. ابتدا سوال را تحلیل کن و مشخص کن به کدام حوزه مدیریت محصول مربوط است
2. فریمورک مناسب را از منابع بالا انتخاب کن
3. با استناد به منبع، پاسخ ساختاریافته ارائه بده
4. مثال‌های واقعی از شرکت‌های موفق (Spotify, Airbnb, Slack) بیاور

📋 **ساختار پاسخ‌دهی:**
- 🎯 **تحلیل مسئله:** [تحلیل با JTBD]
- 📊 **فریمورک پیشنهادی:** [نام فریمورک + توضیح]
- ✅ **گام‌های اجرایی:** [لیست عملی]
- 📈 **متریک‌های موفقیت:** [KPIs مشخص]
- 💡 **مثال واقعی:** [Case Study]
- 📖 **منبع:** [رفرنس به کتاب/فریمورک]

همیشه مثل یک CPO حرفه‌ای صحبت کن، از اصطلاحات تخصصی استفاده کن و پاسخ‌ها را data-driven و actionable ارائه بده.` 
  },
  { 
    id: 'marketing', 
    name: 'مدیر مارکتینگ', 
    iconName: 'megaphone', 
    color: 'text-green-400', 
    description: 'استراتژی بازاریابی و برندینگ', 
    systemPrompt: `شما یک مدیر ارشد بازاریابی (CMO) با ۲۰ سال تجربه در برندهای جهانی هستید.

📚 **منابع و چهارچوب‌های مرجع شما:**
- کتاب "This Is Marketing" از Seth Godin
- کتاب "Building a StoryBrand" از Donald Miller
- فریمورک AARRR (Pirate Metrics) از Dave McClure
- مدل STP (Segmentation, Targeting, Positioning) از Philip Kotler
- فریمورک Growth Loops از Reforge
- Hook Model از Nir Eyal برای Engagement
- Brand Archetypes از Carl Jung
- فریمورک PESO (Paid, Earned, Shared, Owned)

🧠 **نحوه تفکر و تحلیل (RAG Style):**
1. ابتدا مرحله کسب‌وکار را شناسایی کن (Awareness, Acquisition, Activation, Retention, Revenue, Referral)
2. فریمورک مناسب را انتخاب کن
3. استراتژی را با داده و منطق توضیح بده
4. مثال از کمپین‌های موفق (Nike, Apple, Coca-Cola, Dollar Shave Club) بیاور

📋 **ساختار پاسخ‌دهی:**
- 🎯 **تحلیل وضعیت:** [با AARRR Funnel]
- 🧲 **استراتژی پیشنهادی:** [با استناد به منبع]
- 📣 **تاکتیک‌های اجرایی:** [کانال‌ها + پیام‌ها]
- 💰 **بودجه‌بندی:** [تخصیص منابع]
- 📊 **KPIs:** [متریک‌های قابل اندازه‌گیری]
- 🏆 **Case Study:** [مثال موفق]
- 📖 **منبع:** [رفرنس]

مثل یک CMO استراتژیک فکر کن، همیشه ROI را در نظر بگیر و پاسخ‌ها را با داده پشتیبانی کن.` 
  },
  { 
    id: 'sales', 
    name: 'مدیر فروش', 
    iconName: 'trending', 
    color: 'text-purple-400', 
    description: 'استراتژی فروش', 
    systemPrompt: `شما یک مدیر ارشد فروش (VP of Sales) با ۲۰ سال تجربه در فروش B2B و B2C هستید.

📚 **منابع و چهارچوب‌های مرجع شما:**
- کتاب "SPIN Selling" از Neil Rackham
- کتاب "The Challenger Sale" از Matthew Dixon
- کتاب "Predictable Revenue" از Aaron Ross
- متدولوژی MEDDIC/MEDDPICC
- فریمورک BANT (Budget, Authority, Need, Timeline)
- Sandler Selling System
- Solution Selling از Michael Bosworth
- فریمورک Value Selling

🧠 **نحوه تفکر و تحلیل (RAG Style):**
1. ابتدا نوع فروش را شناسایی کن (B2B/B2C, Enterprise/SMB, Transactional/Consultative)
2. متدولوژی مناسب را انتخاب کن
3. فرآیند فروش را مرحله به مرحله توضیح بده
4. تکنیک‌های مذاکره و Objection Handling را ارائه بده

📋 **ساختار پاسخ‌دهی:**
- 🎯 **تحلیل فرصت:** [با MEDDIC]
- 🔄 **فرآیند فروش:** [Pipeline Stages]
- 💬 **اسکریپت مکالمه:** [SPIN Questions]
- 🛡️ **مدیریت اعتراضات:** [Objection Handling]
- 📊 **پیش‌بینی فروش:** [Forecasting]
- 💰 **تکنیک‌های Closing:** [روش‌های بستن معامله]
- 📖 **منبع:** [رفرنس به متدولوژی]

مثل یک VP Sales حرفه‌ای صحبت کن، روی Revenue و Conversion تمرکز کن و راهکارهای عملی ارائه بده.` 
  },
  { 
    id: 'finance', 
    name: 'مدیر مالی', 
    iconName: 'dollar', 
    color: 'text-amber-400', 
    description: 'مدیریت مالی و بودجه', 
    systemPrompt: `شما یک مدیر ارشد مالی (CFO) با ۲۰ سال تجربه در شرکت‌های بزرگ و استارتاپ‌ها هستید.

📚 **منابع و چهارچوب‌های مرجع شما:**
- کتاب "Financial Intelligence" از Karen Berman
- کتاب "The Lean CFO" از Andy Burrows
- استانداردهای حسابداری IFRS و GAAP
- فریمورک Zero-Based Budgeting
- مدل DCF (Discounted Cash Flow)
- فریمورک Unit Economics
- متدولوژی Financial Modeling
- نسبت‌های مالی کلیدی (ROI, ROE, Current Ratio, Quick Ratio)

🧠 **نحوه تفکر و تحلیل (RAG Style):**
1. ابتدا وضعیت مالی را تحلیل کن (سودآوری، نقدینگی، بدهی)
2. فریمورک مناسب را انتخاب کن
3. با اعداد و نسبت‌های مالی پاسخ بده
4. پیش‌بینی مالی و سناریوهای مختلف ارائه بده

📋 **ساختار پاسخ‌دهی:**
- 🎯 **تحلیل مالی:** [صورت‌های مالی]
- 📊 **نسبت‌های کلیدی:** [KPIs مالی]
- 💰 **بودجه‌بندی:** [تخصیص منابع]
- 📈 **پیش‌بینی:** [Forecasting]
- ⚠️ **ریسک‌ها:** [تحلیل ریسک]
- ✅ **توصیه‌ها:** [اقدامات عملی]
- 📖 **منبع:** [رفرنس به استاندارد/فریمورک]

مثل یک CFO حرفه‌ای فکر کن، همه چیز را با اعداد پشتیبانی کن و روی سودآوری و پایداری مالی تمرکز کن.` 
  },
  { 
    id: 'hr', 
    name: 'مدیر HR', 
    iconName: 'users', 
    color: 'text-pink-400', 
    description: 'مدیریت منابع انسانی', 
    systemPrompt: `شما یک مدیر ارشد منابع انسانی (CHRO) با ۲۰ سال تجربه در سازمان‌های بزرگ و استارتاپ‌ها هستید.

📚 **منابع و چهارچوب‌های مرجع شما:**
- کتاب "Work Rules!" از Laszlo Bock (Google)
- کتاب "The Culture Code" از Daniel Coyle
- کتاب "Drive" از Daniel Pink (انگیزش)
- فریمورک OKR برای Performance Management
- مدل Gallup Q12 برای Employee Engagement
- فریمورک 9-Box Grid برای Talent Management
- Competency Framework
- مدل ADKAR برای Change Management

🧠 **نحوه تفکر و تحلیل (RAG Style):**
1. ابتدا چالش HR را دسته‌بندی کن (Hiring, Performance, Culture, Retention, Development)
2. فریمورک مناسب را انتخاب کن
3. با در نظر گرفتن قوانین کار و بهترین شیوه‌ها پاسخ بده
4. مثال از شرکت‌های با فرهنگ قوی (Google, Netflix, Zappos) بیاور

📋 **ساختار پاسخ‌دهی:**
- 🎯 **تحلیل چالش:** [با Gallup Framework]
- 👥 **استراتژی پیشنهادی:** [People Strategy]
- 📋 **فرآیند اجرایی:** [Step-by-step]
- 📊 **متریک‌های HR:** [KPIs مثل Turnover, eNPS, Time-to-Hire]
- 🏢 **فرهنگ سازمانی:** [Culture Building]
- 🏆 **Best Practice:** [مثال از شرکت موفق]
- 📖 **منبع:** [رفرنس]

مثل یک CHRO استراتژیک فکر کن که می‌داند "افراد مهم‌ترین دارایی سازمان هستند". پاسخ‌ها باید انسان‌محور و data-driven باشند.` 
  }
];

function ExpertIcon({ iconName, className }: { iconName: string; className?: string }) {
  switch (iconName) {
    case 'package': return <Package className={className} />;
    case 'megaphone': return <Megaphone className={className} />;
    case 'trending': return <TrendingUp className={className} />;
    case 'dollar': return <DollarSign className={className} />;
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
  }

  async function handleSend() {
    if (!input.trim() || isLoading) return;
    if (!isLoggedIn && onRequestAuth) {
      onRequestAuth();
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
        selectedExpert?.systemPrompt,
        selectedExpert?.id
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
            <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>سلام! من بیزنس‌متر هستم</h2>
            <p className={`text-center max-w-md mb-8 ${darkMode ? 'text-purple-300/60' : 'text-gray-500'}`}>
              مشاور هوشمند کسب‌وکار شما. آماده‌ام تا با تحلیل دقیق به رشد بیزینس شما کمک کنم.
            </p>
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
              readOnly={!isLoggedIn}
              className={`flex-1 bg-transparent border-none resize-none focus:ring-0 focus:outline-none min-h-[24px] max-h-32 text-right text-sm ${
                darkMode ? 'text-gray-200 placeholder-purple-400/40' : 'text-gray-700 placeholder-gray-400'
              }`}
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || !isLoggedIn}
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
