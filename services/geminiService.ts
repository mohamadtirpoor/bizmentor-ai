import { ChatMode, Message, MessageRole } from "../types";

const SYSTEM_INSTRUCTION = `شما یک مشاور حرفه‌ای کسب‌وکار با نام «بیزنس‌متر» هستید.

🤖 **هویت شما:**
- نام شما: بیزنس‌متر (BusinessMeter)
- هرگز نام Gemini، Google, OpenAI، GPT یا مدل دیگری را ذکر نکنید
- اگر پرسیدند، بگویید: "من بیزنس‌متر هستم، یک مشاور هوش مصنوعی اختصاصی"

🎯 **نحوه پاسخ‌دهی:**
- مستقیم و حرفه‌ای به سوال کاربر پاسخ دهید
- از تعریف و تمجید اضافی در شروع پاسخ خودداری کنید
- محتوای کاربردی و عملی ارائه دهید
- از Markdown برای فرمت‌بندی استفاده کنید
- از emoji های مناسب استفاده کنید: 🎯 💡 🚀 ⭐ 💪

🌐 **پشتیبانی چند زبانه:**
- به زبان سوال کاربر پاسخ دهید (فارسی یا انگلیسی)
- زبان‌ها را با هم مخلوط نکنید

📋 **ساختار پاسخ:**
1. پاسخ مستقیم به سوال
2. توضیحات و جزئیات
3. راهکارهای عملی (در صورت نیاز)

**مهم:** پاسخ‌های کوتاه، مفید و کاربردی ارائه دهید. از جملات اضافی و مقدمه‌چینی خودداری کنید.`;


export const streamChatResponse = async (
  history: Message[],
  newMessage: string,
  _mode: ChatMode,
  onChunk: (text: string) => void,
  _onGrounding: (chunks: any[]) => void,
  expertPrompt?: string,
  expertId?: string,
  enableDeepSearch?: boolean,
  modelId?: string,
  chatId?: string
) => {
  const systemContent = expertPrompt 
    ? `${expertPrompt}\n\nهمچنین این قوانین کلی را رعایت کن:\n${SYSTEM_INSTRUCTION}`
    : SYSTEM_INSTRUCTION;

  const messages: any[] = [
    { role: 'system', content: systemContent }
  ];

  history
    .filter(m => m.role !== MessageRole.SYSTEM)
    .forEach(m => {
      messages.push({
        role: m.role === MessageRole.USER ? 'user' : 'assistant',
        content: m.text
      });
    });

  messages.push({ role: 'user', content: newMessage });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        messages, 
        expertId,
        userQuestion: newMessage,
        enableDeepSearch: enableDeepSearch || false,
        modelId: modelId || 'mark-zuckerberg',
        chatId: chatId || null
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No reader');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              onChunk(parsed.content);
            }
          } catch {}
        }
      }
    }
  } catch (error: any) {
    console.error("Error in chat stream:", error);
    onChunk(`\n\n*خطایی رخ داده: ${error?.message}*`);
  }
};

export const getLiveClient = () => null;