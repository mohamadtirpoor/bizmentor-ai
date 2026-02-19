import { db, learnedKnowledge, messages, chats } from './db';
import { eq, desc, sql, and, gte } from 'drizzle-orm';

/**
 * سرویس یادگیری هوش مصنوعی
 * این سرویس از مکالمات کاربران یاد می‌گیرد و دانش جدید را ذخیره می‌کند
 */

interface ConversationPair {
  question: string;
  answer: string;
  category?: string;
}

/**
 * استخراج سوال و جواب از یک مکالمه
 */
export async function extractLearningFromConversation(chatId: number): Promise<ConversationPair[]> {
  try {
    if (!db) return [];

    // دریافت پیام‌های چت
    const chatMessages = await db.select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);

    const pairs: ConversationPair[] = [];

    // استخراج جفت سوال-جواب
    for (let i = 0; i < chatMessages.length - 1; i++) {
      const current = chatMessages[i];
      const next = chatMessages[i + 1];

      // اگر پیام فعلی از کاربر و پیام بعدی از مدل باشد
      if (current.role === 'user' && next.role === 'model') {
        // فیلتر کردن سوالات خیلی کوتاه یا بی‌معنی
        if (current.content.length > 10 && next.content.length > 20) {
          pairs.push({
            question: current.content,
            answer: next.content,
            category: await detectCategory(current.content),
          });
        }
      }
    }

    return pairs;
  } catch (error) {
    console.error('Error extracting learning:', error);
    return [];
  }
}

/**
 * تشخیص دسته‌بندی سوال
 */
async function detectCategory(question: string): Promise<string> {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('مالی') || lowerQuestion.includes('حسابداری') || lowerQuestion.includes('بودجه')) {
    return 'مالی';
  } else if (lowerQuestion.includes('مارکتینگ') || lowerQuestion.includes('بازاریابی') || lowerQuestion.includes('تبلیغات')) {
    return 'مارکتینگ';
  } else if (lowerQuestion.includes('فروش') || lowerQuestion.includes('مشتری')) {
    return 'فروش';
  } else if (lowerQuestion.includes('منابع انسانی') || lowerQuestion.includes('استخدام') || lowerQuestion.includes('کارمند')) {
    return 'منابع انسانی';
  } else if (lowerQuestion.includes('محصول') || lowerQuestion.includes('تولید')) {
    return 'مدیریت محصول';
  } else {
    return 'عمومی';
  }
}

/**
 * ذخیره دانش جدید در دیتابیس
 */
export async function saveLearnedKnowledge(pair: ConversationPair, sourceMessageId?: number): Promise<boolean> {
  try {
    if (!db) return false;

    // بررسی تکراری نبودن
    const existing = await db.select()
      .from(learnedKnowledge)
      .where(eq(learnedKnowledge.question, pair.question))
      .limit(1);

    if (existing.length > 0) {
      // اگر سوال تکراری است، امتیاز کیفیت را افزایش بده
      await db.update(learnedKnowledge)
        .set({ 
          qualityScore: sql`${learnedKnowledge.qualityScore} + 1`,
          updatedAt: new Date()
        })
        .where(eq(learnedKnowledge.id, existing[0].id));
      
      return true;
    }

    // ذخیره دانش جدید
    await db.insert(learnedKnowledge).values({
      question: pair.question,
      answer: pair.answer,
      category: pair.category,
      qualityScore: 1,
      usageCount: 0,
      sourceMessageId,
    });

    console.log('✅ New knowledge saved:', pair.category);
    return true;
  } catch (error) {
    console.error('Error saving knowledge:', error);
    return false;
  }
}

/**
 * دریافت دانش مرتبط برای یک سوال
 */
export async function getRelevantKnowledge(question: string, limit: number = 5): Promise<string> {
  try {
    if (!db) return '';

    const lowerQuestion = question.toLowerCase();
    const category = await detectCategory(question);

    // جستجوی دانش مرتبط بر اساس دسته‌بندی و کلمات کلیدی
    const relevantKnowledge = await db.select()
      .from(learnedKnowledge)
      .where(
        and(
          eq(learnedKnowledge.category, category),
          gte(learnedKnowledge.qualityScore, 1)
        )
      )
      .orderBy(desc(learnedKnowledge.qualityScore), desc(learnedKnowledge.usageCount))
      .limit(limit);

    if (relevantKnowledge.length === 0) {
      return '';
    }

    // افزایش شمارنده استفاده
    for (const knowledge of relevantKnowledge) {
      await db.update(learnedKnowledge)
        .set({ 
          usageCount: sql`${learnedKnowledge.usageCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(learnedKnowledge.id, knowledge.id));
    }

    // ساخت متن دانش برای اضافه کردن به context
    let knowledgeText = '\n\n📚 **دانش یادگیری شده از مکالمات قبلی:**\n\n';
    
    relevantKnowledge.forEach((k, index) => {
      knowledgeText += `${index + 1}. سوال: ${k.question}\n`;
      knowledgeText += `   پاسخ: ${k.answer}\n\n`;
    });

    return knowledgeText;
  } catch (error) {
    console.error('Error getting relevant knowledge:', error);
    return '';
  }
}

/**
 * پردازش خودکار مکالمات جدید برای یادگیری
 */
export async function processNewConversationsForLearning(): Promise<number> {
  try {
    if (!db) return 0;

    // دریافت چت‌های اخیر (24 ساعت گذشته)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentChats = await db.select()
      .from(chats)
      .where(gte(chats.updatedAt, oneDayAgo))
      .orderBy(desc(chats.updatedAt))
      .limit(50);

    let learnedCount = 0;

    for (const chat of recentChats) {
      const pairs = await extractLearningFromConversation(chat.id);
      
      for (const pair of pairs) {
        const saved = await saveLearnedKnowledge(pair);
        if (saved) learnedCount++;
      }
    }

    console.log(`🎓 Learned ${learnedCount} new knowledge items from recent conversations`);
    return learnedCount;
  } catch (error) {
    console.error('Error processing conversations:', error);
    return 0;
  }
}

/**
 * دریافت آمار یادگیری
 */
export async function getLearningStats() {
  try {
    if (!db) return null;

    const [totalKnowledge] = await db.select({ 
      count: sql<number>`count(*)::int` 
    }).from(learnedKnowledge);

    const [avgQuality] = await db.select({ 
      avg: sql<number>`avg(${learnedKnowledge.qualityScore})::int` 
    }).from(learnedKnowledge);

    const [totalUsage] = await db.select({ 
      sum: sql<number>`sum(${learnedKnowledge.usageCount})::int` 
    }).from(learnedKnowledge);

    const byCategory = await db.select({
      category: learnedKnowledge.category,
      count: sql<number>`count(*)::int`
    })
    .from(learnedKnowledge)
    .groupBy(learnedKnowledge.category);

    return {
      totalKnowledge: totalKnowledge.count || 0,
      averageQuality: avgQuality.avg || 0,
      totalUsage: totalUsage.sum || 0,
      byCategory: byCategory || [],
    };
  } catch (error) {
    console.error('Error getting learning stats:', error);
    return null;
  }
}
