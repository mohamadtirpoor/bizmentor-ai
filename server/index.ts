import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { db, users, chats, messages } from './db';
import { eq, desc, count, sql } from 'drizzle-orm';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ============ AI API CONFIG ============
const openai = new OpenAI({
  baseURL: 'https://ai.liara.ir/api/694a3eadb933cecf2a4523fe/v1',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiI2OTRhM2ZhOGQ4MjlhMzE3YzJjOWJmN2UiLCJ0eXBlIjoiYWlfa2V5IiwiaWF0IjoxNzY2NDczNjQwfQ.BBeyIBbRiB2O80WPpCo64tG157iC5wpBLO30uVqN32o',
});

// ============ AI CHAT PROXY ============
app.post('/api/chat', async (req, res) => {
  try {
    const { messages: chatMessages } = req.body;
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await openai.chat.completions.create({
      model: 'openai/gpt-5-nano',
      messages: chatMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('AI Chat error:', error);
    res.status(500).json({ error: error?.message || 'خطا در ارتباط با AI' });
  }
});

// ============ USER ROUTES ============

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'کاربر با این ایمیل قبلاً ثبت‌نام کرده است' });
    }

    const [newUser] = await db.insert(users).values({
      name,
      email,
      password, // In production, hash this!
    }).returning();

    res.json({ 
      id: newUser.id,
      name: newUser.name, 
      email: newUser.email,
      hasPremium: newUser.hasPremium,
      freeMessagesUsed: newUser.freeMessagesUsed
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'خطا در ثبت‌نام' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است' });
    }

    res.json({ 
      id: user.id,
      name: user.name, 
      email: user.email,
      hasPremium: user.hasPremium,
      freeMessagesUsed: user.freeMessagesUsed
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'خطا در ورود' });
  }
});

// Update user premium status
app.patch('/api/users/:id/premium', async (req, res) => {
  try {
    const { id } = req.params;
    const { hasPremium } = req.body;

    const [updated] = await db.update(users)
      .set({ hasPremium, updatedAt: new Date() })
      .where(eq(users.id, parseInt(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Update premium error:', error);
    res.status(500).json({ error: 'خطا در بروزرسانی' });
  }
});

// Increment free messages used
app.patch('/api/users/:id/increment-messages', async (req, res) => {
  try {
    const { id } = req.params;

    const [updated] = await db.update(users)
      .set({ 
        freeMessagesUsed: sql`${users.freeMessagesUsed} + 1`,
        updatedAt: new Date() 
      })
      .where(eq(users.id, parseInt(id)))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Increment messages error:', error);
    res.status(500).json({ error: 'خطا در بروزرسانی' });
  }
});

// ============ CHAT ROUTES ============

// Create new chat
app.post('/api/chats', async (req, res) => {
  try {
    const { userId, title, mode } = req.body;

    const [newChat] = await db.insert(chats).values({
      userId,
      title,
      mode,
    }).returning();

    res.json(newChat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'خطا در ایجاد چت' });
  }
});

// Get user's chats
app.get('/api/chats/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const userChats = await db.select()
      .from(chats)
      .where(eq(chats.userId, parseInt(userId)))
      .orderBy(desc(chats.updatedAt));

    res.json(userChats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'خطا در دریافت چت‌ها' });
  }
});

// Get chat with messages
app.get('/api/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;

    const [chat] = await db.select().from(chats).where(eq(chats.id, parseInt(chatId)));
    const chatMessages = await db.select()
      .from(messages)
      .where(eq(messages.chatId, parseInt(chatId)))
      .orderBy(messages.createdAt);

    res.json({ ...chat, messages: chatMessages });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'خطا در دریافت چت' });
  }
});

// ============ MESSAGE ROUTES ============

// Add message to chat
app.post('/api/messages', async (req, res) => {
  try {
    const { chatId, role, content, metadata } = req.body;

    const [newMessage] = await db.insert(messages).values({
      chatId,
      role,
      content,
      metadata,
    }).returning();

    // Update chat's updatedAt
    await db.update(chats)
      .set({ updatedAt: new Date() })
      .where(eq(chats.id, chatId));

    res.json(newMessage);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'خطا در ذخیره پیام' });
  }
});

// ============ ADMIN ROUTES ============

// Get all users (admin)
app.get('/api/admin/users', async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      hasPremium: users.hasPremium,
      freeMessagesUsed: users.freeMessagesUsed,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt));

    res.json(allUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'خطا در دریافت کاربران' });
  }
});

// Get all chats with user info (admin)
app.get('/api/admin/chats', async (req, res) => {
  try {
    const allChats = await db.select({
      id: chats.id,
      title: chats.title,
      mode: chats.mode,
      createdAt: chats.createdAt,
      updatedAt: chats.updatedAt,
      userId: chats.userId,
      userName: users.name,
      userEmail: users.email,
    })
    .from(chats)
    .leftJoin(users, eq(chats.userId, users.id))
    .orderBy(desc(chats.updatedAt));

    res.json(allChats);
  } catch (error) {
    console.error('Get all chats error:', error);
    res.status(500).json({ error: 'خطا در دریافت چت‌ها' });
  }
});

// Get chat messages (admin)
app.get('/api/admin/chats/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;

    const chatMessages = await db.select()
      .from(messages)
      .where(eq(messages.chatId, parseInt(chatId)))
      .orderBy(messages.createdAt);

    res.json(chatMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'خطا در دریافت پیام‌ها' });
  }
});

// Get dashboard stats (admin)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [chatCount] = await db.select({ count: count() }).from(chats);
    const [messageCount] = await db.select({ count: count() }).from(messages);
    const [premiumCount] = await db.select({ count: count() }).from(users).where(eq(users.hasPremium, true));

    res.json({
      totalUsers: userCount.count,
      totalChats: chatCount.count,
      totalMessages: messageCount.count,
      premiumUsers: premiumCount.count,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار' });
  }
});

// Delete user (admin)
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete user's messages first
    const userChats = await db.select({ id: chats.id }).from(chats).where(eq(chats.userId, parseInt(id)));
    for (const chat of userChats) {
      await db.delete(messages).where(eq(messages.chatId, chat.id));
    }
    
    // Delete user's chats
    await db.delete(chats).where(eq(chats.userId, parseInt(id)));
    
    // Delete user
    await db.delete(users).where(eq(users.id, parseInt(id)));

    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'خطا در حذف کاربر' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
