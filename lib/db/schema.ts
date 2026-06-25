import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  index
} from 'drizzle-orm/pg-core';
import { TranscriptMessage, StructuredData } from '@/types/types';

export const sessionStatusEnum = pgEnum('session_status', ['active', 'complete']);
export const recordStatusEnum = pgEnum('record_status', ['new', 'reviewed']);

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
  attorneyId: uuid('attorney_id').references(() => attorneys.id, { onDelete: 'set null' }),
  status: sessionStatusEnum('status').notNull().default('active'),
  turnCount: integer('turn_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => [
  index('chat_sessions_firm_id_idx').on(table.firmId),
  index('chat_sessions_attorney_id_idx').on(table.attorneyId),
]);

export const chatRecords = pgTable('chat_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => chatSessions.id),
  firmId: uuid('firm_id').notNull().references(() => firms.id),
  clientName: text('client_name').notNull(),
  transcript: jsonb('transcript').$type<TranscriptMessage[]>().notNull().default([]),
  structuredData: jsonb('structured_data').$type<StructuredData>(),
  status: recordStatusEnum('status').notNull().default('new'),
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  completedAt: timestamp('completed_at', { withTimezone: true }),
}, (table) => [
  index('chat_record_firm_id_idx').on(table.firmId),
  index('chat_record_session_id_idx').on(table.sessionId),
]);