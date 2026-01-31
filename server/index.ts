import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { db, users, chats, messages } from './db';
import { eq, desc, count, sql } from 'drizzle-orm';
import { loadExpertKnowledge } from './knowledgeService';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files in production
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// ============ AI API CONFIG (Arvan Cloud) ============
const ARVAN_ENDPOINT = 'https://arvancloudai.ir/gateway/models/Qwen3-30B-A3B/MzngmyQ1gA1LhnhOwlLFW4xAv3F4mH_B-aDTOTJCiCyggiFk4qUOtP-TJ02Vao2geVMmoSTiu2EMHg8HqwJQNzMHr7abTuS3Xy6do9APpuIs-yXdqd_S-s597MXlaLDTiURmaY47xj--xPHdHBtLO3GLcTllV_IIvxS62f7mHyCpQzNQpL66GwbZrwRNyHepubqq9hOIRwNIfpKcUV6i-qZNdxyUROnUkZs7HFbQWuHg90CUsQQP5RZogWFCgE97/v1';
const ARVAN_API_KEY = 'b6a3781c-f36c-5631-939c-b3c1c0230d4b';

const openai = new OpenAI({
  baseURL: ARVAN_ENDPOINT,
  apiKey: ARVAN_API_KEY,
  timeout: 60000,
  maxRetries: 2,
  defaultHeaders: {
    'Authorization': `apikey ${ARVAN_API_KEY}`
  }
});

// ============ AI CHAT PROXY ============
app.post('/api/chat', async (req, res) => {
  try {
    const { messages: chatMessages, expertId } = req.body;
    
    console.log('📨 Received chat request');
    console.log('Messages count:', chatMessages?.length);
    console.log('Expert ID:', expertId);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Load expert knowledge if expertId is provided
    let enrichedMessages = [...chatMessages];
    if (expertId) {
      console.log(`📚 Loading knowledge for expert: ${expertId}`);
      const knowledge = await loadExpertKnowledge(expertId);
      if (knowledge) {
        console.log(`✅ Knowledge loaded: ${knowledge.length} characters`);
        // Add knowledge to system message
        const systemMsgIndex = enrichedMessages.findIndex(m => m.role === 'system');
        if (systemMsgIndex >= 0) {
          enrichedMessages[systemMsgIndex] = {
            ...enrichedMessages[systemMsgIndex],
            content: enrichedMessages[systemMsgIndex].content + '\n\n' + knowledge
          };
        }
      } else {
        console.log('⚠️ No knowledge found for this expert');
      }
    }

    console.log('🚀 Calling Arvan Cloud API...');
    
    const stream = await openai.chat.completions.create({
      model: 'Qwen3-30B-A3B',
      messages: enrichedMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 3000,
    });

    console.log('✅ Stream created successfully');
    
    let chunkCount = 0;
    let buffer = '';
    let insideThinkTag = false;
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        buffer += content;
        
        // Process buffer to filter out <think> tags
        while (true) {
          if (!insideThinkTag) {
            // Check if <think> tag starts
            const thinkStart = buffer.indexOf('<think>');
            if (thinkStart !== -1) {
              // Send everything before <think>
              if (thinkStart > 0) {
                const beforeThink = buffer.substring(0, thinkStart);
                chunkCount++;
                res.write(`data: ${JSON.stringify({ content: beforeThink })}\n\n`);
              }
              // Remove everything up to and including <think>
              buffer = buffer.substring(thinkStart + 7);
              insideThinkTag = true;
            } else {
              // No <think> tag, send buffer if it's substantial
              if (buffer.length > 50 || buffer.includes('\n')) {
                chunkCount++;
                res.write(`data: ${JSON.stringify({ content: buffer })}\n\n`);
                buffer = '';
              }
              break;
            }
          } else {
            // Inside <think> tag, look for </think>
            const thinkEnd = buffer.indexOf('</think>');
            if (thinkEnd !== -1) {
              // Remove everything up to and including </think>
              buffer = buffer.substring(thinkEnd + 8);
              insideThinkTag = false;
            } else {
              // Still inside think tag, clear buffer and wait for more
              buffer = '';
              break;
            }
          }
        }
      }
    }
    
    // Send any remaining buffer (if not inside think tag)
    if (buffer.trim() && !insideThinkTag) {
      chunkCount++;
      res.write(`data: ${JSON.stringify({ content: buffer })}\n\n`);
    }
    
    console.log(`✅ Stream completed. Sent ${chunkCount} chunks`);
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('❌ AI Chat error:', error);
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type
    });
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
