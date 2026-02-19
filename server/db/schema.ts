import { pgTable, serial, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  password: text('password').default(''),
  hasPremium: boolean('has_premium').default(true),
  freeMessagesUsed: integer('free_messages_used').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Chats table
export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  mode: text('mode').default('consultant'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id').references(() => chats.id),
  role: text('role').notNull(), // 'user' or 'model'
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Learned Knowledge table - for AI learning from conversations
export const learnedKnowledge = pgTable('learned_knowledge', {
  id: serial('id').primaryKey(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  category: text('category'),
  qualityScore: integer('quality_score').default(0),
  usageCount: integer('usage_count').default(0),
  sourceMessageId: integer('source_message_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Conversation Feedback table - for rating responses
export const conversationFeedback = pgTable('conversation_feedback', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id').references(() => chats.id),
  messageId: integer('message_id').references(() => messages.id),
  isHelpful: boolean('is_helpful'),
  feedbackText: text('feedback_text'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tasks table - for Elon Musk model task management
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id').references(() => chats.id, { onDelete: 'cascade' }).notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('pending'), // pending, in_progress, completed, cancelled
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type LearnedKnowledge = typeof learnedKnowledge.$inferSelect;
export type NewLearnedKnowledge = typeof learnedKnowledge.$inferInsert;
export type ConversationFeedback = typeof conversationFeedback.$inferSelect;
export type NewConversationFeedback = typeof conversationFeedback.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
