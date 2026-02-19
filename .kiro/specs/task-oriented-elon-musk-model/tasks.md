# Implementation Plan: Task-Oriented Elon Musk Model

## Overview

This implementation plan transforms the premium "Elon Musk" AI model into a task-oriented executive assistant. The approach follows these phases:

1. Database schema and migration setup
2. Core task management logic (extraction, storage, retrieval)
3. Enhanced system prompt with task-oriented instructions
4. API integration and task context injection
5. Testing and validation

Each task builds incrementally, ensuring the system remains functional throughout development.

## Tasks

- [ ] 1. Create database schema and migration for tasks table
  - Add tasks table definition to `server/db/schema.ts`
  - Include all required fields: id, chatId, description, status, metadata, timestamps
  - Add foreign key relationship to chats table with cascade delete
  - Add TypeScript types for Task and NewTask
  - Create migration script in `scripts/migrate-tasks.ts`
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 2. Implement core task management module
  - [ ] 2.1 Create task manager module structure
    - Create `server/taskManager.ts` with core interfaces
    - Define TaskStatus enum (pending, in_progress, completed, cancelled)
    - Define Task, NewTask, TaskStatusUpdate interfaces
    - _Requirements: 1.1, 1.3_

  - [ ]* 2.2 Write property test for task extraction
    - **Property 1: Task Extraction from AI Response**
    - **Validates: Requirements 1.1, 2.1, 2.2**
    - Test with randomly generated AI responses containing task markers
    - Verify each [TASK: ...] marker creates a separate record

  - [ ] 2.3 Implement task extraction logic
    - Write `extractTasks()` function to parse [TASK: ...] markers from AI responses
    - Handle multiple tasks in single response
    - Handle malformed markers gracefully
    - Support Persian and English text
    - _Requirements: 1.1, 2.1, 2.2, 2.4_

  - [ ]* 2.4 Write property test for multi-language extraction
    - **Property 5: Multi-Language Task Extraction**
    - **Validates: Requirements 2.4, 11.1**
    - Test with Persian and English task descriptions
    - Verify extraction works regardless of language

  - [ ] 2.5 Implement task persistence functions
    - Write `createTask()` to insert tasks into database
    - Write `getTasksForChat()` to retrieve tasks by chatId
    - Write `updateTaskStatus()` to change task status
    - Include proper error handling and validation
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.6 Write property tests for task persistence
    - **Property 2: Task Persistence and Retrieval**
    - **Validates: Requirements 1.2, 1.5**
    - **Property 3: Task Field Completeness**
    - **Validates: Requirements 1.3**
    - Test round-trip: create tasks → store → retrieve → verify
    - Test all required fields are populated correctly

- [ ] 3. Implement status detection logic
  - [ ] 3.1 Create status update detector
    - Write `detectStatusUpdates()` function
    - Define completion keywords in Persian and English
    - Define in-progress keywords in Persian and English
    - Define cancellation keywords in Persian and English
    - Return status updates with confidence scores
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 3.2 Write property test for status detection
    - **Property 6: Status Detection from User Messages**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - Test with various keyword combinations
    - Test with Persian and English keywords
    - Verify correct status transitions are detected

  - [ ] 3.3 Implement status update application
    - Write logic to apply detected status updates to tasks
    - Update timestamps appropriately (updatedAt, completedAt)
    - Handle cases where no matching tasks exist
    - _Requirements: 1.4, 3.1, 3.2, 3.3_

  - [ ]* 3.4 Write property test for status updates
    - **Property 4: Task Status Updates**
    - **Validates: Requirements 1.4**
    - Test status transitions update database correctly
    - Verify timestamps are updated appropriately

- [ ] 4. Implement task context builder
  - [ ] 4.1 Create task context formatting logic
    - Write `buildTaskContext()` function
    - Group tasks by status (in_progress, pending, completed)
    - Format as Persian markdown text
    - Limit to last 20 tasks to avoid prompt bloat
    - _Requirements: 7.2_

  - [ ]* 4.2 Write property test for task context
    - **Property 7: Task Context Formatting**
    - **Validates: Requirements 7.2**
    - Test with random tasks in different states
    - Verify all tasks are included and properly grouped

  - [ ] 4.3 Integrate task context into chat flow
    - Modify `/api/chat` endpoint to load tasks before AI call
    - Append task context to system prompt
    - Ensure context is only added for Elon Musk model
    - _Requirements: 7.2, 12.1_

- [ ] 5. Checkpoint - Ensure core task logic works
  - Run all tests to verify task extraction, storage, and retrieval
  - Manually test task context building with sample data
  - Verify database operations work correctly
  - Ask the user if questions arise

