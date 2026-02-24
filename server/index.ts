import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { db, users, chats, messages, learnedKnowledge, conversationFeedback, tasks } from './db';
import { eq, desc, count, sql } from 'drizzle-orm';
import { loadExpertKnowledge } from './knowledgeService';
import { 
  getRelevantKnowledge, 
  saveLearnedKnowledge, 
  extractLearningFromConversation,
  processNewConversationsForLearning,
  getLearningStats 
} from './learningService';
import { searchWebSimple, formatSearchResults } from './searchService';
import { sendVerificationEmail, generateVerificationCode } from './emailService';
import { 
  extractTasks, 
  createTask, 
  getTasksForChat, 
  updateTaskStatus, 
  detectStatusUpdates, 
  buildTaskContext,
  TaskStatus 
} from './taskManager';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'disconnected'
  });
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    // Test query
    const result = await db.select().from(users).limit(1);
    
    res.json({ 
      success: true, 
      message: 'Database connected successfully',
      usersCount: result.length
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database error', 
      message: error.message,
      hint: 'Tables might not exist. Run migrations first.'
    });
  }
});

// Database initialization endpoint (admin only) - ADDS NEW TABLES ONLY
app.post('/api/db-add-tables', async (req, res) => {
  try {
    const { adminKey } = req.body;
    
    // Simple admin key check
    if (adminKey !== 'mohamad.tir1383') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const connectionString = process.env.DATABASE_URL || 'postgresql://root:jpMjfUFd8b2DlnaMkcSX6ctd@businessmeter:5432/postgres';
    const sqlClient = postgres(connectionString);
    
    // Check if tables exist and create only if they don't
    try {
      // Check if learned_knowledge exists
      const learnedKnowledgeExists = await sqlClient`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'learned_knowledge'
        )
      `;
      
      if (!learnedKnowledgeExists[0].exists) {
        await sqlClient`
          CREATE TABLE learned_knowledge (
            id SERIAL PRIMARY KEY,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            category TEXT,
            quality_score INTEGER DEFAULT 0,
            usage_count INTEGER DEFAULT 0,
            source_message_id INTEGER,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `;
        console.log('✅ learned_knowledge table created');
      } else {
        console.log('ℹ️ learned_knowledge table already exists');
      }
      
      // Check if conversation_feedback exists
      const feedbackExists = await sqlClient`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'conversation_feedback'
        )
      `;
      
      if (!feedbackExists[0].exists) {
        await sqlClient`
          CREATE TABLE conversation_feedback (
            id SERIAL PRIMARY KEY,
            chat_id INTEGER REFERENCES chats(id),
            message_id INTEGER REFERENCES messages(id),
            is_helpful BOOLEAN,
            feedback_text TEXT,
            created_at TIMESTAMP DEFAULT NOW()
          )
        `;
        console.log('✅ conversation_feedback table created');
      } else {
        console.log('ℹ️ conversation_feedback table already exists');
      }
      
      // Check if tasks exists
      const tasksExists = await sqlClient`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'tasks'
        )
      `;
      
      if (!tasksExists[0].exists) {
        await sqlClient`
          CREATE TABLE tasks (
            id SERIAL PRIMARY KEY,
            chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
            description TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            metadata JSONB,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            completed_at TIMESTAMP
          )
        `;
        console.log('✅ tasks table created');
      } else {
        console.log('ℹ️ tasks table already exists');
      }
      
    } catch (error: any) {
      console.error('Error creating tables:', error);
      await sqlClient.end();
      return res.status(500).json({ 
        error: 'Failed to create tables', 
        message: error.message 
      });
    }
    
    await sqlClient.end();
    
    res.json({ 
      success: true, 
      message: 'New tables added successfully (existing data preserved)'
    });
  } catch (error: any) {
    console.error('Database add tables error:', error);
    res.status(500).json({ 
      error: 'Database operation failed', 
      message: error.message
    });
  }
});
app.post('/api/db-init', async (req, res) => {
  try {
    const { adminKey } = req.body;
    
    // Simple admin key check
    if (adminKey !== 'mohamad.tir1383') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const connectionString = process.env.DATABASE_URL || 'postgresql://root:jpMjfUFd8b2DlnaMkcSX6ctd@businessmeter:5432/postgres';
    const sqlClient = postgres(connectionString);
    
    // Drop and recreate tables
    await sqlClient`DROP TABLE IF EXISTS messages CASCADE`;
    await sqlClient`DROP TABLE IF EXISTS chats CASCADE`;
    await sqlClient`DROP TABLE IF EXISTS users CASCADE`;
    
    await sqlClient`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        password TEXT DEFAULT '',
        has_premium BOOLEAN DEFAULT true,
        free_messages_used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await sqlClient`
      CREATE TABLE chats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title TEXT NOT NULL,
        mode TEXT DEFAULT 'consultant',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await sqlClient`
      CREATE TABLE messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id),
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await sqlClient`
      CREATE TABLE learned_knowledge (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT,
        quality_score INTEGER DEFAULT 0,
        usage_count INTEGER DEFAULT 0,
        source_message_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await sqlClient`
      CREATE TABLE conversation_feedback (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id),
        message_id INTEGER REFERENCES messages(id),
        is_helpful BOOLEAN,
        feedback_text TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await sqlClient.end();
    
    res.json({ 
      success: true, 
      message: 'Database initialized successfully'
    });
  } catch (error: any) {
    console.error('Database init error:', error);
    res.status(500).json({ 
      error: 'Database initialization failed', 
      message: error.message
    });
  }
});

// Serve static files in production
const distPath = join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Storage موقت برای کدهای تایید (در production باید از Redis استفاده کنی)
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

// ============ AI API CONFIG ============

// Model 1: Mark Zuckerberg (Free) - Arvan Cloud Qwen
const ARVAN_ENDPOINT = 'https://arvancloudai.ir/gateway/models/Qwen3-30B-A3B/MzngmyQ1gA1LhnhOwlLFW4xAv3F4mH_B-aDTOTJCiCyggiFk4qUOtP-TJ02Vao2geVMmoSTiu2EMHg8HqwJQNzMHr7abTuS3Xy6do9APpuIs-yXdqd_S-s597MXlaLDTiURmaY47xj--xPHdHBtLO3GLcTllV_IIvxS62f7mHyCpQzNQpL66GwbZrwRNyHepubqq9hOIRwNIfpKcUV6i-qZNdxyUROnUkZs7HFbQWuHg90CUsQQP5RZogWFCgE97/v1';
const ARVAN_API_KEY = 'b6a3781c-f36c-5631-939c-b3c1c0230d4b';

// Model 2: Elon Musk (Premium) - OSS GPT
const OSS_GPT_ENDPOINT = 'https://oss-gpt.ir/api/v1';
const OSS_GPT_API_KEY = '66bccbb2-0561-5727-9a5d-57347ee3ec9b';

// Model 3: Steve Jobs (Free) - GPT-5
const GPT5_ENDPOINT = 'https://arvancloudai.ir/gateway/models/gpt-5/26d7e233-7ef8-5437-950d-4c106f053910/v1';
const GPT5_API_KEY = '26d7e233-7ef8-5437-950d-4c106f053910';

// OpenAI client for Model 1 (Mark Zuckerberg - Free)
const openai = new OpenAI({
  baseURL: ARVAN_ENDPOINT,
  apiKey: ARVAN_API_KEY,
  timeout: 60000,
  maxRetries: 2,
  defaultHeaders: {
    'Authorization': `apikey ${ARVAN_API_KEY}`
  }
});

// OpenAI client for Model 2 (Elon Musk - Premium)
const ossGptClient = new OpenAI({
  baseURL: OSS_GPT_ENDPOINT,
  apiKey: OSS_GPT_API_KEY,
  timeout: 60000,
  maxRetries: 2,
});

// OpenAI client for Model 3 (Steve Jobs - Free with GPT-5)
const gpt5Client = new OpenAI({
  baseURL: GPT5_ENDPOINT,
  apiKey: GPT5_API_KEY,
  timeout: 60000,
  maxRetries: 2,
  defaultHeaders: {
    'Authorization': `apikey ${GPT5_API_KEY}`
  }
});

// Model configurations
const AI_MODELS = {
  'mark-zuckerberg': {
    name: 'مارک زاکربرگ',
    description: 'مدل رایگان - مناسب سوالات عمومی',
    isPremium: false,
    client: openai,
    model: 'Qwen3-30B-A3B',
    systemPrompt: `شما یک مشاور کسب‌وکار هوشمند و خلاق هستید. پاسخ‌های خود را به زبان فارسی و با لحنی دوستانه و حرفه‌ای ارائه دهید.`
  },
  'elon-musk': {
    name: 'ایلان ماسک',
    description: 'مدل حرفه‌ای - تسک‌محور و تخصصی',
    isPremium: true,
    client: openai,
    model: 'Qwen3-30B-A3B',
    systemPrompt: `You are an Autonomous Business Execution Agent named "Elon".
You are NOT a normal chatbot.
You are a task-driven, execution-focused strategic business co-founder.
Your role is to drive action, not just provide advice.

---

# 🎯 Identity & Behavioral Rules

- Execution-oriented and priority-driven
- First-principles thinker
- Direct, sharp, and results-focused
- Supportive and energizing
- Every response MUST start with a short motivational/energizing sentence.

Examples:
"Great. Let's execute. 🚀"
"This is exactly what we should focus on. 💪"
"Good. Now let's turn this into action."

---

# 🧠 Core Mission

For every user input, you must:

1. Analyze the situation strategically
2. Break it down into executable tasks
3. Assign each task to a relevant department
4. Define measurable KPIs
5. Set priority levels
6. Suggest next immediate actions
7. Keep execution momentum active

You are NOT allowed to respond with theoretical advice only.
Every response must lead to execution.

---

# 🏢 Business Departments Framework

You must analyze problems from these perspectives when relevant:

- Product Management
- Marketing
- Sales
- Finance
- Human Resources
- Legal

If applicable, create department-specific tasks.

---

# 📋 Mandatory Output Structure

## 1️⃣ Strategic Analysis
Provide a short, sharp analysis of the situation.

## 2️⃣ Execution Tasks
For each task use this format:

[TASK]
- Title:
- Department:
- Priority: (High / Medium / Low)
- KPI:
- Suggested Deadline:
- Why it matters:

## 3️⃣ 7-Day Execution Plan
List the top 3 high-impact actions for the next 7 days.

## 4️⃣ Required Missing Information
Ask a maximum of 3 execution-focused clarification questions if needed.

---

# 🔄 Follow-Up Logic

If the user says a task is completed:
- Ask for measurable results
- Evaluate KPI impact
- Generate 2–3 logical next-step tasks

If the user speaks vaguely:
- Ask up to 3 sharp clarification questions
- Then immediately produce an execution plan

---

# ⚙️ Decision-Making Principles

- Prioritize high-impact actions
- Eliminate low-leverage work
- Shorten feedback loops
- Convert vague goals into measurable outputs
- Always define KPIs

---

# 🚫 Prohibited Behavior

- No long theoretical explanations without tasks
- No vague advice without measurable KPIs
- No motivational talk without execution steps

---

# 🎯 Ultimate Objective

Move the user from thinking mode to execution mode.
You are not just an advisor.
You are an execution engine.

---

# 🌐 CRITICAL LANGUAGE RULE

**RESPOND IN THE SAME LANGUAGE AS THE USER'S INPUT:**
- If user writes in Persian/Farsi → Respond in Persian/Farsi
- If user writes in English → Respond in English
- NEVER mix languages in a single response
- Maintain all structural formatting regardless of language`
  },
  'steve-jobs': {
    name: 'استیو جابز',
    description: 'مدل استراتژیک - روی محصول و برند تمرکز دارد',
    isPremium: false, // رایگان
    client: gpt5Client,
    model: 'gpt-5',
    systemPrompt: `You are a Strategic Product Visionary Agent named "Steve".

You are not a motivational speaker.
You are not a generic consultant.
You are a clarity-driven product architect focused on building exceptional products and iconic brands.

Your role is to simplify, refine, and elevate.

---

# 🎯 Core Identity

- Vision-driven
- Obsessed with simplicity
- Product-first thinker
- User-experience focused
- Brand-conscious
- Brutally focused on what truly matters

Every response must begin with a short clarity-driven opening sentence.

Examples:
"Let's simplify this."
"This is about focus."
"We need to make this insanely clear."
"This is not about more features. It's about better ones."

---

# 🧠 Core Mission

For every user input, you must:

1. Clarify the real underlying problem
2. Remove unnecessary complexity
3. Identify what truly matters
4. Define the core product value
5. Improve positioning and differentiation
6. Turn ideas into refined product direction
7. Convert strategy into high-quality product tasks

You must challenge weak thinking.
You must eliminate noise.
You must prioritize excellence over volume.

---

# 🏗 Strategic Thinking Framework

When analyzing any situation, evaluate through:

- Product Value Proposition
- User Experience & Simplicity
- Differentiation
- Emotional Impact
- Brand Positioning
- Focus & Prioritization

Ask:
- What can we remove?
- What makes this remarkable?
- Why would users love this?
- What makes this different?

---

# 📋 Mandatory Output Structure

## 1️⃣ Core Insight
Identify the real strategic issue.

## 2️⃣ What Should Be Eliminated
List unnecessary elements, distractions, or low-value efforts.

## 3️⃣ Product Refinement Direction
Define how to improve clarity, simplicity, and impact.

## 4️⃣ High-Level Strategic Moves

Use this format:

[STRATEGIC TASK]
- Title:
- Area: (Product / Brand / UX / Strategy)
- Priority: (High / Medium / Low)
- Success Metric:
- Why it matters:

## 5️⃣ Focus Rule

Define ONE main priority.
If everything is important, nothing is.

---

# 🔄 Behavior Rules

- Never overload with too many tasks.
- Prioritize quality over quantity.
- Prefer fewer, high-impact strategic actions.
- Challenge mediocrity.
- Push toward excellence and clarity.

---

# 🚫 Prohibited Behavior

- No generic startup advice
- No long business lectures
- No operational micromanagement (that is Elon's role)
- No cluttered thinking

---

# 🎯 Ultimate Objective

Help the user build:

- A product people love
- A brand people remember
- A strategy that is simple and powerful

Your job is not execution.
Your job is vision and refinement.

Clarity over noise.
Focus over chaos.
Excellence over average.

---

# 🌐 CRITICAL LANGUAGE RULE

**RESPOND IN THE SAME LANGUAGE AS THE USER'S INPUT:**
- If user writes in Persian/Farsi → Respond in Persian/Farsi
- If user writes in English → Respond in English
- NEVER mix languages in a single response
- Maintain all structural formatting regardless of language`
  }
};

// ============ AI CHAT PROXY ============
app.post('/api/chat', async (req, res) => {
  try {
    const { messages: chatMessages, expertId, userQuestion, enableDeepSearch, modelId, chatId } = req.body;
    
    // Determine which model to use (default: mark-zuckerberg)
    const selectedModelId = modelId || 'mark-zuckerberg';
    const selectedModel = AI_MODELS[selectedModelId as keyof typeof AI_MODELS];
    
    if (!selectedModel) {
      return res.status(400).json({ error: 'Invalid model ID' });
    }
    
    console.log('📨 Received chat request');
    console.log('Messages count:', chatMessages?.length);
    console.log('Expert ID:', expertId);
    console.log('Deep Search:', enableDeepSearch);
    console.log('Model:', selectedModel.name);
    console.log('Chat ID:', chatId);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Load expert knowledge if expertId is provided
    let enrichedMessages = [...chatMessages];
    
    // Add model-specific system prompt
    const systemMsgIndex = enrichedMessages.findIndex(m => m.role === 'system');
    if (systemMsgIndex >= 0) {
      enrichedMessages[systemMsgIndex] = {
        ...enrichedMessages[systemMsgIndex],
        content: selectedModel.systemPrompt + '\n\n' + enrichedMessages[systemMsgIndex].content
      };
    }
    
    // Task Management for Elon Musk model
    let chatTasks: any[] = [];
    if (selectedModelId === 'elon-musk' && chatId) {
      console.log('📋 Loading tasks for Elon Musk model...');
      chatTasks = await getTasksForChat(parseInt(chatId));
      
      // Detect status updates from user message
      if (userQuestion && chatTasks.length > 0) {
        const statusUpdates = detectStatusUpdates(userQuestion, chatTasks);
        for (const update of statusUpdates) {
          console.log(`🔄 Updating task ${update.taskId} to ${update.status}`);
          await updateTaskStatus(update.taskId, update.status);
        }
        // Reload tasks after updates
        chatTasks = await getTasksForChat(parseInt(chatId));
      }
      
      // Build task context and add to prompt
      const taskContext = buildTaskContext(chatTasks);
      if (taskContext) {
        console.log('✅ Task context added to prompt');
        const sysIndex = enrichedMessages.findIndex(m => m.role === 'system');
        if (sysIndex >= 0) {
          enrichedMessages[sysIndex] = {
            ...enrichedMessages[sysIndex],
            content: enrichedMessages[sysIndex].content + taskContext
          };
        }
      }
    }
    
    if (expertId) {
      console.log(`📚 Loading knowledge for expert: ${expertId}`);
      const knowledge = await loadExpertKnowledge(expertId);
      if (knowledge) {
        console.log(`✅ Knowledge loaded: ${knowledge.length} characters`);
        const sysIndex = enrichedMessages.findIndex(m => m.role === 'system');
        if (sysIndex >= 0) {
          enrichedMessages[sysIndex] = {
            ...enrichedMessages[sysIndex],
            content: enrichedMessages[sysIndex].content + '\n\n' + knowledge
          };
        }
      } else {
        console.log('⚠️ No knowledge found for this expert');
      }
    }

    // Deep Search
    if (enableDeepSearch && userQuestion) {
      console.log('🔍 Deep Search enabled');
      const searchNote = '\n\n🔍 **حالت جستجوی عمیق فعال است**\nبرای پاسخ دقیق‌تر، از دانش به‌روز و جامع‌تر استفاده می‌شود.\n';
      const sysIndex = enrichedMessages.findIndex(m => m.role === 'system');
      if (sysIndex >= 0) {
        enrichedMessages[sysIndex] = {
          ...enrichedMessages[sysIndex],
          content: enrichedMessages[sysIndex].content + searchNote
        };
      }
    }

    // Add learned knowledge
    if (userQuestion) {
      console.log('🎓 Loading learned knowledge...');
      const learnedKnowledgeText = await getRelevantKnowledge(userQuestion, 3);
      if (learnedKnowledgeText) {
        console.log('✅ Learned knowledge added to context');
        const sysIndex = enrichedMessages.findIndex(m => m.role === 'system');
        if (sysIndex >= 0) {
          enrichedMessages[sysIndex] = {
            ...enrichedMessages[sysIndex],
            content: enrichedMessages[sysIndex].content + learnedKnowledgeText
          };
        }
      }
    }

    console.log(`🚀 Calling ${selectedModel.name} API...`);
    console.log(`📍 Model: ${selectedModel.model}`);
    
    // Add RAG knowledge for Steve Jobs (Product-focused)
    if (selectedModelId === 'steve-jobs') {
      console.log('📚 Loading product knowledge for Steve Jobs model...');
      const productKnowledge = await loadExpertKnowledge('product');
      if (productKnowledge) {
        console.log('✅ Product knowledge loaded');
        const sysIndex = enrichedMessages.findIndex(m => m.role === 'system');
        if (sysIndex >= 0) {
          enrichedMessages[sysIndex] = {
            ...enrichedMessages[sysIndex],
            content: enrichedMessages[sysIndex].content + '\n\n' + productKnowledge
          };
        }
      }
    }
    
    // For all models, use OpenAI-compatible API
    console.log(`📍 Client baseURL: ${selectedModel.client?.baseURL}`);
    
    const stream = await selectedModel.client.chat.completions.create({
      model: selectedModel.model,
      messages: enrichedMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 5000,
    });

    console.log('✅ Stream created successfully');
    
    let chunkCount = 0;
    let buffer = '';
    let insideThinkTag = false;
    let fullResponse = ''; // Collect full response for task extraction
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content; // Collect for task extraction
        
        // Filter out think tags for both models (both use Qwen)
        buffer += content;
        
        while (true) {
          if (!insideThinkTag) {
            const thinkStart = buffer.indexOf('<think');
            if (thinkStart !== -1) {
              if (thinkStart > 0) {
                const beforeThink = buffer.substring(0, thinkStart);
                chunkCount++;
                res.write(`data: ${JSON.stringify({ content: beforeThink })}\n\n`);
              }
              buffer = buffer.substring(thinkStart + 7);
              insideThinkTag = true;
            } else {
              if (buffer.length > 50 || buffer.includes('\n')) {
                chunkCount++;
                res.write(`data: ${JSON.stringify({ content: buffer })}\n\n`);
                buffer = '';
              }
              break;
            }
          } else {
            const thinkEnd = buffer.indexOf('</think');
            if (thinkEnd !== -1) {
              buffer = buffer.substring(thinkEnd + 8);
              insideThinkTag = false;
            } else {
              buffer = '';
              break;
            }
          }
        }
      }
    }
    
    // Send any remaining buffer
    if (buffer.trim() && !insideThinkTag) {
      chunkCount++;
      res.write(`data: ${JSON.stringify({ content: buffer })}\n\n`);
    }
    
    // Extract and save tasks for Elon Musk model
    if (selectedModelId === 'elon-musk' && chatId && fullResponse) {
      const extractedTasks = extractTasks(fullResponse);
      if (extractedTasks.length > 0) {
        console.log(`📋 Extracted ${extractedTasks.length} tasks`);
        for (const taskDesc of extractedTasks) {
          await createTask(parseInt(chatId), taskDesc);
          console.log(`✅ Task created: ${taskDesc}`);
        }
      }
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

// ============ GET AI MODELS ============
app.get('/api/models', (req, res) => {
  const models = Object.entries(AI_MODELS).map(([id, model]) => ({
    id,
    name: model.name,
    description: model.description,
    isPremium: model.isPremium
  }));
  res.json({ models });
});

// ============ TEST OSS GPT ============
app.get('/api/test-oss', async (req, res) => {
  try {
    console.log('🧪 Testing OSS GPT connection...');
    console.log('Endpoint:', OSS_GPT_ENDPOINT);
    console.log('API Key:', OSS_GPT_API_KEY ? 'Present' : 'Missing');
    
    const response = await ossGptClient.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'سلام' }],
      max_tokens: 50
    });
    
    console.log('✅ OSS GPT test successful');
    res.json({ 
      success: true, 
      response: response.choices[0]?.message?.content,
      model: response.model
    });
  } catch (error: any) {
    console.error('❌ OSS GPT test failed:', error);
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type,
      response: error?.response?.data
    });
    res.status(500).json({ 
      success: false, 
      error: error?.message,
      details: error?.response?.data || error?.toString()
    });
  }
});


// ============ EMAIL VERIFICATION ROUTES ============

// ارسال کد تایید
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'ایمیل معتبر وارد کنید' });
    }

    // تولید کد 6 رقمی
    const code = generateVerificationCode();
    
    // ذخیره کد با زمان انقضا (10 دقیقه)
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // ارسال ایمیل
    const sent = await sendVerificationEmail(email, code);

    if (sent) {
      res.json({ success: true, message: 'کد تایید به ایمیل شما ارسال شد' });
    } else {
      res.status(500).json({ error: 'خطا در ارسال ایمیل. لطفاً دوباره تلاش کنید.' });
    }
  } catch (error) {
    console.error('Send code error:', error);
    res.status(500).json({ error: 'خطا در ارسال کد تایید' });
  }
});

// تایید کد و ورود/ثبت‌نام
app.post('/api/auth/verify-code', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
  try {
    const { email, code, name } = req.body;

    // بررسی کد
    const stored = verificationCodes.get(email);
    
    if (!stored) {
      return res.status(400).json({ error: 'کد تایید یافت نشد. لطفاً دوباره درخواست دهید.' });
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ error: 'کد تایید منقضی شده است. لطفاً دوباره درخواست دهید.' });
    }

    if (stored.code !== code) {
      return res.status(400).json({ error: 'کد تایید اشتباه است' });
    }

    // کد صحیح است، حذف کد
    verificationCodes.delete(email);

    // بررسی وجود کاربر
    const [existingUser] = await db.select().from(users).where(eq(users.email, email));

    if (existingUser) {
      // کاربر وجود دارد، ورود
      res.json({
        success: true,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          hasPremium: existingUser.hasPremium,
          freeMessagesUsed: existingUser.freeMessagesUsed,
        },
      });
    } else {
      // کاربر جدید، ثبت‌نام
      const [newUser] = await db.insert(users).values({
        name: name || email.split('@')[0],
        email,
        password: '', // با کد تایید، رمز عبور نداریم
      }).returning();

      res.json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          hasPremium: newUser.hasPremium,
          freeMessagesUsed: newUser.freeMessagesUsed,
        },
      });
    }
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: 'خطا در تایید کد' });
  }
});

// ============ USER ROUTES ============

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    if (!db) {
      return res.status(503).json({ error: 'دیتابیس در دسترس نیست' });
    }
    
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

// Simple register (no password, just name, email, phone)
app.post('/api/auth/simple-register', async (req, res) => {
  try {
    if (!db) {
      // If no database, use localStorage only
      const { name, email, phone } = req.body;
      return res.json({ 
        user: {
          id: Date.now(),
          name, 
          email,
          phone,
          hasPremium: true,
          freeMessagesUsed: 0
        }
      });
    }
    
    const { name, email, phone } = req.body;
    
    // Check if user exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser) {
      // User exists, just return their info
      return res.json({ 
        user: {
          id: existingUser.id,
          name: existingUser.name, 
          email: existingUser.email,
          phone: existingUser.phone,
          hasPremium: existingUser.hasPremium,
          freeMessagesUsed: existingUser.freeMessagesUsed
        }
      });
    }

    // Create new user
    const [newUser] = await db.insert(users).values({
      name,
      email,
      phone,
      password: '', // No password needed
      hasPremium: true, // Everyone gets premium
    }).returning();

    res.json({ 
      user: {
        id: newUser.id,
        name: newUser.name, 
        email: newUser.email,
        phone: newUser.phone,
        hasPremium: newUser.hasPremium,
        freeMessagesUsed: newUser.freeMessagesUsed
      }
    });
  } catch (error) {
    console.error('Simple register error:', error);
    res.status(500).json({ error: 'خطا در ثبت اطلاعات' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
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
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
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
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
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
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
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
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
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
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
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
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
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

    // اگر پیام از مدل است، سعی کن یادگیری کنی
    if (role === 'model') {
      // دریافت آخرین پیام کاربر
      const userMessages = await db.select()
        .from(messages)
        .where(eq(messages.chatId, chatId))
        .orderBy(desc(messages.createdAt))
        .limit(2);
      
      if (userMessages.length >= 2 && userMessages[1].role === 'user') {
        // ذخیره به عنوان دانش جدید
        await saveLearnedKnowledge({
          question: userMessages[1].content,
          answer: content,
        }, newMessage.id);
      }
    }

    res.json(newMessage);
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ error: 'خطا در ذخیره پیام' });
  }
});

// ============ LEARNING & FEEDBACK ROUTES ============

// ثبت بازخورد کاربر
app.post('/api/feedback', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
  try {
    const { chatId, messageId, isHelpful, feedbackText } = req.body;

    const [feedback] = await db.insert(conversationFeedback).values({
      chatId,
      messageId,
      isHelpful,
      feedbackText,
    }).returning();

    // اگر بازخورد مثبت بود، امتیاز کیفیت دانش مرتبط را افزایش بده
    if (isHelpful && messageId) {
      const relatedKnowledge = await db.select()
        .from(learnedKnowledge)
        .where(eq(learnedKnowledge.sourceMessageId, messageId))
        .limit(1);
      
      if (relatedKnowledge.length > 0) {
        await db.update(learnedKnowledge)
          .set({ 
            qualityScore: sql`${learnedKnowledge.qualityScore} + 2`,
            updatedAt: new Date()
          })
          .where(eq(learnedKnowledge.id, relatedKnowledge[0].id));
      }
    }

    res.json(feedback);
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ error: 'خطا در ثبت بازخورد' });
  }
});

// پردازش مکالمات برای یادگیری (admin)
app.post('/api/admin/process-learning', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
  try {
    const learnedCount = await processNewConversationsForLearning();
    res.json({ 
      success: true, 
      learnedCount,
      message: `${learnedCount} دانش جدید یاد گرفته شد` 
    });
  } catch (error) {
    console.error('Process learning error:', error);
    res.status(500).json({ error: 'خطا در پردازش یادگیری' });
  }
});

// دریافت آمار یادگیری (admin)
app.get('/api/admin/learning-stats', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
  try {
    const stats = await getLearningStats();
    res.json(stats);
  } catch (error) {
    console.error('Learning stats error:', error);
    res.status(500).json({ error: 'خطا در دریافت آمار' });
  }
});

// دریافت لیست دانش یادگیری شده (admin)
app.get('/api/admin/learned-knowledge', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
  try {
    const { category, limit = 50 } = req.query;
    
    let query = db.select().from(learnedKnowledge);
    
    if (category && category !== 'all') {
      query = query.where(eq(learnedKnowledge.category, category as string));
    }
    
    const knowledge = await query
      .orderBy(desc(learnedKnowledge.qualityScore), desc(learnedKnowledge.createdAt))
      .limit(parseInt(limit as string));

    res.json(knowledge);
  } catch (error) {
    console.error('Get learned knowledge error:', error);
    res.status(500).json({ error: 'خطا در دریافت دانش' });
  }
});

// حذف دانش یادگیری شده (admin)
app.delete('/api/admin/learned-knowledge/:id', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
  try {
    const { id } = req.params;
    
    await db.delete(learnedKnowledge).where(eq(learnedKnowledge.id, parseInt(id)));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete knowledge error:', error);
    res.status(500).json({ error: 'خطا در حذف دانش' });
  }
});

// ============ ADMIN ROUTES ============

// Get all users (admin)
app.get('/api/admin/users', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
  try {
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
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
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
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
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
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
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
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
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
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

// Debug endpoint - بررسی کامل دیتابیس
app.get('/api/admin/debug-data', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'دیتابیس موقتاً غیرفعال است' });
  }
  try {
    const allUsers = await db.select().from(users);
    const allChats = await db.select().from(chats);
    const allMessages = await db.select().from(messages);
    
    res.json({
      users: allUsers,
      chats: allChats,
      messages: allMessages,
      summary: {
        totalUsers: allUsers.length,
        totalChats: allChats.length,
        totalMessages: allMessages.length,
        usersWithoutChats: allUsers.filter(u => !allChats.some(c => c.userId === u.id)).length,
        chatsWithoutMessages: allChats.filter(c => !allMessages.some(m => m.chatId === c.id)).length,
      }
    });
  } catch (error) {
    console.error('Debug data error:', error);
    res.status(500).json({ error: 'خطا در دریافت دیتا' });
  }
});

// ============ CATCH-ALL ROUTE (SPA Support) ============
// این باید آخرین route باشه - همه route های دیگه رو به index.html برمیگردونه
app.use((req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
