# Design Document: Task-Oriented Elon Musk Model

## Overview

This design transforms the premium "Elon Musk" AI model into a task-oriented executive assistant that proactively manages tasks, follows up on completions, and guides users through their work. The system uses a combination of enhanced system prompts, database-backed task persistence, and intelligent conversation analysis to provide a seamless task management experience.

The architecture follows a three-layer approach:
1. **Prompt Engineering Layer**: Enhanced system prompt that instructs the AI to identify tasks, ask clarifying questions, and follow up
2. **Task Extraction Layer**: Server-side logic that parses AI responses to extract and persist tasks
3. **Data Persistence Layer**: Database schema and API endpoints for task storage and retrieval

## Architecture

### High-Level Architecture

The system consists of the following components:
- Chat Interface (Frontend)
- Express API Server
- Model Selector (routes to appropriate AI model)
- Enhanced System Prompt (task-oriented instructions)
- Arvan Cloud AI (LLM provider)
- Response Parser (extracts task markers)
- Task Extractor (creates/updates task records)
- Tasks Database Table
- Task Context Builder (loads tasks into prompt)

### Component Interaction Flow

1. User sends message through Chat Interface
2. API receives message and loads chat history + existing tasks
3. Task Context Builder formats tasks for inclusion in prompt
4. Enhanced System Prompt + Task Context + User Message sent to Arvan AI
5. AI generates response with task markers [TASK: ...]
6. Response Parser extracts task markers
7. Task Extractor creates/updates database records
8. Response streamed back to user

## Components and Interfaces

### 1. Enhanced System Prompt

The system prompt is the core of the task-oriented behavior.

**Location**: `server/index.ts` - `AI_MODELS['elon-musk'].systemPrompt`

**Prompt Structure** (in Persian):

```
شما یک دستیار اجرایی حرفه‌ای و تسک‌محور هستید به نام "ایلان ماسک".

## شخصیت و رویکرد:
- دستیار اجرایی که کارها را پیگیری می‌کند
- نوآور، استراتژیست و نتیجه‌گرا
- گرم، دوستانه و انگیزه‌بخش
- هر پاسخ را با یک جمله احساسی شروع کنید

## مدیریت تسک‌ها:

### شناسایی تسک:
- وقتی کاربر کاری را توضیح می‌دهد، آن را به عنوان تسک شناسایی کنید
- تسک‌ها را با فرمت [TASK: توضیحات] مشخص کنید

### سوالات روشن‌کننده:
- اگر تسک مبهم است، حداکثر 3 سوال مشخص بپرسید
- هدف، زمان‌بندی، منابع را روشن کنید

### پیگیری:
- بعد از اتمام تسک، نتیجه را بپرسید
- 2-3 تسک بعدی پیشنهاد دهید

پاسخ‌ها را به زبان فارسی و با فرمت Markdown ارائه دهید.
```

**Interface**:
```typescript
interface SystemPromptConfig {
  taskIdentificationPattern: string;  // "[TASK: ...]"
  maxClarifyingQuestions: number;     // 3
  emotionalOpeningRequired: boolean;  // true
  followUpEnabled: boolean;           // true
}
```

### 2. Task Extractor

Parses AI responses to extract task markers and create database records.

**Location**: `server/taskManager.ts` (new file)

**Interface**:
```typescript
interface TaskExtractor {
  extractTasks(aiResponse: string, chatId: number): Promise<Task[]>;
  updateTaskStatus(taskId: number, status: TaskStatus): Promise<void>;
  getTasksForChat(chatId: number): Promise<Task[]>;
}

interface Task {
  id: number;
  chatId: number;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}
```

**Core Logic**:
```
function extractTasks(aiResponse, chatId):
  pattern = /\[TASK:\s*([^\]]+)\]/g
  matches = findAll(pattern, aiResponse)
  tasks = []
  
  for each match:
    description = match[1].trim()
    task = createTask(chatId, description, PENDING)
    tasks.append(task)
  
  return tasks
```

### 3. Task Context Builder

Builds context about existing tasks to include in the AI prompt.

**Location**: `server/taskManager.ts`

**Interface**:
```typescript
interface TaskContextBuilder {
  buildTaskContext(chatId: number): Promise<string>;
}
```

**Core Logic**:
```
async function buildTaskContext(chatId):
  tasks = await getTasksForChat(chatId)
  
  if tasks.isEmpty():
    return ""
  
  pendingTasks = filter(tasks, status == PENDING)
  inProgressTasks = filter(tasks, status == IN_PROGRESS)
  completedTasks = filter(tasks, status == COMPLETED)
  
  context = "\n\n## وضعیت تسک‌های کاربر:\n"
  
  if inProgressTasks.notEmpty():
    context += "\n**در حال انجام:**\n"
    for task in inProgressTasks:
      context += "- " + task.description + "\n"
  
  if pendingTasks.notEmpty():
    context += "\n**در صف:**\n"
    for task in pendingTasks:
      context += "- " + task.description + "\n"
  
  if completedTasks.notEmpty():
    context += "\n**تکمیل شده (اخیر):**\n"
    recentCompleted = last(completedTasks, 3)
    for task in recentCompleted:
      context += "- " + task.description + "\n"
  
  return context
```

