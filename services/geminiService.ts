import OpenAI from 'openai';
import { ChatMode, Message, MessageRole } from "../types";

const SYSTEM_INSTRUCTION = `شما یک چت‌بات حرفه‌ای مشاوره کسب‌وکار هستید با نام «بیزنس‌متر».
شما باید همیشه به زبان فارسی روان، رسمی اما صمیمی پاسخ دهید.

🎓 نقش شما چیست؟
شما نقش مشاور ارشد کسب‌وکار را دارید که وظیفه‌اش ارائهٔ مشاوره عملی، مرحله‌به‌مرحله و کاربردی است.
شما هیچ‌وقت پاسخ کلی، مبهم، انگیزشی یا غیرعملی نمی‌دهید.

🔍 توانایی‌های شما:
۱) تحلیل کسب‌وکار
شما می‌توانید بر اساس اطلاعاتی که کاربر وارد می‌کند تحلیل کنید: قیمت‌گذاری، فروش، استراتژی بازاریابی، هزینه‌ها، محصول، مدل درآمدی، رقبا، مخاطب هدف، سوشال مدیا، تیم و مدیریت، نرخ تبدیل، قیف فروش و عملکرد.
و نتیجه را به راهکارهای اجرایی تبدیل کنید.

۲) تولید راهکارهای عملی
هر پاسخ شما باید شامل بخش‌های زیر باشد:

🟣 قالب ثابت پاسخ‌ها:
🔍 تحلیل اولیه: (۲–۳ جمله درباره اینکه مشکل کاربر چیست)
🎯 علت‌ها / ریشه‌ها: (لیست علل)
🛠 راهکارهای اجرایی مرحله‌به‌مرحله: (قدم به قدم)
📊 KPI هایی که باید اندازه‌گیری شود: (شاخص‌ها)
📈 نتیجه و پیش‌بینی زمان: (توضیح نتیجه و زمان)

۳) سوال پرسیدن هوشمند
اگر داده‌های کاربر ناقص بود، فقط سوال‌های ضروری می‌پرسی.

۴) تولید برنامه و استراتژی
وقتی کاربر درخواست "برنامه" یا "استراتژی" کند، خروجی شما باید شامل برنامه زمانی دقیق باشد.

❌ محدودیت‌ها:
جواب مبهم نده. جواب انگیزشی کلیشه‌ای نده. «بستگی دارد» نگو. تکرار متن کاربر ممنوع. راهکار غیرواقعی نده.`;

// ============================================
// تنظیمات API - لیارا GPT-4o-mini
// ============================================
const API_CONFIG = {
  baseURL: 'https://ai.liara.ir/api/69357177dc577f85e72ed001/v1',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI2OTM1NzFhYmRjNTc3Zjg1ZTcyZWQwNDIiLCJ0eXBlIjoiYWlfa2V5IiwiaWF0IjoxNzY1MTEwMTg3fQ.QFXJ9YAk4-fV3QKXmpU4UZQWp9SE1QoN9JHkegGryO4',
  model: 'openai/gpt-4o-mini'
};
// ============================================

const openai = new OpenAI({
  baseURL: API_CONFIG.baseURL,
  apiKey: API_CONFIG.apiKey,
  dangerouslyAllowBrowser: true
});

export const streamChatResponse = async (
  history: Message[],
  newMessage: string,
  _mode: ChatMode,
  onChunk: (text: string) => void,
  _onGrounding: (chunks: any[]) => void
) => {
  
  // Check if API is configured
  if (API_CONFIG.apiKey === 'YOUR_API_KEY' || API_CONFIG.baseURL === 'YOUR_API_BASE_URL') {
    onChunk('⚠️ **API تنظیم نشده است**\n\nلطفاً فایل `services/geminiService.ts` را باز کنید و تنظیمات API را وارد کنید.');
    return;
  }

  // Format history for OpenAI API
  const messages: any[] = [
    {
      role: 'system',
      content: SYSTEM_INSTRUCTION
    }
  ];

  // Add conversation history
  history
    .filter(m => m.role !== MessageRole.SYSTEM)
    .forEach(m => {
      messages.push({
        role: m.role === MessageRole.USER ? 'user' : 'assistant',
        content: m.text
      });
    });

  // Add the new user message
  messages.push({
    role: 'user',
    content: newMessage
  });

  try {
    const stream = await openai.chat.completions.create({
      model: API_CONFIG.model,
      messages: messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        onChunk(content);
      }
    }
  } catch (error: any) {
    console.error("Error in chat stream:", error);
    const errorMessage = error?.message || 'خطای ناشناخته';
    onChunk(`\n\n*خطایی در ارتباط رخ داده است: ${errorMessage}*\n\nلطفاً دوباره تلاش کنید.`);
  }
};

export const getLiveClient = () => {
  console.warn('Live voice API is not available');
  return null;
};
