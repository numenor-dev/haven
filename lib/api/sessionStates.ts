import { db } from "../db/db";
import { eq } from "drizzle-orm";
import {
  FirmNotFoundError,
  AttorneyNotFoundError,
  TrialExhaustedError,
  SessionNotFoundError
} from '@/lib/errors';
import { chatSessions, attorneys } from "../db/schema";
import { getFirmIdBySlug } from "../firm";
import { ChatSession } from "@/types/types";

export async function createSession(firmSlug: string, attorneyId?: string): Promise<ChatSession> {
  const firmId = await getFirmIdBySlug(firmSlug);
  if (!firmId) throw new FirmNotFoundError(firmSlug);

  if (attorneyId) {
    const [attorney] = await db
      .select({ isTrialExhausted: attorneys.isTrialExhausted })
      .from(attorneys)
      .where(eq(attorneys.id, attorneyId));
    if (!attorney) throw new AttorneyNotFoundError(attorneyId);
    if (attorney.isTrialExhausted) throw new TrialExhaustedError();
  }

  const [session] = await db.insert(chatSessions).values({ firmId, attorneyId }).returning();
  return session;
}

export async function getSession(id: string): Promise<ChatSession | null> {
  const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
  return session ?? null;
}

export async function incrementTurn(id: string): Promise<ChatSession | null> {
  const session = await getSession(id);
  if (!session) throw new SessionNotFoundError(id);

  const [updated] = await db
    .update(chatSessions)
    .set({ turnCount: session.turnCount + 1 })
    .where(eq(chatSessions.id, id))
    .returning();
  return updated;
}

export async function completeSession(id: string): Promise<ChatSession | null> {
  const session = await getSession(id);
  if (!session) throw new SessionNotFoundError(id);
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