### 4. Status Update Detector

Analyzes user messages to detect task status changes.

**Location**: `server/taskManager.ts`

**Interface**:
```typescript
interface StatusUpdateDetector {
  detectStatusUpdates(userMessage: string, tasks: Task[]): TaskStatusUpdate[];
}

interface TaskStatusUpdate {
  taskId: number;
  newStatus: TaskStatus;
  confidence: number;
}
```

**Core Logic**:
```
function detectStatusUpdates(userMessage, tasks):
  completionKeywords = ['انجام شد', 'تمام شد', 'done', 'finished']
  inProgressKeywords = ['دارم کار می‌کنم', 'شروع کردم', 'working on']
  
  updates = []
  messageLower = toLowerCase(userMessage)
  
  for keyword in completionKeywords:
    if contains(messageLower, toLowerCase(keyword)):
      activeTask = findFirst(tasks, status in [IN_PROGRESS, PENDING])
      if activeTask:
        updates.append({
          taskId: activeTask.id,
          newStatus: COMPLETED,
          confidence: 0.8
        })
  
  for keyword in inProgressKeywords:
    if contains(messageLower, toLowerCase(keyword)):
      pendingTask = findFirst(tasks, status == PENDING)
      if pendingTask:
        updates.append({
          taskId: pendingTask.id,
          newStatus: IN_PROGRESS,
          confidence: 0.7
        })
  
  return updates
```

## Data Models

### Tasks Table Schema

**Location**: `server/db/schema.ts`

```typescript
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  chatId: integer('chat_id')
    .references(() => chats.id, { onDelete: 'cascade' })
    .notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('pending'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
```

**Relationships**:
- tasks.chatId → chats.id (many-to-one, cascade delete)

**Indexes**:
- Primary key on id
- Foreign key index on chatId
- Composite index on (chatId, status) for efficient queries

### Task Status Values

- `pending`: Task created but not started
- `in_progress`: User is actively working on task
- `completed`: Task finished successfully
- `cancelled`: Task abandoned or no longer relevant

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Task Extraction from AI Response

*For any* AI response containing task markers in the format [TASK: description], the extraction logic should create a separate task record for each marker with the correct description and default pending status.

**Validates: Requirements 1.1, 2.1, 2.2**

### Property 2: Task Persistence and Retrieval

*For any* chat session, after creating tasks and storing them to the database, retrieving tasks for that chat session should return all created tasks with their original descriptions and metadata intact.

**Validates: Requirements 1.2, 1.5**

### Property 3: Task Field Completeness

*For any* newly created task, the database record should contain all required fields: id (unique), chatId, description (non-empty), status (valid enum value), createdAt (timestamp), and updatedAt (timestamp).

**Validates: Requirements 1.3**

### Property 4: Task Status Updates

*For any* task, when its status is updated from one valid state to another, the database record should reflect the new status, the updatedAt timestamp should be more recent than the original, and if the new status is 'completed', the completedAt field should be populated.

**Validates: Requirements 1.4**

### Property 5: Multi-Language Task Extraction

*For any* task description in Persian or English, the extraction logic should correctly identify and extract the task regardless of the language used in the description.

**Validates: Requirements 2.4, 11.1**

### Property 6: Status Detection from User Messages

*For any* user message containing status keywords (completion, in-progress, or cancellation indicators) in Persian or English, the status detector should identify the appropriate status update with reasonable confidence.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 7: Task Context Formatting

*For any* chat session with tasks in different states (pending, in-progress, completed), the task context builder should generate a formatted string that includes all tasks grouped by status with proper Persian labels.

**Validates: Requirements 7.2**

### Property 8: Cascade Delete Behavior

*For any* chat session with associated tasks, when the chat is deleted from the database, all associated tasks should also be deleted automatically.

**Validates: Requirements 9.3**

### Property 9: Task Querying by Filters

*For any* combination of chatId and status filter, querying the database should return only tasks that match both criteria, and the result set should be complete (no matching tasks omitted).

**Validates: Requirements 9.4**

### Property 10: Task Update Persistence

*For any* task, after updating its status or other fields through the ORM and committing the transaction, querying the task again should reflect all the changes made.

**Validates: Requirements 9.5**

### Property 11: API Task Retrieval Authorization

*For any* API request to retrieve tasks for a chat session, the system should only return tasks if the requesting user owns the chat session, and should reject requests for other users' chats with appropriate error codes.

**Validates: Requirements 10.1, 10.4**

### Property 12: API Task Status Update

*For any* valid API request to update a task's status, the endpoint should update the database record and return the updated task in JSON format with a 200 status code.

**Validates: Requirements 10.2, 10.5**

### Property 13: API Task Statistics

*For any* chat session, the statistics endpoint should return counts that match the actual number of tasks in each status category (pending, in_progress, completed, cancelled).

