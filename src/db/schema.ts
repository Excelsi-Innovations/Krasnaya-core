import { pgTable, serial, varchar, jsonb, timestamp, boolean, text, integer } from 'drizzle-orm/pg-core';

export const scripts = pgTable('scripts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  version: varchar('version', { length: 50 }).notNull(),
  ast: jsonb('ast').notNull(), // Store the full AST JSON
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata').default('{}'), // Additional metadata (tags, categories, etc.)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const executionLogs = pgTable('execution_logs', {
  id: serial('id').primaryKey(),
  scriptId: serial('script_id').references(() => scripts.id),
  platform: varchar('platform', { length: 50 }).notNull(),
  chatId: varchar('chat_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }),
  input: text('input'),
  output: text('output'),
  status: varchar('status', { length: 50 }).notNull(), // 'success', 'error', 'pending'
  errorMessage: text('error_message'),
  executionTime: integer('execution_time'), // in milliseconds
  metadata: jsonb('metadata').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Script = typeof scripts.$inferSelect;
export type NewScript = typeof scripts.$inferInsert;
export type ExecutionLog = typeof executionLogs.$inferSelect;
export type NewExecutionLog = typeof executionLogs.$inferInsert;
