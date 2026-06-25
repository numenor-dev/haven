import { db } from "./db/db";
import { chatSessions, chatRecords, attorneys } from "./db/schema";
import { eq } from "drizzle-orm";
import { withFirm } from "./utils";
import {
    Message,
    ChatRecordsStatus,
    ChatRecordsListItem,
    ChatRecordsData
} from '@/types/types';

export async function getFirmIdForUser(neonAuthUserId: string): Promise<string | null> {
    const result = await db
        .select({ firmId: attorneys.firmId })
        .from(attorneys)
        .where(eq(attorneys.neonAuthUserId, neonAuthUserId))
        .limit(1);

    return result[0]?.firmId ?? null;
}

export async function getFirmChatRecords(firmId: string): Promise<ChatRecordsListItem[]> {
    return await withFirm(firmId, async (tx) => {
        const records = await tx.select().from(chatRecords);

        return records as ChatRecordsListItem[];
    });
}

export async function getChatRecordsById(
    recordId: string,
    firmId: string
): Promise<ChatRecordsData | null> {
    return await withFirm(firmId, async (tx) => {
        const rows = await tx
            .select({
                id: chatRecords.id,
                sessionId: chatRecords.sessionId,
                clientName: chatRecords.clientName,
                status: chatRecords.status,
                pdfUrl: chatRecords.pdfUrl,
                createdAt: chatRecords.createdAt,
                completedAt: chatSessions.completedAt,
                transcript: chatRecords.transcript,
                structuredData: chatRecords.structuredData,
            })
            .from(chatRecords)
            .innerJoin(chatSessions, eq(chatRecords.sessionId, chatSessions.id))
            .where(eq(chatRecords.id, recordId)) // Only checking ID, RLS checks firmId
            .limit(1);

        if (!rows[0]) return null;

        return {
            ...rows[0],
            transcript: rows[0].transcript as Message[],
            structuredData: rows[0].structuredData as Record<string, unknown> | null,
        } as ChatRecordsData;
    });
}

export async function updateChatRecordsStatus(
    recordId: string,
    firmId: string,
    status: ChatRecordsStatus
): Promise<ChatRecordsListItem | null> {
    return await withFirm(firmId, async (tx) => {
        const rows = await tx
            .update(chatRecords)
            .set({ status })
            .where(eq(chatRecords.id, recordId)) // RLS prevents updating another firm's record
            .returning();

        return rows[0] as ChatRecordsListItem ?? null;
    });
}