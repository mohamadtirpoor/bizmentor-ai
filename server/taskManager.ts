import { db, tasks, Task, NewTask } from './db';
import { eq, and, desc } from 'drizzle-orm';

// Task status enum
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Extract tasks from AI response
export function extractTasks(aiResponse: string): string[] {
  const taskPattern = /\[TASK:\s*([^\]]+)\]/g;
  const matches = [...aiResponse.matchAll(taskPattern)];
  return matches.map(match => match[1].trim()).filter(desc => desc.length > 0);
}

// Create task in database
export async function createTask(chatId: number, description: string): Promise<Task | null> {
  if (!db) return null;
  
  try {
    const [task] = await db.insert(tasks).values({
      chatId,
      description,
      status: TaskStatus.PENDING,
    }).returning();
    
    return task;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

// Get tasks for a chat
export async function getTasksForChat(chatId: number, limit: number = 20): Promise<Task[]> {
  if (!db) return [];
  
  try {
    const chatTasks = await db.select()
      .from(tasks)
      .where(eq(tasks.chatId, chatId))
      .orderBy(desc(tasks.createdAt))
      .limit(limit);
    
    return chatTasks;
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}

// Update task status
export async function updateTaskStatus(
  taskId: number, 
  status: TaskStatus
): Promise<Task | null> {
  if (!db) return null;
  
  try {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    
    if (status === TaskStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }
    
    const [updated] = await db.update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();
    
    return updated;
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}

// Detect status updates from user message
export function detectStatusUpdates(userMessage: string, chatTasks: Task[]): Array<{ taskId: number; status: TaskStatus }> {
  const messageLower = userMessage.toLowerCase();
  const updates: Array<{ taskId: number; status: TaskStatus }> = [];
  
  // Completion keywords (Persian and English)
  const completionKeywords = [
    'انجام شد', 'تمام شد', 'تموم شد', 'کامل شد',
    'done', 'finished', 'completed', 'انجامش دادم'
  ];
  
  // In-progress keywords
  const inProgressKeywords = [
    'دارم کار می‌کنم', 'شروع کردم', 'در حال انجام',
    'working on', 'started', 'in progress'
  ];
  
  // Check for completion
  for (const keyword of completionKeywords) {
    if (messageLower.includes(keyword.toLowerCase())) {
      const activeTask = chatTasks.find(t => 
        t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.PENDING
      );
      if (activeTask) {
        updates.push({ taskId: activeTask.id, status: TaskStatus.COMPLETED });
        break;
      }
    }
  }
  
  // Check for in-progress
  if (updates.length === 0) {
    for (const keyword of inProgressKeywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        const pendingTask = chatTasks.find(t => t.status === TaskStatus.PENDING);
        if (pendingTask) {
          updates.push({ taskId: pendingTask.id, status: TaskStatus.IN_PROGRESS });
          break;
        }
      }
    }
  }
  
  return updates;
}

// Build task context for AI prompt
export function buildTaskContext(chatTasks: Task[]): string {
  if (chatTasks.length === 0) return '';
  
  const pending = chatTasks.filter(t => t.status === TaskStatus.PENDING);
  const inProgress = chatTasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
  const completed = chatTasks.filter(t => t.status === TaskStatus.COMPLETED).slice(0, 3);
  
  let context = '\n\n## 📋 وضعیت تسک‌های کاربر:\n';
  
  if (inProgress.length > 0) {
    context += '\n**🔄 در حال انجام:**\n';
    inProgress.forEach(task => {
      context += `- ${task.description}\n`;
    });
  }
  
  if (pending.length > 0) {
    context += '\n**⏳ در صف:**\n';
    pending.forEach(task => {
      context += `- ${task.description}\n`;
    });
  }
  
  if (completed.length > 0) {
    context += '\n**✅ تکمیل شده (اخیر):**\n';
    completed.forEach(task => {
      context += `- ${task.description}\n`;
    });
  }
  
  return context;
}
