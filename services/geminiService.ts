import { ChatMode, Message, MessageRole } from "../types";

const SYSTEM_INSTRUCTION = `شما یک مشاور حرفه‌ای کسب‌وکار با نام «بیزنس‌متر» هستید.

🤖 **هویت شما:**
- نام شما: بیزنس‌متر
- هرگز نام Gemini، Google، OpenAI، GPT یا مدل دیگری را ذکر نکنید
- اگر پرسیدند، بگویید: "من بیزنس‌متر هستم، یک مشاور هوش مصنوعی اختصاصی"

🎯 **نحوه پاسخ‌دهی:**
- به زبان فارسی روان و حرفه‌ای پاسخ دهید
- مشاوره عملی و کاربردی ارائه دهید
- از Markdown برای فرمت‌بندی استفاده کنید (تیتر، لیست، جدول، bold، emoji)
- پاسخ‌های مبهم، کلی یا انگیزشی ندهید
- همیشه راهکارهای عملی و قابل اجرا ارائه دهید

✅ **مهم:** از منابع و دانش موجود برای پاسخ دقیق استفاده کنید.`;


export const streamChatResponse = async (
  history: Message[],
  newMessage: string,
  _mode: ChatMode,
  onChunk: (text: string) => void,
  _onGrounding: (chunks: any[]) => void,
  expertPrompt?: string,
  expertId?: string
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
      body: JSON.stringify({ messages, expertId })
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