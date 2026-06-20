import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  index
} from 'drizzle-orm/pg-core';

export const firms = pgTable('firms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  notificationEmail: text('notification_email').notNull(),
  logoUrl: text('logo_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const attorneys = pgTable('attorneys', {
  id: uuid('id').primaryKey().defaultRandom(),
  neonAuthUserId: text('neon_auth_user_id').notNull().unique(),
  firmId: uuid('firm_id').notNull().references(() => firms.id),
  isTrialExhausted: boolean('is_trial_exhausted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index('attorneys_firm_id_idx').on(table.firmId),
]);

export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  firmId: uuid('firm_id').notNull().references(() => firms.id),
  status: text('status').notNull().default('active'), // 'active' | 'complete'
  turnCount: integer('turn_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => [
  index('chat_sessions_firm_id_idx').on(table.firmId),
]);

export const chatRecord = pgTable('chat_record', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => chatSessions.id),
  firmId: uuid('firm_id').notNull().references(() => firms.id),
  clientName: text('client_name'),
  transcript: jsonb('transcript').notNull().default([]),
  structuredData: jsonb('structured_data'),
  status: text('status').notNull().default('new'), // 'new' | 'reviewed' | 'consultation_scheduled'
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  index('chat_record_firm_id_idx').on(table.firmId),
  index('chat_record_session_id_idx').on(table.sessionId),
]);