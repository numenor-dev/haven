import { db } from "@/lib/db/db";
import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import {
  FirmNotFoundError,
  SessionNotFoundError,
} from '@/lib/errors';
import { buildCreateChatRecordQuery } from "./chatRecords";
import { chatSessions, firms } from "@/lib/db/schema";
import { getFirmIdBySlug } from "@/lib/firm";
import { ChatSession } from "@/types/types";

export const maxLiveTurns = 50;
export const maxSessionDuration = 3600000;

export async function createSession(
    slug: string,
    clientName: string,
): Promise<ChatSession> {
    const firmId = await getFirmIdBySlug(slug);
    if (!firmId) throw new FirmNotFoundError(slug);

    const sessionId = randomUUID();
    const [[session]] = await db.batch([
        db.insert(chatSessions).values({ id: sessionId, firmId }).returning(),
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

    const [[updated]] = await db.batch([
        db.update(chatSessions)
            .set({ status: 'complete', completedAt: new Date() })
            .where(eq(chatSessions.id, id))
            .returning(),
        db.update(firms)
            .set({ trialUsed: true })
            .where(eq(firms.id, session.firmId)),
    ]);
    return updated;
}

export function isSessionAtLimit(session: ChatSession): boolean {
  const elapsed = Date.now() - session.createdAt.getTime();
  return session.turnCount >= maxLiveTurns || elapsed >= maxSessionDuration;
}