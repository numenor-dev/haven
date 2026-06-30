import { db } from "@/lib/db/db";
import { eq } from "drizzle-orm";
import { chatRecords } from "@/lib/db/schema";
import {
    CreateChatRecord,
    CompleteChatRecord,
    ChatRecord
} from "@/types/types";
import { ChatRecordNotFoundError } from "@/lib/errors";

// Returns an un-awaited query builder so it can be composed into
// db.batch() alongside the chatSessions insert in chatSessions.ts
export function buildCreateChatRecordQuery(params: CreateChatRecord) {
  return db.insert(chatRecords).values(params).returning();
}

export async function getChatRecordBySessionId(sessionId: string): Promise<ChatRecord> {
  const [record] = await db
    .select()
    .from(chatRecords)
    .where(eq(chatRecords.sessionId, sessionId));
  if (!record) throw new ChatRecordNotFoundError(sessionId);
  return record;
}

export async function completeChatRecord(
  sessionId: string,
  params: CompleteChatRecord
): Promise<ChatRecord> {
  const [updated] = await db
    .update(chatRecords)
    .set({ ...params, completedAt: new Date() })
    .where(eq(chatRecords.sessionId, sessionId))
    .returning();
  if (!updated) throw new ChatRecordNotFoundError(sessionId);
  return updated;
}