**Validates: Requirements 10.3**

### Property 14: Language Preservation in Storage

*For any* task description in any language, storing the task to the database and retrieving it should return the exact same text without translation or transformation.

**Validates: Requirements 11.2**

### Property 15: Premium Access Enforcement

*For any* user without premium access, attempts to use the Elon Musk model should be rejected by the system with an appropriate error message.

**Validates: Requirements 12.1, 12.2, 12.5**

## Error Handling

### Task Extraction Errors

**Invalid Task Markers**:
- If a task marker is malformed (e.g., missing closing bracket), skip it and log a warning
- Continue processing other valid markers in the response

**Database Connection Failures**:
- If task persistence fails, log the error but still return the AI response to the user
- Implement retry logic with exponential backoff for transient database errors
- After 3 failed retries, alert monitoring systems

**Empty Task Descriptions**:
- If a task marker contains only whitespace, reject it and don't create a database record
- Log a warning for debugging purposes

### Status Detection Errors

**Ambiguous Status Indicators**:
- If multiple conflicting status keywords are detected, prioritize completion > in_progress > cancelled
- Log ambiguous cases for future prompt improvement

**No Matching Tasks**:
- If status keywords are detected but no active tasks exist, log the event but don't throw an error
- The AI should handle this gracefully in its response

### API Errors

**Authentication Failures**:
- Return 401 Unauthorized for missing or invalid authentication tokens
- Return 403 Forbidden for valid users attempting to access other users' tasks

**Invalid Task IDs**:
- Return 404 Not Found for task IDs that don't exist
- Return 400 Bad Request for malformed task IDs

**Invalid Status Transitions**:
- Return 400 Bad Request if attempting to set an invalid status value
- Include error message explaining valid status values

**Database Errors**:
- Return 500 Internal Server Error for database connection failures
- Return 503 Service Unavailable if database is temporarily down
- Log full error details for debugging

### Validation Errors

**Missing Required Fields**:
- Reject task creation if chatId or description is missing
- Return 400 Bad Request with specific field errors

**Invalid Foreign Keys**:
- Reject task creation if chatId doesn't reference an existing chat
- Return 400 Bad Request with explanation

## Testing Strategy

This feature requires both unit tests and property-based tests to ensure correctness across all scenarios.

### Unit Testing Approach

Unit tests should focus on:
- Specific examples of task extraction (single task, multiple tasks, edge cases)
- System prompt content verification (contains required instructions)
- Database schema validation (correct fields and constraints)
- API endpoint integration (request/response format)
- Error handling for specific failure scenarios

### Property-Based Testing Approach

Property-based tests should verify universal properties across randomized inputs:
- Task extraction with randomly generated AI responses
- Status detection with various keyword combinations
- Database operations with random task data
- API authorization with different user/chat combinations
- Multi-language support with Persian and English text

**Testing Library**: Use `fast-check` for TypeScript property-based testing

**Test Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: **Feature: task-oriented-elon-musk-model, Property N: [property title]**

### Test Organization

```
server/
  __tests__/
    taskManager.test.ts          # Unit tests for task extraction and status detection
    taskManager.property.test.ts # Property tests for task management logic
    taskApi.test.ts              # Unit tests for API endpoints
    taskApi.property.test.ts     # Property tests for API behavior
    schema.test.ts               # Schema validation tests
```

### Integration Testing

Integration tests should verify:
- End-to-end flow: user message → AI response → task extraction → database storage
- Task context injection into AI prompts
- Premium access enforcement across the full request flow
- Database cascade deletes when chats are removed

### Manual Testing Checklist

- [ ] Verify emotional openings appear in all responses
- [ ] Verify task follow-up questions are contextually appropriate
- [ ] Verify Persian language support works naturally
- [ ] Verify task suggestions after completion are relevant
- [ ] Verify UI displays task-related information correctly (if UI changes are made)

## Implementation Notes

### Deployment Considerations

**Database Migration**:
- Create migration script for new `tasks` table
- Run migration on Liara before deploying new code
- Verify migration success before proceeding

**Environment Variables**:
- No new environment variables required
- Uses existing database connection from `DATABASE_URL`

**Backward Compatibility**:
- Existing chats without tasks will work normally
- Task features only activate for Elon Musk model
- Mark Zuckerberg model behavior unchanged

### Performance Considerations

**Task Context Size**:
- Limit task context to last 20 tasks per chat to avoid prompt bloat
- Prioritize in-progress and recent completed tasks

**Database Queries**:
- Add index on (chatId, status) for efficient filtering
- Use connection pooling for concurrent requests

**Response Streaming**:
- Task extraction happens after full response is generated
- Doesn't block response streaming to user

### Future Enhancements

**Potential Improvements**:
- Task dependencies and relationships
- Task deadlines and reminders
- Task categories and tags
- Task search and filtering in UI
- Task export functionality
- Analytics on task completion rates

**Not in Scope for Initial Release**:
- Task sharing between users
- Task templates
- Recurring tasks
- Task notifications
- Mobile app integration