- [ ] 6. Enhance Elon Musk system prompt
  - [ ] 6.1 Update system prompt with task management instructions
    - Modify `AI_MODELS['elon-musk'].systemPrompt` in `server/index.ts`
    - Add instructions for identifying tasks with [TASK: ...] format
    - Add instructions for asking clarifying questions (max 3)
    - Add instructions for following up after task completion
    - Add instructions for starting every response with emotional opening
    - Maintain existing personality traits (innovative, strategic, result-oriented)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 6.1_

  - [ ]* 6.2 Write unit tests for system prompt content
    - Verify prompt contains task identification instructions
    - Verify prompt contains clarifying question instructions
    - Verify prompt contains follow-up instructions
    - Verify prompt contains emotional opening instructions
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 7. Integrate task extraction into chat endpoint
  - [ ] 7.1 Add task extraction to response processing
    - After AI generates response, call `extractTasks()`
    - Store extracted tasks to database
    - Handle extraction errors gracefully (log but don't fail request)
    - Only extract tasks for Elon Musk model
    - _Requirements: 1.1, 2.1, 12.1_

  - [ ] 7.2 Add status detection to request processing
    - Before AI call, analyze user message with `detectStatusUpdates()`
    - Apply detected status updates to existing tasks
    - Include updated task context in prompt
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 7.3 Write integration tests for chat flow
    - Test end-to-end: user message → AI response → task extraction → storage
    - Test status detection updates existing tasks
    - Test task context is included in subsequent messages
    - _Requirements: 1.1, 3.1, 7.2_

- [ ] 8. Create API endpoints for task management
  - [ ] 8.1 Implement GET /api/chats/:chatId/tasks endpoint
    - Retrieve all tasks for a chat session
    - Validate user owns the chat (authorization)
    - Return tasks as JSON array
    - Handle errors with appropriate status codes
    - _Requirements: 10.1, 10.4, 10.5_

  - [ ]* 8.2 Write property test for task retrieval authorization
    - **Property 11: API Task Retrieval Authorization**
    - **Validates: Requirements 10.1, 10.4**
    - Test users can only access their own chat tasks
    - Test requests for other users' tasks are rejected

  - [ ] 8.3 Implement PATCH /api/tasks/:taskId endpoint
    - Update task status
    - Validate user owns the task's chat
    - Return updated task as JSON
    - Handle errors with appropriate status codes
    - _Requirements: 10.2, 10.4, 10.5_

  - [ ]* 8.4 Write property test for task status update API
    - **Property 12: API Task Status Update**
    - **Validates: Requirements 10.2, 10.5**
    - Test valid updates return 200 with updated task
    - Test invalid status values return 400

  - [ ] 8.5 Implement GET /api/chats/:chatId/tasks/stats endpoint
    - Calculate task statistics (total, pending, in_progress, completed, cancelled)
    - Validate user owns the chat
    - Return statistics as JSON
    - _Requirements: 10.3, 10.4, 10.5_

  - [ ]* 8.6 Write property test for task statistics
    - **Property 13: API Task Statistics**
    - **Validates: Requirements 10.3**
    - Test statistics match actual task counts
    - Test with random task distributions

- [ ] 9. Add database query optimizations
  - [ ] 9.1 Add database indexes
    - Add index on (chatId, status) for efficient filtering
    - Verify foreign key index on chatId exists
    - _Requirements: 9.4_

  - [ ]* 9.2 Write property tests for database operations
    - **Property 8: Cascade Delete Behavior**
    - **Validates: Requirements 9.3**
    - **Property 9: Task Querying by Filters**
    - **Validates: Requirements 9.4**
    - **Property 10: Task Update Persistence**
    - **Validates: Requirements 9.5**
    - Test cascade delete when chat is removed
    - Test filtering by chatId and status
    - Test updates persist correctly

- [ ] 10. Implement premium access enforcement
  - [ ] 10.1 Verify premium check for Elon Musk model
    - Ensure existing premium validation applies to task features
    - Test that non-premium users cannot access Elon Musk model
    - Verify Mark Zuckerberg model doesn't use task extraction
    - _Requirements: 12.1, 12.2, 12.3, 12.5_

  - [ ]* 10.2 Write property test for premium access
    - **Property 15: Premium Access Enforcement**
    - **Validates: Requirements 12.1, 12.2, 12.5**
    - Test non-premium users are rejected
    - Test premium users can access task features

- [ ] 11. Add language preservation tests
  - [ ]* 11.1 Write property test for language preservation
    - **Property 14: Language Preservation in Storage**
    - **Validates: Requirements 11.2**
    - Test task descriptions are stored without transformation
    - Test with Persian, English, and mixed-language text

- [ ] 12. Final checkpoint and deployment preparation
  - Run full test suite (unit tests and property tests)
  - Verify all 15 correctness properties pass
  - Test manually with Persian and English conversations
  - Verify emotional openings appear in responses
  - Verify task follow-ups work contextually
  - Create database migration script for production
  - Update deployment documentation if needed
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests that can be skipped for faster MVP
- Each property test should run minimum 100 iterations
- Use `fast-check` library for property-based testing in TypeScript
- All task management features are exclusive to the premium Elon Musk model
- The Mark Zuckerberg model remains unchanged
- Database migration must be run on Liara before deploying new code
- Task context is limited to 20 most recent tasks to avoid prompt bloat
- Error handling should be graceful - task extraction failures shouldn't break chat functionality
