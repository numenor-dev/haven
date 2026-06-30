import { db } from "@/lib/db/db";
import { randomUUID } from "crypto";
import { eq, sql, and } from "drizzle-orm";
import {
  FirmNotFoundError,
  AttorneyNotFoundError,
  TrialExhaustedError,
  SessionNotFoundError,
  ConcurrentSessionError
} from '@/lib/errors';
import { buildCreateChatRecordQuery } from "./chatRecords";
import { chatSessions, attorneys } from "@/lib/db/schema";
import { getFirmIdBySlug } from "@/lib/firm";
import { ChatSession } from "@/types/types";

export const maxLiveTurns = 50;
export const maxSessionDuration = 3600000;

export async function createSession(
  slug: string,
  clientName: string,
  attorneyId?: string
): Promise<ChatSession> {
  const firmId = await getFirmIdBySlug(slug);
  if (!firmId) throw new FirmNotFoundError(slug);

  if (attorneyId) {
    const [attorney] = await db
      .select({ firmId: attorneys.firmId, isTrialExhausted: attorneys.isTrialExhausted })
      .from(attorneys)
      .where(eq(attorneys.id, attorneyId));
    if (!attorney) throw new AttorneyNotFoundError(attorneyId);
    if (attorney.firmId !== firmId) throw new AttorneyNotFoundError(attorneyId);
    if (attorney.isTrialExhausted) throw new TrialExhaustedError();

    const [existingSession] = await db
      .select({ id: chatSessions.id })
      .from(chatSessions)
      .where(and(
        eq(chatSessions.attorneyId, attorneyId),
        eq(chatSessions.status, 'active'),
      ));
    if (existingSession) throw new ConcurrentSessionError(attorneyId);
  }

  const sessionId = randomUUID();

  const [[session]] = await db.batch([
    db.insert(chatSessions).values({ id: sessionId, firmId, attorneyId }).returning(),
    buildCreateChatRecordQuery({ sessionId, firmId, clientName }),
  ]);

  return session;
}

export async function getSession(id: string): Promise<ChatSession> {
  const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
  if (!session) throw new SessionNotFoundError(id);
  return session;
}

export async function incrementTurn(id: string): Promise<ChatSession> {
  const [updated] = await db
    .update(chatSessions)
    .set({ turnCount: sql`${chatSessions.turnCount} + 1` })
    .where(eq(chatSessions.id, id))
    .returning();
  if (!updated) throw new SessionNotFoundError(id);
  return updated;
}

export async function completeSession(id: string): Promise<ChatSession> {
  const session = await getSession(id);
  if (session.status === 'complete') return session;

  if (session.attorneyId) {
    const [[updated]] = await db.batch([
      db.update(chatSessions)
        .set({ status: 'complete', completedAt: new Date() })
        .where(eq(chatSessions.id, id))
        .returning(),
      db.update(attorneys)
        .set({ isTrialExhausted: true })
        .where(eq(attorneys.id, session.attorneyId)),
    ]);
    return updated;
  }

  const [updated] = await db
    .update(chatSessions)
    .set({ status: 'complete', completedAt: new Date() })
    .where(eq(chatSessions.id, id))
    .returning();
  return updated;
}

export function isSessionAtLimit(session: ChatSession): boolean {
  const elapsed = Date.now() - session.createdAt.getTime();
  return session.turnCount >= maxLiveTurns || elapsed >= maxSessionDuration;
}