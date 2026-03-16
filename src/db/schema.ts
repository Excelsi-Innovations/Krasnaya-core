import { pgTable, serial, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const scripts = pgTable('scripts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  version: varchar('version', { length: 50 }).notNull(),
  ast: jsonb('ast').notNull(), // Store the full AST JSON
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Script = typeof scripts.$inferSelect;
export type NewScript = typeof scripts.$inferInsert;
